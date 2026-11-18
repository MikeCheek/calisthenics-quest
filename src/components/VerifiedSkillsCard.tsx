"use client";

import { useState } from "react";
import { UserDoc, ClaimKey } from "@/lib/types";
import { syncClaims, claimCounts, claimLabel, checkSpecFor } from "@/lib/verification";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { BadgeCheck, HelpCircle, CircleDashed, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// What the athlete has claimed vs. what training has actually proven.
export default function VerifiedSkillsCard({ userDoc }: { userDoc: UserDoc }) {
  const [open, setOpen] = useState(false);
  const { tx } = useLanguage();
  const claims = syncClaims(userDoc.claims, userDoc.skills);
  const { total, verified, unconfirmed } = claimCounts(claims);
  if (total === 0) return null;
  const pct = Math.round((verified / total) * 100);
  const rank = { unconfirmed: 0, claimed: 1, verified: 2 } as const;
  const keys = (Object.keys(claims) as ClaimKey[]).sort((a, b) => rank[claims[a]!.status] - rank[claims[b]!.status]);

  return (
    <div className="panel p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <div className="text-left">
          <div className="text-sm text-zinc-100 flex items-center gap-1.5">
            <BadgeCheck size={15} className="text-emerald-400" /> {tx("Verified skills")}
          </div>
          <div className="text-xs text-muted">
            {tx("{a} of {b} proven in training", { a: verified, b: total })}
            {unconfirmed > 0 ? ` · ${tx("{n} to retest", { n: unconfirmed })}` : ""}
          </div>
        </div>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      {open && (
        <ul className="mt-3 space-y-1.5">
          {keys.map((k) => {
            const c = claims[k]!;
            const spec = checkSpecFor(k, c.value);
            const what = typeof c.value === "number" ? `${c.value}` : STAGE_LABEL[c.value] ?? c.value;
            return (
              <li key={k} className="flex items-center gap-2 text-sm">
                {c.status === "verified" ? (
                  <BadgeCheck size={14} className="text-emerald-400 shrink-0" />
                ) : c.status === "unconfirmed" ? (
                  <HelpCircle size={14} className="text-orange-400 shrink-0" />
                ) : (
                  <CircleDashed size={14} className="text-muted shrink-0" />
                )}
                <span className="text-zinc-200 truncate">{tx(claimLabel(k))}</span>
                <span className="text-xs text-muted ml-auto shrink-0">
                  {tx(String(what))}
                  {spec?.kind === "hold" ? ` · ${spec.target}s` : ""} ·{" "}
                  {tx(c.status === "verified" ? "verified" : c.status === "unconfirmed" ? "retest" : "claimed")}
                </span>
              </li>
            );
          })}
          <li className="text-xs text-muted pt-1">
            {tx("Each session includes one Skill Check for something you claimed — and regular sets that hit a claimed target count too.")}
          </li>
        </ul>
      )}
    </div>
  );
}
