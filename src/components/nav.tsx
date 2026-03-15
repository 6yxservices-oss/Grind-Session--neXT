"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/drivers", label: "Drivers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/teams", label: "Teams", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/races", label: "Races", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/market", label: "Driver Market", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { href: "/vote", label: "Fan Vote", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
  { href: "/reports", label: "Reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/shortlist", label: "My Board", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
  { href: "/feed", label: "Feed", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
  { href: "/tools/screenshot-to-ui", label: "Screenshot → UI", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-haas-black border-r border-haas-light/20 flex flex-col z-50">
      <div className="p-4 border-b border-haas-light/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-haas-red flex items-center justify-center font-black text-white text-[10px] tracking-tight">
            neXT
          </div>
          <div>
            <div className="font-bold text-sm text-white">HAAS neXT</div>
            <div className="text-[10px] text-haas-silver uppercase tracking-widest">Driver Scouting</div>
          </div>
        </Link>
      </div>

      {/* Team Toggle */}
      <div className="mx-3 mt-3 grid grid-cols-2 gap-1 p-1 bg-haas-gray rounded-lg">
        <Link
          href="/"
          className={`text-center py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${
            !pathname.includes("alpine") ? "bg-haas-red text-white" : "text-haas-silver hover:text-white"
          }`}
        >
          Haas neXT
        </Link>
        <Link
          href="/?view=alpine"
          className={`text-center py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${
            pathname.includes("alpine") ? "bg-alpine-blue text-white" : "text-haas-silver hover:text-white"
          }`}
        >
          Alpine neXT
        </Link>
      </div>

      {/* RISE+ Points */}
      <div className="mx-3 mt-3 p-3 rounded-lg bg-alpine-blue/10 border border-alpine-blue/20">
        <div className="text-[10px] text-alpine-pink uppercase tracking-widest font-bold">RISE+</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-alpine-cyan">2,450</span>
          <span className="text-[10px] text-haas-silver">pts</span>
        </div>
        <div className="flex gap-1 mt-2">
          {["Scout", "Vote", "Win"].map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-alpine-pink/20 text-alpine-pink font-bold uppercase">{s}</span>
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
                  ? "bg-haas-red/10 text-white border border-haas-red/30"
                  : "text-haas-silver hover:text-white hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
              {link.label === "Fan Vote" && <span className="ml-auto text-[9px] bg-haas-red/20 text-haas-red px-1.5 py-0.5 rounded font-bold">LIVE</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-haas-light/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-3 bg-haas-red rounded-sm" />
          <div className="w-6 h-3 bg-alpine-blue rounded-sm" />
        </div>
        <div className="text-[9px] text-haas-silver uppercase tracking-widest">Powered by</div>
        <div className="text-xs font-bold text-white">Haas F1 &amp; BWT Alpine</div>
        <div className="text-[9px] text-alpine-pink mt-0.5">RISE+ | alpinef1.com</div>
      </div>
    </nav>
  );
}
