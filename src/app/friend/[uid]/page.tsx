"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import SkillRadarChart from "@/components/SkillRadarChart";
import SkillWall from "@/components/SkillWall";
import { fetchPublicProfile } from "@/lib/store";
import { PublicProfile } from "@/lib/types";
import { rankTitle } from "@/lib/xp";
import { ChevronLeft, Flame, Dumbbell } from "lucide-react";

export default function FriendProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    fetchPublicProfile(params.uid).then(setProfile);
  }, [authLoading, user, params.uid, router]);

  if (authLoading || profile === undefined) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</main>;
  }

  if (profile === null) {
    return (
      <>
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6">
          <button onClick={() => router.back()} className="text-sm text-zinc-400 flex items-center gap-1 mb-4">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="panel p-6 text-center text-zinc-400 text-sm">
            Couldn&apos;t find that athlete&apos;s profile.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-6 space-y-5">
        <button onClick={() => router.back()} className="text-sm text-zinc-400 flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl heading text-zinc-300 shrink-0 overflow-hidden">
            {profile.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              profile.displayName?.[0]?.toUpperCase() ?? "?"
            )}
          </div>
          <div>
            <h1 className="heading text-2xl text-zinc-100">{profile.displayName}</h1>
            <p className="text-zinc-400 text-sm">
              Level {profile.level} · {rankTitle(profile.level)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="panel p-3 text-center">
            <div className="stat-mono text-xl text-orange-400 flex items-center justify-center gap-1">
              <Flame size={16} /> {profile.streak}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">day streak</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="stat-mono text-xl text-orange-400 flex items-center justify-center gap-1">
              <Dumbbell size={16} /> {profile.totalSessionsCompleted}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">sessions</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="stat-mono text-xl text-orange-400">{profile.xp}</div>
            <div className="text-xs text-zinc-500 mt-0.5">total XP</div>
          </div>
        </div>

        <div className="panel p-4">
          <div className="heading text-base text-zinc-100 mb-2">Skill radar</div>
          <SkillRadarChart skills={profile.skills} />
        </div>

        <SkillWall skills={profile.skills} mastery={profile.skillMastery} playerLevel={profile.level} />

        <p className="text-xs text-zinc-600 text-center">
          Read-only — this is what {profile.displayName.split(" ")[0]} looks like to friends.
        </p>
      </main>
    </>
  );
}
