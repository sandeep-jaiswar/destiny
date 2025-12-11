import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ReduxProvider } from "../store";
import "./styles/globals.css";
import React from "react";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Destiny",
  description: "Nextjs App for stock analysis and portfolio management",
};

const RootLayout = ({
  children,
  chart,
}: Readonly<{
  children: React.ReactNode;
  chart: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ReduxProvider>
          <main className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white">
            {children}
            {chart}
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
