import Link from "next/link";

export const dynamic = "force-dynamic";

const VJSNEAKER_URL = "https://vjsneaker.com";

const merchPlaceholders = [
  { label: "Synergyforce Practice Tee", price: "$28", note: "coming soon" },
  { label: "Training Hoodie", price: "$58", note: "coming soon" },
  { label: "Tournament Backpack", price: "$72", note: "coming soon" },
  { label: "Gym Bag", price: "$45", note: "coming soon" },
];

export default function GearPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gear</h1>
        <p className="text-haas-silver text-sm mt-1">Sneakers, training apparel, and team gear for athletes preparing to play at the next level.</p>
      </div>

      <a
        href={VJSNEAKER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block card border-alpine-pink/30 bg-gradient-to-r from-haas-black via-haas-gray to-alpine-dark/40 hover:border-alpine-pink/60 transition-colors"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-alpine-pink text-xs uppercase tracking-widest font-bold">Featured Partner</div>
            <h2 className="text-2xl font-bold mt-1">VJ Sneaker</h2>
            <p className="text-sm text-haas-silver mt-2 max-w-lg">
              Court-grip volleyball sneakers built for the indoor game. Browse the full lineup at <span className="text-alpine-pink">vjsneaker.com</span>.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="btn-primary text-sm">Shop VJ Sneaker ↗</span>
              <span className="text-xs text-haas-silver">External link · vjsneaker.com</span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-alpine-pink/10 border border-alpine-pink/30">
            <span className="text-4xl font-black text-alpine-pink">VJ</span>
          </div>
        </div>
      </a>

      <div>
        <h2 className="text-lg font-semibold mb-3">Synergyforce Merch</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {merchPlaceholders.map((m) => (
            <div key={m.label} className="card opacity-60">
              <div className="aspect-square bg-haas-gray/40 rounded-lg mb-3 border border-haas-light/20 flex items-center justify-center text-haas-silver text-xs">
                {m.label}
              </div>
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-xs text-haas-silver">{m.price}</div>
              <div className="text-[10px] text-yellow-400 mt-1 uppercase tracking-widest">{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-haas-light/20">
        <div className="text-xs uppercase tracking-widest text-haas-silver font-bold mb-2">Featured-vendor model</div>
        <p className="text-xs text-haas-silver">
          VJ Sneaker is featured here as an external partner — clicking the CTA opens vjsneaker.com in a new tab. Synergyforce-branded merch lives on this page once the shop catalog is wired up. To deepen the integration (embedded product cards, in-app checkout), we'd need a product feed or storefront API from VJ Sneaker.
        </p>
      </div>

      <div className="text-center">
        <Link href="/recruiting" className="text-haas-silver text-xs hover:text-white">← Back to Recruiting</Link>
      </div>
    </div>
  );
}
