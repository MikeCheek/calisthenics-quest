"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import { pathChapters, nodeUnlocked, PathNode } from "@/lib/levelPath";
import { SKILL_FIELD_LABEL } from "@/lib/types";
import { STAGE_LABEL } from "@/lib/stageOrder";
import { xpProgress } from "@/lib/xp";
import { Sparkle, Check, MapPin, Dumbbell, Hash } from "lucide-react";

export default function PathPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const currentNodeRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
    else if (userDoc && !userDoc.onboarded) router.replace("/onboarding");
  }, [loading, user, userDoc, router]);

  useEffect(() => {
    if (hasScrolled || !userDoc || !currentNodeRef.current) return;
    currentNodeRef.current.scrollIntoView({ block: "center" });
    setHasScrolled(true);
  }, [userDoc, hasScrolled]);

  if (loading || !userDoc) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  const level = xpProgress(userDoc.xp).level;
  const chapters = [...pathChapters()].reverse(); // highest chapter first -> level 1 ends up at the bottom

  return (
    <>
      <Nav />
      <main className="max-w-xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        <div className="mb-4">
          <h1 className="heading text-2xl text-zinc-100">Trophy road</h1>
          <p className="text-zinc-400 text-sm">
            A loose guide, not a checklist — roughly what tends to be within reach at each level.
            You&apos;re level {level}. Scroll up for what&apos;s ahead, down for what you&apos;ve passed.
          </p>
        </div>

        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-zinc-800" />
          {chapters.map((chapter) => (
            <div key={chapter.title} className="mb-2">
              <div className="sticky top-14 z-10 -ml-6 mb-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs heading ${
                    level >= chapter.minLevel
                      ? "bg-orange-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {chapter.title} · Lv {chapter.minLevel}
                  {Number.isFinite(chapter.maxLevel) ? `–${chapter.maxLevel}` : "+"}
                </div>
                <div className="text-xs text-zinc-500 mt-1 ml-1 max-w-xs">{chapter.blurb}</div>
              </div>

              <div className="space-y-3">
                {[...chapter.nodes].reverse().map((node) => (
                  <PathNodeCard
                    key={node.level + node.title}
                    node={node}
                    unlocked={nodeUnlocked(node, level)}
                    isCurrent={node.level === level}
                    refProp={node.level === level ? currentNodeRef : undefined}
                  />
                ))}
                {chapter.nodes.length === 0 && (
                  <div className="text-xs text-zinc-600 pl-2 pb-2">Keep going — more ahead.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

function PathNodeCard({
  node,
  unlocked,
  isCurrent,
  refProp,
}: {
  node: PathNode;
  unlocked: boolean;
  isCurrent: boolean;
  refProp?: React.RefObject<HTMLDivElement>;
}) {
  const stageLabel = node.stage ? STAGE_LABEL[node.stage] ?? node.stage : null;
  const skillLabel = node.skill ? SKILL_FIELD_LABEL[node.skill] : null;

  return (
    <div ref={refProp} className="relative flex items-start gap-3">
      <div
        className={`absolute -left-6 top-1 w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center ${
          unlocked
            ? "bg-emerald-500 border-emerald-500"
            : isCurrent
            ? "bg-orange-500 border-orange-500 animate-flame-pulse"
            : "bg-zinc-900 border-zinc-700"
        }`}
      >
        {unlocked ? (
          <Check size={12} className="text-zinc-950" />
        ) : (
          <Sparkle size={11} className="text-zinc-600" />
        )}
      </div>

      <div
        className={`flex-1 panel p-3 ${
          isCurrent ? "border-orange-500 animate-golden-glow" : unlocked ? "border-emerald-800" : "border-zinc-800"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            {node.isStat ? <Hash size={11} /> : <Dumbbell size={11} />}
            Around level {node.level}
            {isCurrent && (
              <span className="flex items-center gap-0.5 text-orange-400 ml-1">
                <MapPin size={11} /> you are here
              </span>
            )}
          </div>
        </div>
        <div className={`text-sm font-medium mt-0.5 ${unlocked ? "text-zinc-100" : "text-zinc-400"}`}>
          {node.title}
        </div>
        {skillLabel && stageLabel && (
          <div className="text-xs text-zinc-500 mt-0.5">
            {skillLabel} — {stageLabel}
          </div>
        )}
      </div>
    </div>
  );
}
