"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface DriverInfo { id: number; name: string; }
interface ContractInfo { id: number; contract_status: string; signed_at: string; revenue_split_driver: number; revenue_split_team: number; }

const MERCH_CATALOG = [
  { name: "Team Cap", price: 35, category: "Headwear" },
  { name: "Driver Trucker Hat", price: 30, category: "Headwear" },
  { name: "Race Day Tee", price: 40, category: "Apparel" },
  { name: "Performance Hoodie", price: 70, category: "Apparel" },
  { name: "1:43 Scale Model Car", price: 55, category: "Model" },
  { name: "Signed Driver Card", price: 25, category: "Collectibles" },
  { name: "Race Suit Replica", price: 120, category: "Apparel" },
  { name: "Pit Crew Jacket", price: 95, category: "Apparel" },
];

export default function DriverMerchPage() {
  const params = useParams();
  const driverId = parseInt(params.id as string);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [step, setStep] = useState<"loading" | "contract" | "active">("loading");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/players`).then((r) => r.json()),
      fetch(`/api/nil-contracts?driver_id=${driverId}`).then((r) => r.json()),
    ]).then(([drivers, contractRes]) => {
      const d = drivers.find((dr: DriverInfo) => dr.id === driverId);
      setDriver(d || null);
      if (contractRes.contract) { setContract(contractRes.contract); setStep("active"); }
      else { setStep("contract"); }
    });
  }, [driverId]);

  async function handleSign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/nil-contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driver_id: driverId, driver_legal_name: form.get("legal_name"), driver_email: form.get("email"), digital_signature: form.get("signature") }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      const data = await res.json();
      setContract({ id: data.id, contract_status: "active", signed_at: new Date().toISOString(), revenue_split_driver: 70, revenue_split_team: 30 });
      setStep("active");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); setSubmitting(false); }
  }

  if (step === "loading") return <div className="text-gray-500 text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/drivers/${driverId}`} className="text-sm text-gray-400 hover:text-gray-200 inline-block">&larr; Back to Driver Profile</Link>

      {step === "active" && contract && (
        <>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">Active Store</div>
            <h1 className="text-3xl font-bold">{driver?.name} Merch Store</h1>
            <p className="text-gray-400">Every purchase supports <span className="text-haas-red font-medium">{driver?.name}</span> &mdash; {contract.revenue_split_driver}% to the driver, {contract.revenue_split_team}% to the team program</p>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-3">Revenue Split</h2>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-haas-red" style={{ width: `${contract.revenue_split_driver}%` }} />
              <div className="bg-alpine-blue" style={{ width: `${contract.revenue_split_team}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-haas-red">{contract.revenue_split_driver}% to {driver?.name}</span>
              <span className="text-alpine-blue">{contract.revenue_split_team}% to F1 Program</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Shop {driver?.name}&apos;s Collection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MERCH_CATALOG.map((item, i) => (
                <div key={i} className="card hover:border-haas-red/50 cursor-pointer group">
                  <div className="aspect-square bg-haas-gray rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:bg-haas-red/10 transition-colors">
                    {item.category === "Headwear" ? "🧢" : item.category === "Model" ? "🏎" : item.category === "Collectibles" ? "🏁" : "👕"}
                  </div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-haas-red font-bold text-lg mt-1">${item.price.toFixed(2)}</div>
                  <button className="btn-primary w-full mt-3 text-xs py-2">Buy Now</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "contract" && (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Activate Driver Merch Store</h1>
            <p className="text-gray-400">{driver?.name} &mdash; Sign a licensing agreement to launch your merch store</p>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">{error}</div>}
          <form onSubmit={handleSign} className="space-y-6">
            <div className="card space-y-4">
              <h2 className="font-semibold">Non-Exclusive Driver Licensing Agreement</h2>
              <div className="bg-haas-dark rounded-lg p-4 text-xs text-gray-300 max-h-48 overflow-y-auto space-y-2 font-mono">
                <p className="font-bold text-white">HAAS neXT / ALPINE neXT DRIVER LICENSING AGREEMENT</p>
                <p>This Non-Exclusive Licensing Agreement is between the undersigned driver (&ldquo;Licensor&rdquo;) and the neXT Program (&ldquo;Licensee&rdquo;).</p>
                <p><strong>1. LICENSE.</strong> Licensor grants a non-exclusive, revocable license to use their name, image, and likeness for merchandise.</p>
                <p><strong>2. NON-EXCLUSIVE.</strong> This license is non-exclusive. Licensor retains all rights to enter separate agreements.</p>
                <p><strong>3. COMPENSATION.</strong> Licensor receives 70% of net revenue. Licensee retains 30% for program operations.</p>
                <p><strong>4. TERM.</strong> 12 months, auto-renewing, terminable with 30 days notice.</p>
              </div>
            </div>
            <div className="card space-y-4">
              <h2 className="font-semibold">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-1">Full Legal Name *</label><input name="legal_name" required className="input w-full" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Email *</label><input name="email" type="email" required className="input w-full" /></div>
              </div>
            </div>
            <div className="card space-y-4">
              <h2 className="font-semibold">Digital Signature</h2>
              <input name="signature" required className="input w-full text-center text-xl font-serif italic" placeholder="Type your full name to sign" />
              <div className="flex items-start gap-3">
                <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-haas-red" required />
                <label htmlFor="agree" className="text-sm text-gray-300">I agree to the Non-Exclusive Driver Licensing Agreement above.</label>
              </div>
            </div>
            <button type="submit" disabled={submitting || !agreed} className="btn-primary w-full text-lg py-3 disabled:opacity-50">{submitting ? "Activating..." : "Sign & Activate Merch Store"}</button>
          </form>
        </>
      )}
    </div>
  );
}
