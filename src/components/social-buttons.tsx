"use client";

import { useState } from "react";

interface SocialButtonsProps {
  driverId: number;
  counts: Record<string, number>;
}

export default function SocialButtons({ driverId, counts }: SocialButtonsProps) {
  const [localCounts, setLocalCounts] = useState(counts);
  const [active, setActive] = useState<Record<string, boolean>>({});

  async function toggle(type: string) {
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: driverId, action_type: type }),
    });
    if (res.ok) {
      const { active: isActive } = await res.json();
      setActive((p) => ({ ...p, [type]: isActive }));
      setLocalCounts((p) => ({ ...p, [type === "follow" ? "follows" : type === "like" ? "likes" : "shortlisted"]: p[type === "follow" ? "follows" : type === "like" ? "likes" : "shortlisted"] + (isActive ? 1 : -1) }));
    }
  }

  return (
    <div className="flex gap-2">
      {[
        { type: "follow", label: "Follow", count: localCounts.follows, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { type: "like", label: "Like", count: localCounts.likes, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
        { type: "shortlist", label: "+ Board", count: localCounts.shortlisted, icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
      ].map((btn) => (
        <button
          key={btn.type}
          onClick={() => toggle(btn.type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            active[btn.type]
              ? "bg-haas-red/20 border-haas-red/50 text-haas-red"
              : "bg-haas-gray border-haas-light/30 text-haas-silver hover:border-haas-red/30 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={active[btn.type] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={btn.icon} />
          </svg>
          {btn.label}
          {btn.count > 0 && <span className="text-[10px] opacity-70">({btn.count})</span>}
        </button>
      ))}
    </div>
  );
}
