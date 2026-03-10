"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/players", label: "Recruits", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/teams", label: "Teams", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/games", label: "Games", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/portal", label: "Portal Watch", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { href: "/reports", label: "Reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/shortlist", label: "My Board", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
  { href: "/feed", label: "Mike V Feed", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-psu-navy border-r border-psu-light/20 flex flex-col z-50">
      <div className="p-4 border-b border-psu-light/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-black text-psu-navy text-sm">
            MV
          </div>
          <div>
            <div className="font-bold text-sm text-white">MIKE V&apos;s</div>
            <div className="text-[10px] text-psu-steel uppercase tracking-widest">Recruiting Board</div>
          </div>
        </Link>
      </div>

      {/* HVU Insider Points */}
      <div className="mx-3 mt-3 p-3 rounded-lg bg-psu-gold/10 border border-psu-gold/20">
        <div className="text-[10px] text-psu-gold uppercase tracking-widest font-bold">HVU Insider</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-psu-gold">1,250</span>
          <span className="text-[10px] text-psu-steel">pts</span>
        </div>
        <div className="flex gap-1 mt-2">
          {["Scout", "Score", "Win"].map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-psu-gold/20 text-psu-gold font-bold uppercase">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-psu-steel hover:text-white hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-psu-light/20">
        <a href="https://insider.happyvalleyunited.com" target="_blank" rel="noopener noreferrer" className="block text-center">
          <div className="text-[9px] text-psu-steel uppercase tracking-widest">Powered by</div>
          <div className="text-xs font-bold text-white">HVU Insider</div>
          <div className="text-[9px] text-psu-gold mt-0.5">insider.happyvalleyunited.com</div>
        </a>
        <div className="mt-2 pt-2 border-t border-psu-light/20">
          <div className="text-[10px] text-psu-steel uppercase tracking-widest">WE ARE</div>
          <div className="text-sm font-bold text-white">PENN STATE</div>
        </div>
      </div>
    </nav>
  );
}
