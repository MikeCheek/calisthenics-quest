import { ImageResponse } from "next/og";

// The picture shown when a link to BarQuests is shared (chats, social posts,
// search results). Generated once at build time.
export const alt = "BarQuests — Your Calisthenics Journey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKILLS = ["Front lever", "Planche", "Muscle-up", "Handstand"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 60%, #2a1405 100%)",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* the ▲ logo, drawn rather than typed: no font download at build */}
          <svg width="96" height="84" viewBox="0 0 96 84">
            <path d="M48 0 L96 84 L0 84 Z" fill="#fb923c" />
          </svg>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -2 }}>BarQuests</div>
        </div>
        <div style={{ fontSize: 52, color: "#fdba74", marginTop: 16 }}>Your calisthenics journey</div>
        <div style={{ fontSize: 30, color: "#a1a1aa", marginTop: 20, maxWidth: 900 }}>
          Personalised workouts for the outdoor bars — XP, streaks and challenges with friends.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {SKILLS.map((s) => (
            <div
              key={s}
              style={{ fontSize: 26, padding: "10px 22px", borderRadius: 999, border: "2px solid #3f3f46", color: "#e4e4e7" }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
