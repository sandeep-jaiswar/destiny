import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JetBrains_Mono } from "next/font/google";
import { ReduxProvider } from "../store";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

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


type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body className={`${jetBrainsMono.variable} antialiased`}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ReduxProvider>
          <main className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white">
            <header className="flex items-center gap-4 px-2 border-b border-gray-700/50 backdrop-blur-sm bg-black/30 sticky top-0 z-10">
              <div className="flex-1 max-w-2xl">
                <Searchbar />
              </div>
            </header>
            {children}
          </main>
        </ReduxProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
