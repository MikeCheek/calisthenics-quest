// Writes Lighthouse CI's results as a table to the GitHub Actions run
// summary: the median score per page and category, and a link to each full
// report. Run after `lhci autorun` (reads .lighthouseci/).
import { readFileSync, appendFileSync, existsSync, readdirSync } from "node:fs";

const dir = ".lighthouseci";
const reports = existsSync(dir) ? readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)) : [];
if (!reports.length) {
  console.log("No Lighthouse results found.");
  process.exit(0);
}
// every run, grouped by page; the representative one is the median by performance
const byUrl = new Map();
for (const f of reports) {
  const lhr = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
  const url = lhr.requestedUrl ?? lhr.finalDisplayedUrl;
  const summary = Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, c.score]));
  byUrl.set(url, [...(byUrl.get(url) ?? []), { url, summary }]);
}
const manifest = [...byUrl.values()].map((runs) => {
  const sorted = [...runs].sort((a, b) => (a.summary.performance ?? 0) - (b.summary.performance ?? 0));
  return { ...sorted[Math.floor((sorted.length - 1) / 2)], isRepresentativeRun: true };
});
const links = existsSync(`${dir}/links.json`) ? JSON.parse(readFileSync(`${dir}/links.json`, "utf8")) : {};
const CATS = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["best-practices", "Best practices"],
  ["seo", "SEO"],
];
const icon = (s) => (s >= 0.9 ? "🟢" : s >= 0.5 ? "🟠" : "🔴");

const rows = manifest
  .filter((r) => r.isRepresentativeRun)
  .map((r) => {
    const path = new URL(r.url).pathname;
    const cells = CATS.map(([k]) => {
      const s = r.summary[k];
      return s === undefined ? "–" : `${icon(s)} ${Math.round(s * 100)}`;
    });
    const link = links[r.url] ? `[report](${links[r.url]})` : "";
    return `| \`${path}\` | ${cells.join(" | ")} | ${link} |`;
  });

const md = [
  "## Lighthouse",
  "",
  `| Page | ${CATS.map(([, l]) => l).join(" | ")} | |`,
  `| --- | ${CATS.map(() => "---").join(" | ")} | --- |`,
  ...rows,
  "",
  "Median of the runs, mobile. Accessibility and SEO below 95 fail the check; performance and best practices are reported only (shared CI machines vary).",
  "",
].join("\n");

console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
