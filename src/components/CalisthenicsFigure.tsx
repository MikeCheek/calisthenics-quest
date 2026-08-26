"use client";

// Lightweight looping SVG animation of a figure on a bar — pure CSS keyframes,
// no image/video assets. Respects prefers-reduced-motion globally.
export default function CalisthenicsFigure({
  move = "pullup",
  className = "",
}: {
  move?: "pullup" | "lever" | "flag";
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <svg viewBox="0 0 160 120" width="140" height="105" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* bar */}
        <line x1="20" y1="18" x2="140" y2="18" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
        <line x1="20" y1="18" x2="20" y2="30" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
        <line x1="140" y1="18" x2="140" y2="30" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />

        {move === "pullup" && (
          <g className="cf-pullup" style={{ transformOrigin: "80px 18px" }}>
            {/* arms */}
            <line x1="70" y1="18" x2="80" y2="44" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="90" y1="18" x2="80" y2="44" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
            {/* torso */}
            <line x1="80" y1="44" x2="80" y2="78" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round" />
            {/* head */}
            <circle cx="80" cy="36" r="7" fill="#e4e4e7" />
            {/* legs */}
            <line x1="80" y1="78" x2="72" y2="104" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="80" y1="78" x2="88" y2="104" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {move === "lever" && (
          <g>
            <line x1="80" y1="18" x2="80" y2="30" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="80" cy="12" r="7" fill="#e4e4e7" />
            <g className="cf-lever" style={{ transformOrigin: "80px 30px" }}>
              <line x1="80" y1="30" x2="130" y2="30" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round" />
              <line x1="112" y1="30" x2="130" y2="22" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="112" y1="30" x2="130" y2="38" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {move === "flag" && (
          <g>
            <line x1="80" y1="6" x2="80" y2="112" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
            <g className="cf-flag" style={{ transformOrigin: "80px 40px" }}>
              <circle cx="80" cy="34" r="6" fill="#e4e4e7" />
              <line x1="80" y1="40" x2="80" y2="46" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="80" y1="46" x2="118" y2="52" stroke="#e4e4e7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="118" y1="52" x2="130" y2="46" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
              <line x1="118" y1="52" x2="130" y2="58" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>

      <style jsx>{`
        .cf-pullup {
          animation: cfPullup 2.2s ease-in-out infinite;
        }
        @keyframes cfPullup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .cf-lever {
          animation: cfLever 3s ease-in-out infinite;
        }
        @keyframes cfLever {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        .cf-flag {
          animation: cfFlag 2.6s ease-in-out infinite;
        }
        @keyframes cfFlag {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
