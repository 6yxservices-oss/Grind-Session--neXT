import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "Haas neXT | Alpine neXT - Discover the Next F1 Stars",
  description: "Fan-powered F1 driver scouting platform. Scout F2/F3 talent, vote for who gets a shot at Haas and Alpine.",
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
