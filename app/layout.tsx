import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShotenX Agent Marketplace",
  description: "Lightning-native agent marketplace MVP"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
