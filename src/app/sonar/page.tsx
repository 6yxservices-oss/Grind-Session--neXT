"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type SonarMode = "query" | "report" | "compare" | "briefing";

interface SonarResult {
  type: string;
  content: string;
  model: string;
  timestamp: string;
  tokens_used?: number;
}

export default function SonarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SonarMode>("query");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SonarResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SonarResult[]>([]);

  // Form refs
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const driverIdRef = useRef<HTMLInputElement>(null);
  const compareIdsRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res: Response;

      switch (mode) {
        case "query":
          res = await fetch("/api/sonar/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: queryRef.current?.value }),
          });
          break;
        case "report":
          res = await fetch("/api/sonar/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driver_id: driverIdRef.current?.value, type: "report" }),
          });
          break;
        case "compare":
          const ids = compareIdsRef.current?.value
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n));
          res = await fetch("/api/sonar/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driver_ids: ids }),
          });
          break;
        case "briefing":
          res = await fetch("/api/sonar/briefing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          break;
        default:
          throw new Error("Invalid mode");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 10));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const modes: { key: SonarMode; label: string; icon: string; desc: string }[] = [
    { key: "query", label: "QUERY", icon: "~", desc: "Ask anything about drivers" },
    { key: "report", label: "REPORT", icon: "#", desc: "AI scouting report" },
    { key: "compare", label: "COMPARE", icon: "<>", desc: "Head-to-head analysis" },
    { key: "briefing", label: "BRIEFING", icon: "!", desc: "Market intelligence" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-haas-red to-haas-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">{`{S}`}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sonar Intelligence</h1>
              <p className="text-sm text-haas-silver">Powered by Claude &middot; Anthropic AI</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/30">
            ONLINE
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-haas-dark text-haas-silver border border-haas-gray/30">
            claude-sonnet-4
          </span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-4 gap-3">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setResult(null); setError(null); }}
            className={`p-4 rounded-lg border text-left transition-all ${
              mode === m.key
                ? "bg-haas-red/20 border-haas-red text-white"
                : "bg-haas-dark border-haas-gray/30 text-haas-silver hover:border-haas-gray/60"
            }`}
          >
            <div className="font-mono text-lg mb-1">{m.icon}</div>
            <div className="font-bold text-sm">{m.label}</div>
            <div className="text-xs opacity-70 mt-1">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-4">
          {mode === "query" && (
            <div>
              <label className="block text-sm font-medium text-haas-silver mb-2">
                Ask Sonar
              </label>
              <textarea
                ref={queryRef}
                rows={3}
                className="input w-full font-mono"
                placeholder="Who is the most F1-ready driver in F2 right now? Compare their super license points and recent form..."
                required
              />
              <p className="text-xs text-haas-gray mt-1">
                Ask any question about drivers, performance, market status, or F1 readiness
              </p>
            </div>
          )}

          {mode === "report" && (
            <div>
              <label className="block text-sm font-medium text-haas-silver mb-2">
                Driver ID
              </label>
              <input
                ref={driverIdRef}
                type="number"
                className="input w-full font-mono"
                placeholder="Enter driver ID (e.g., 1)"
                min={1}
                required
              />
              <p className="text-xs text-haas-gray mt-1">
                Generates a full AI scouting evaluation with grades, strengths, and F1 projection
              </p>
            </div>
          )}

          {mode === "compare" && (
            <div>
              <label className="block text-sm font-medium text-haas-silver mb-2">
                Driver IDs (comma-separated)
              </label>
              <input
                ref={compareIdsRef}
                type="text"
                className="input w-full font-mono"
                placeholder="1, 2, 3"
                required
              />
              <p className="text-xs text-haas-gray mt-1">
                Compare 2-4 drivers head-to-head across all dimensions
              </p>
            </div>
          )}

          {mode === "briefing" && (
            <div className="text-center py-4">
              <div className="text-haas-silver">
                Generate a classified market intelligence briefing covering all drivers,
                market movements, and actionable recommendations for team principals.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-pulse">///</span>
                <span>Sonar is analyzing...</span>
              </>
            ) : (
              <>
                <span>{`{S}`}</span>
                <span>
                  {mode === "query" && "Query Intelligence"}
                  {mode === "report" && "Generate Report"}
                  {mode === "compare" && "Run Comparison"}
                  {mode === "briefing" && "Generate Briefing"}
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="card border-red-500/50 bg-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-red-400 font-mono text-lg">!</span>
            <div>
              <div className="font-bold text-red-400">Sonar Error</div>
              <div className="text-sm text-red-300 mt-1">{error}</div>
              {error.includes("ANTHROPIC_API_KEY") && (
                <div className="text-xs text-haas-gray mt-2">
                  Set the ANTHROPIC_API_KEY environment variable to enable Sonar Intelligence.
                  Get your key at console.anthropic.com
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-mono bg-haas-red/20 text-haas-red border border-haas-red/30 uppercase">
                {result.type}
              </span>
              <span className="text-xs text-haas-gray font-mono">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <span className="text-xs text-haas-gray font-mono">{result.model}</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-haas-light leading-relaxed font-mono text-sm">
              {result.content}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-bold text-haas-silver mb-3">Session History</h3>
          <div className="space-y-2">
            {history.slice(1).map((h, i) => (
              <button
                key={i}
                onClick={() => setResult(h)}
                className="w-full text-left p-3 rounded bg-haas-dark/50 border border-haas-gray/20 hover:border-haas-gray/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-haas-red uppercase">{h.type}</span>
                  <span className="text-xs text-haas-gray font-mono">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-haas-silver mt-1 truncate">
                  {h.content.slice(0, 120)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-sm font-bold text-haas-silver mb-3">Quick Queries</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Who has the most super license points?",
            "Which driver is most likely to get an F1 seat?",
            "Compare the top 3 F2 drivers",
            "What drivers are available for the Haas seat?",
            "Rank drivers by wet weather ability",
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                setMode("query");
                if (queryRef.current) queryRef.current.value = q;
              }}
              className="px-3 py-1.5 rounded-full text-xs bg-haas-dark border border-haas-gray/30 text-haas-silver hover:border-haas-red/50 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Architecture Info */}
      <div className="card bg-gradient-to-br from-haas-dark to-haas-black border-haas-gray/20">
        <div className="text-center space-y-3">
          <div className="font-mono text-haas-red text-sm">SONAR INTELLIGENCE v1.0</div>
          <div className="text-xs text-haas-gray space-y-1">
            <p>Built with Anthropic Claude API &middot; Prompt Engineering &middot; Tool Use</p>
            <p>Agentic Loop Pattern &middot; Structured Output &middot; XML Context Injection</p>
            <p className="text-haas-silver mt-2">
              Skilljar Foundations: Messages API, System Prompts, Tool Use, Prompt Caching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
