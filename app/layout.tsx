import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JetBrains_Mono } from "next/font/google";
import { ReduxProvider } from "../store";
import type { ReactNode } from "react";

import "../styles/globals.css";

const Searchbar = dynamic(() => import("@/components/Searchbar").then(mod => mod.Searchbar));

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jaiswar Securities | Home",
  description: "Nextjs App for stock analysis and portfolio management",
};

const RootLayout = ({
  sidebar,
  content,
}: Readonly<{
  content: ReactNode;
  sidebar: ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ReduxProvider>
          <main className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white">
            <header className="flex items-center gap-4 px-2 border-b border-gray-700/50 backdrop-blur-sm bg-black/30 sticky top-0 z-10">
              <div className="flex-1 max-w-2xl">
                <Searchbar />
              </div>
            </header>
            <section className="grid grid-cols-12">
              <div className="col-span-2">{sidebar}</div>
              <div className="col-span-10">{content}</div>
            </section>
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
