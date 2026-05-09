"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/recruiting", label: "Recruiting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { href: "/recruiting/profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/recruiting/coaches", label: "Coach CRM", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/recruiting/schools", label: "Schools", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3.75-2.318l3.75 2.318 3.75-2.318" },
  { href: "/recruiting/eligibility", label: "Eligibility", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { href: "/feed", label: "Feed", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
  { href: "/gear", label: "Gear", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
];

const legacyLinks = [
  { href: "/drivers", label: "Drivers" },
  { href: "/teams", label: "Teams" },
  { href: "/races", label: "Races" },
  { href: "/market", label: "Market" },
  { href: "/asu-basketball", label: "ASU Hoops" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-haas-black border-r border-haas-light/20 flex flex-col z-50">
      <div className="p-4 border-b border-haas-light/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-haas-red flex items-center justify-center font-black text-white text-[10px] tracking-tight">
            SF
          </div>
          <div>
            <div className="font-bold text-sm text-white">Synergyforce</div>
            <div className="text-[10px] text-haas-silver uppercase tracking-widest">Train · Recruit · Compete</div>
          </div>
        </Link>
      </div>

      <div className="mx-3 mt-3 p-3 rounded-lg bg-alpine-blue/10 border border-alpine-blue/20">
        <div className="text-[10px] text-alpine-pink uppercase tracking-widest font-bold">Profile</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-alpine-cyan">62%</span>
          <span className="text-[10px] text-haas-silver">complete</span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {["Train", "Email", "Verify"].map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-alpine-pink/20 text-alpine-pink font-bold uppercase">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {primaryLinks.map((link) => {
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
              {link.label === "Recruiting" && <span className="ml-auto text-[9px] bg-haas-red/20 text-haas-red px-1.5 py-0.5 rounded font-bold">NEW</span>}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-haas-light/10">
          <div className="px-3 text-[9px] uppercase tracking-widest text-haas-silver/60 font-bold mb-1">Other Modules</div>
          {legacyLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                  isActive ? "text-white bg-white/5" : "text-haas-silver/60 hover:text-haas-silver"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-haas-light/20">
        <div className="text-[9px] text-haas-silver uppercase tracking-widest">Powered by</div>
        <div className="text-xs font-bold text-white">Synergyforce</div>
        <div className="text-[9px] text-alpine-pink mt-0.5">Volleyball recruiting + training</div>
      </div>
    </nav>
  );
}
