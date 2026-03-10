"use client";

import { useState } from "react";

export default function SocialButtons({ playerId, counts }: { playerId: number; counts: Record<string, number> }) {
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [localCounts, setLocalCounts] = useState(counts);

  async function toggle(action: string) {
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId, action_type: action }),
    });
    const data = await res.json();
    if (action === "follow") { setFollowing(data.active); setLocalCounts((c) => ({ ...c, follows: c.follows + (data.active ? 1 : -1) })); }
    if (action === "like") { setLiked(data.active); setLocalCounts((c) => ({ ...c, likes: c.likes + (data.active ? 1 : -1) })); }
    if (action === "shortlist") { setShortlisted(data.active); setLocalCounts((c) => ({ ...c, shortlisted: c.shortlisted + (data.active ? 1 : -1) })); }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => toggle("follow")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${following ? "bg-psu-accent text-white border-psu-accent" : "bg-psu-navy text-psu-steel border-psu-light/30 hover:border-psu-accent/50"}`}>
        {following ? "Following" : "Follow"} ({localCounts.follows})
      </button>
      <button onClick={() => toggle("like")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${liked ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-psu-navy text-psu-steel border-psu-light/30 hover:border-red-500/30"}`}>
        {liked ? "Liked" : "Like"} ({localCounts.likes})
      </button>
      <button onClick={() => toggle("shortlist")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${shortlisted ? "bg-psu-gold/20 text-psu-gold border-psu-gold/30" : "bg-psu-navy text-psu-steel border-psu-light/30 hover:border-psu-gold/30"}`}>
        {shortlisted ? "On Board" : "+ Board"} ({localCounts.shortlisted})
      </button>
    </div>
  );
}
