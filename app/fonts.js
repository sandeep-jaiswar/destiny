// Using system fonts due to network restrictions
// import { Inter } from "next/font/google";

// export const inter = Inter({
//   weight: ["400", "500", "600"],
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-inter",
// });

// Fallback to system fonts
export const inter = {
  variable: "--font-inter",
  className: "font-sans",
};
