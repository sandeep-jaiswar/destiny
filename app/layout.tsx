import type { Metadata } from "next";
import { inter, jetbrainsMono } from "./fonts";

import "./globals.css";


export const metadata: Metadata = {
  title: "Destiny Trading Platform",
  description: "Professional Bloomberg-inspired trading interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
