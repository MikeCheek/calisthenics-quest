// ---------------------------------------------------------------------------
// Minimal Firestore REST access for server routes, as the service account
// (googleAuth.ts) — only what push needs: read a document, update a few
// fields, and list users with reminders on. Values are converted to and
// from Firestore's typed JSON ({ stringValue: "…" } etc.).
// ---------------------------------------------------------------------------

type Value =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: Value[] } }
  | { mapValue: { fields?: Record<string, Value> } };

export function decodeValue(v: Value): unknown {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("stringValue" in v) return v.stringValue;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(decodeValue);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields ?? {});
  return undefined;
}

export function decodeFields(fields: Record<string, Value>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]));
}

export function encodeValue(v: unknown): Value {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, encodeValue(x)])) } };
}

export class FirestoreRest {
  constructor(
    private projectId: string,
    private token: () => Promise<string>,
    private fetchImpl: typeof fetch = fetch
  ) {}

  private get base() {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  private async call(url: string, init: RequestInit = {}): Promise<Response> {
    return this.fetchImpl(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${await this.token()}`, "Content-Type": "application/json" } });
  }

  // null when the document doesn't exist
  async get(path: string): Promise<Record<string, unknown> | null> {
    const res = await this.call(`${this.base}/${path}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`firestore get ${res.status}`);
    const doc = (await res.json()) as { fields?: Record<string, Value> };
    return decodeFields(doc.fields ?? {});
  }

  // Sets only the given (dotted) field paths, leaving the rest alone.
  async update(path: string, values: Record<string, unknown>): Promise<void> {
    const mask = Object.keys(values).map((p) => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join("&");
    // nested "a.b" paths become nested maps in the body
    const body: Record<string, unknown> = {};
    for (const [p, v] of Object.entries(values)) {
      const parts = p.split(".");
      let node = body;
      parts.slice(0, -1).forEach((k) => (node = (node[k] = (node[k] as Record<string, unknown>) ?? {}) as Record<string, unknown>));
      node[parts[parts.length - 1]] = v;
    }
    const fields = (encodeValue(body) as { mapValue: { fields: Record<string, Value> } }).mapValue.fields;
    const res = await this.call(`${this.base}/${path}?${mask}&currentDocument.exists=true`, { method: "PATCH", body: JSON.stringify({ fields }) });
    if (!res.ok) throw new Error(`firestore update ${res.status}`);
  }

  // Users with reminders switched on, in pages (ids + fields).
  async *usersWithReminders(pageSize = 300): AsyncGenerator<{ id: string; data: Record<string, unknown> }> {
    let after: string | null = null;
    for (;;) {
      const structuredQuery: Record<string, unknown> = {
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "notifications.enabled" }, op: "EQUAL", value: { booleanValue: true } } },
        orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }],
        limit: pageSize,
        ...(after ? { startAt: { values: [{ referenceValue: after }], before: false } } : {}),
      };
      const res = await this.call(`${this.base}:runQuery`, { method: "POST", body: JSON.stringify({ structuredQuery }) });
      if (!res.ok) throw new Error(`firestore query ${res.status}`);
      const rows = (await res.json()) as { document?: { name: string; fields?: Record<string, Value> } }[];
      const docs = rows.filter((r) => r.document).map((r) => r.document!);
      for (const d of docs) yield { id: d.name.split("/").pop()!, data: decodeFields(d.fields ?? {}) };
      if (docs.length < pageSize) return;
      after = docs[docs.length - 1].name;
    }
  }
}
