import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ReduxProvider } from "../store";
import type { ReactNode } from "react";

import "../styles/globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jaiswar Securities | Home",
  description: "Nextjs App for stock analysis and portfolio management",
};

const RootLayout = ({
  children,
  chart,
  sidebar,
}: Readonly<{
  children: ReactNode;
  chart: ReactNode;
  sidebar: ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ReduxProvider>
          <main className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white">
            {children}
            {sidebar}
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
