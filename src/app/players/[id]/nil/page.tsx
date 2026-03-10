"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface PlayerInfo {
  id: number;
  name: string;
}

interface MerchItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ContractInfo {
  id: number;
  contract_status: string;
  signed_at: string;
  revenue_split_player: number;
  revenue_split_collective: number;
}

const MERCH_CATALOG = [
  { name: "Player Beanie", price: 30, category: "Headwear" },
  { name: "Pinstripe Trucker Hat", price: 30, category: "Headwear" },
  { name: "Foam Trucker Hat", price: 30, category: "Headwear" },
  { name: "Player Name Tee", price: 40, category: "Apparel" },
  { name: "Performance Hoodie", price: 65, category: "Apparel" },
  { name: "Player Jersey Tee", price: 40, category: "Apparel" },
  { name: "Autographed Mini Helmet", price: 85, category: "Collectibles" },
  { name: "Signed Photo Print", price: 25, category: "Collectibles" },
];

export default function NilContractPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = parseInt(params.id as string);

  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [step, setStep] = useState<"loading" | "contract" | "active">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/players`).then((r) => r.json()),
      fetch(`/api/nil-contracts?player_id=${playerId}`).then((r) => r.json()),
    ]).then(([players, contractRes]) => {
      const p = players.find((pl: PlayerInfo) => pl.id === playerId);
      setPlayer(p || null);
      if (contractRes.contract) {
        setContract(contractRes.contract);
        setStep("active");
      } else {
        setStep("contract");
      }
    });
  }, [playerId]);

  async function handleSign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      player_id: playerId,
      player_legal_name: form.get("legal_name"),
      player_email: form.get("email"),
      digital_signature: form.get("signature"),
    };
    try {
      const res = await fetch("/api/nil-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign");
      }
      const data = await res.json();
      setContract({ id: data.id, contract_status: "active", signed_at: new Date().toISOString(), revenue_split_player: 70, revenue_split_collective: 30 });
      setStep("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign contract");
      setSubmitting(false);
    }
  }

  if (step === "loading") return <div className="text-gray-500 text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/players/${playerId}`} className="text-sm text-gray-400 hover:text-gray-200 inline-block">
        &larr; Back to Player Profile
      </Link>

      {/* ─── Active NIL Store ─── */}
      {step === "active" && contract && (
        <>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              NIL Licensing Agreement Active
            </div>
            <h1 className="text-3xl font-bold">{player?.name} NIL Merch Store</h1>
            <p className="text-gray-400">
              Every purchase supports <span className="text-psu-accent font-medium">{player?.name}</span> directly &mdash; {contract.revenue_split_player}% to the player, {contract.revenue_split_collective}% to the collective
            </p>
          </div>

          {/* Revenue Split Visual */}
          <div className="card">
            <h2 className="font-semibold mb-3">How Your Purchase Helps</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div className="bg-psu-accent" style={{ width: `${contract.revenue_split_player}%` }} />
                  <div className="bg-psu-gold" style={{ width: `${contract.revenue_split_collective}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-psu-accent">{contract.revenue_split_player}% to {player?.name}</span>
                  <span className="text-psu-gold">{contract.revenue_split_collective}% to HVU Collective</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Powered by Happy Valley United &middot; Non-exclusive licensing agreement &middot; All proceeds support Penn State NIL initiatives
            </p>
          </div>

          {/* Merch Grid - HVU Style */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Shop {player?.name}&apos;s Collection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MERCH_CATALOG.map((item, i) => (
                <div key={i} className="card hover:border-psu-accent/50 transition-colors cursor-pointer group">
                  <div className="aspect-square bg-psu-blue rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:bg-psu-accent/10 transition-colors">
                    {item.category === "Headwear" ? "🧢" : item.category === "Collectibles" ? "🏈" : "👕"}
                  </div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-psu-gold font-bold text-lg mt-1">${item.price.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{item.category}</div>
                  <button className="btn-primary w-full mt-3 text-xs py-2">
                    Buy Now &mdash; Support {player?.name?.split(" ")[1]}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-psu-navy border-psu-accent/20 text-center space-y-3">
            <div className="text-2xl font-bold">Support Penn State Recruiting</div>
            <p className="text-gray-400">
              Every purchase drives NIL revenue to recruits AND the Happy Valley United collective.
              Help us build the best recruiting class in Penn State history.
            </p>
            <div className="text-psu-gold font-semibold text-sm">WE ARE PENN STATE</div>
          </div>
        </>
      )}

      {/* ─── Contract Signing ─── */}
      {step === "contract" && (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Activate Your NIL Merch Store</h1>
            <p className="text-gray-400">
              {player?.name} &mdash; Sign a non-exclusive licensing agreement to launch your personal merch store
            </p>
          </div>

          <div className="card bg-psu-blue/50 border-psu-accent/20 space-y-3">
            <h2 className="font-semibold text-psu-accent">How It Works</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl mb-1">1</div>
                <div className="font-medium">Sign Agreement</div>
                <div className="text-xs text-gray-500 mt-1">Non-exclusive licensing. Keep all your other deals.</div>
              </div>
              <div>
                <div className="text-2xl mb-1">2</div>
                <div className="font-medium">Store Goes Live</div>
                <div className="text-xs text-gray-500 mt-1">Beanies, truckers, tees &amp; more with your name.</div>
              </div>
              <div>
                <div className="text-2xl mb-1">3</div>
                <div className="font-medium">Get Paid</div>
                <div className="text-xs text-gray-500 mt-1">70% to you, 30% to HVU collective. Monthly payouts.</div>
              </div>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">{error}</div>}

          <form onSubmit={handleSign} className="space-y-6">
            {/* Contract Terms */}
            <div className="card space-y-4">
              <h2 className="font-semibold">Non-Exclusive NIL Licensing Agreement</h2>
              <div className="bg-psu-dark rounded-lg p-4 text-xs text-gray-300 max-h-64 overflow-y-auto space-y-3 font-mono">
                <p className="font-bold text-white">HAPPY VALLEY UNITED NIL LICENSING AGREEMENT</p>
                <p>This Non-Exclusive Licensing Agreement (&ldquo;Agreement&rdquo;) is entered into between the undersigned student-athlete (&ldquo;Licensor&rdquo;) and Happy Valley United LLC (&ldquo;Licensee&rdquo;), a Penn State NIL collective.</p>
                <p><strong>1. GRANT OF LICENSE.</strong> Licensor hereby grants to Licensee a non-exclusive, revocable license to use Licensor&apos;s name, image, and likeness (&ldquo;NIL&rdquo;) in connection with the production, marketing, and sale of merchandise (&ldquo;Licensed Products&rdquo;) through the HVU Insider platform and affiliated retail channels.</p>
                <p><strong>2. NON-EXCLUSIVE.</strong> This license is non-exclusive. Licensor retains all rights to enter into separate NIL agreements with any other party. This Agreement does not restrict Licensor&apos;s ability to use their own NIL independently.</p>
                <p><strong>3. COMPENSATION.</strong> Licensor shall receive seventy percent (70%) of net revenue generated from the sale of Licensed Products bearing Licensor&apos;s NIL. Licensee shall retain thirty percent (30%) of net revenue to support collective operations and Penn State NIL initiatives.</p>
                <p><strong>4. LICENSED PRODUCTS.</strong> Licensed Products may include, but are not limited to: apparel (t-shirts, hoodies), headwear (beanies, trucker hats), accessories, autographed memorabilia, and digital content.</p>
                <p><strong>5. TERM.</strong> This Agreement shall remain in effect for twelve (12) months from the date of execution and shall automatically renew for successive twelve-month periods unless terminated by either party with thirty (30) days written notice.</p>
                <p><strong>6. COMPLIANCE.</strong> Both parties agree to comply with all applicable NCAA, Big Ten Conference, and university policies regarding NIL activities. Licensor represents that they have disclosed this Agreement to their institution&apos;s compliance office.</p>
                <p><strong>7. TERMINATION.</strong> Either party may terminate this Agreement at any time with thirty (30) days written notice. Upon termination, Licensee shall cease production of new Licensed Products but may sell existing inventory for ninety (90) days.</p>
                <p><strong>8. GOVERNING LAW.</strong> This Agreement shall be governed by the laws of the Commonwealth of Pennsylvania.</p>
              </div>
            </div>

            {/* Signer Info */}
            <div className="card space-y-4">
              <h2 className="font-semibold">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Legal Name *</label>
                  <input name="legal_name" required className="input w-full" placeholder="First Middle Last" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email Address *</label>
                  <input name="email" type="email" required className="input w-full" placeholder="you@example.com" />
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="card space-y-4">
              <h2 className="font-semibold">Digital Signature</h2>
              <p className="text-sm text-gray-400">Type your full name below as your legally binding digital signature.</p>
              <input
                name="signature"
                required
                className="input w-full text-center text-xl font-serif italic"
                placeholder="Type your full name to sign"
              />

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-psu-accent"
                  required
                />
                <label htmlFor="agree" className="text-sm text-gray-300">
                  I have read and agree to the Non-Exclusive NIL Licensing Agreement above. I understand this is a non-exclusive agreement and I retain all rights to my name, image, and likeness. I confirm I have notified my institution&apos;s compliance office.
                </label>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="card bg-psu-navy/80 border-psu-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Your Revenue Split</div>
                  <div className="text-3xl font-bold text-psu-gold">70%</div>
                  <div className="text-xs text-gray-500">of all merch net revenue</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">HVU Collective</div>
                  <div className="text-3xl font-bold text-psu-accent">30%</div>
                  <div className="text-xs text-gray-500">supports Penn State NIL</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !agreed}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50"
            >
              {submitting ? "Activating Store..." : "Sign & Activate NIL Merch Store"}
            </button>

            <p className="text-center text-xs text-gray-600">
              Powered by Happy Valley United &middot; <a href="https://insider.happyvalleyunited.com" target="_blank" rel="noopener noreferrer" className="hover:text-psu-accent">insider.happyvalleyunited.com</a>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
