import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "MIKE V's Recruiting Board - Football Scouting Platform",
  description: "Advanced football recruiting analytics, transfer portal tracking, and NIL valuations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Nav />
        <main className="ml-56 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
