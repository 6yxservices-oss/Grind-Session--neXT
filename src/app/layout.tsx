import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "Synergyforce — Train, Recruit, Compete",
  description: "The ultimate prep platform for athletes who want to play at the next level. Coach CRM, school depth charts, NCAA eligibility, and training metrics tied to your recruiting profile.",
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
