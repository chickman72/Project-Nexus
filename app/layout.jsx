import "./globals.css";
import { Source_Sans_3, Spectral } from "next/font/google";

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

const displayFont = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

export const metadata = {
  title: "Project Nexus",
  description: "School of Nursing launchpad"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-white font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
