import type { Metadata } from "next";
import { inter } from "./fonts";

import "./globals.css";


export const metadata: Metadata = {
  title: "Next.js + MongoDB",
  description: "Use MongoDB with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
