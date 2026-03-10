import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "EYBL Scout - Elite Youth Basketball Scouting Platform",
  description: "Advanced scouting and analytics platform for Nike EYBL prospects",
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
