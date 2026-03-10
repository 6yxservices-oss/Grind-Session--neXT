"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DriverOption { id: number; name: string; }
interface LeaderboardEntry { driver_id: number; driver_name: string; nationality: string; current_series: string; rating: number; votes: number; }

export default function VotePage() {
  const [tab, setTab] = useState<"haas" | "alpine">("haas");
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then(setDrivers);
  }, []);

  useEffect(() => {
    fetch(`/api/vote?team=${tab}`).then((r) => r.json()).then((d) => setLeaderboard(d.leaderboard));
  }, [tab]);

  async function handleVote() {
    if (!selectedDriver) return;
    setVoting(true);
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: selectedDriver, target_team: tab }),
    });
    const res = await fetch(`/api/vote?team=${tab}`);
    const data = await res.json();
    setLeaderboard(data.leaderboard);
    setVoting(false);
    setSelectedDriver(null);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">FAN VOTE</h1>
        <p className="text-gray-400">Who should get a shot to try out for an F1 seat? You decide.</p>
        <p className="text-alpine-pink text-sm">+100 RISE+ points per vote</p>
      </div>

      {/* Team Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTab("haas")}
          className={`p-4 rounded-xl border-2 text-center transition-all ${tab === "haas" ? "border-haas-red bg-haas-red/10" : "border-haas-light/30 hover:border-haas-red/30"}`}
        >
          <div className="text-2xl font-bold text-haas-red">HAAS neXT</div>
          <div className="text-xs text-haas-silver mt-1">Vote for a Haas F1 tryout</div>
        </button>
        <button
          onClick={() => setTab("alpine")}
          className={`p-4 rounded-xl border-2 text-center transition-all ${tab === "alpine" ? "border-alpine-blue bg-alpine-blue/10" : "border-haas-light/30 hover:border-alpine-blue/30"}`}
        >
          <div className="text-2xl font-bold text-alpine-blue">ALPINE neXT</div>
          <div className="text-xs text-haas-silver mt-1">Vote for an Alpine F1 tryout</div>
        </button>
      </div>

      {/* Vote Form */}
      <div className="card">
        <h2 className="font-semibold mb-4">Cast Your Vote for {tab === "haas" ? "Haas" : "Alpine"} neXT</h2>
        <div className="flex gap-3">
          <select
            value={selectedDriver || ""}
            onChange={(e) => setSelectedDriver(e.target.value ? parseInt(e.target.value) : null)}
            className="select flex-1"
          >
            <option value="">Select a driver...</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button
            onClick={handleVote}
            disabled={!selectedDriver || voting}
            className={`font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50 ${
              tab === "haas" ? "bg-haas-red hover:bg-haas-red/80 text-white" : "bg-alpine-blue hover:bg-alpine-blue/80 text-white"
            }`}
          >
            {voting ? "Voting..." : "Vote"}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="font-semibold mb-4">
          {tab === "haas" ? "Haas" : "Alpine"} neXT Leaderboard
        </h2>
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <div key={entry.driver_id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? (tab === "haas" ? "bg-haas-red text-white" : "bg-alpine-blue text-white") :
                    i === 1 ? "bg-haas-silver/20 text-haas-silver" :
                    i === 2 ? "bg-yellow-600/20 text-yellow-500" :
                    "bg-haas-gray text-gray-400"
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <Link href={`/drivers/${entry.driver_id}`} className="font-medium hover:text-haas-red">{entry.driver_name}</Link>
                    <div className="text-xs text-gray-500">{entry.current_series} &middot; {entry.nationality} &middot; {"★".repeat(entry.rating)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${tab === "haas" ? "text-haas-red" : "text-alpine-blue"}`}>{entry.votes}</div>
                  <div className="text-[10px] text-gray-500">votes</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No votes cast yet. Be the first!</p>
          </div>
        )}
      </div>

      {/* RISE+ Integration */}
      <div className={`card text-center space-y-3 ${tab === "alpine" ? "alpine-gradient border-alpine-pink/20" : "haas-gradient border-haas-red/20"}`}>
        <div className={`text-lg font-bold ${tab === "alpine" ? "text-alpine-pink" : "text-haas-red"}`}>
          {tab === "alpine" ? "RISE+" : "HAAS neXT"} Fan Experience
        </div>
        <p className="text-sm text-haas-silver">
          Your votes shape the future of F1. The top-voted driver will receive an official test day invitation.
          Every vote earns you RISE+ points toward paddock passes, signed merch, and VIP experiences.
        </p>
        <div className="text-alpine-cyan text-xs font-bold">alpinef1.com | haasf1team.com</div>
      </div>
    </div>
  );
}
