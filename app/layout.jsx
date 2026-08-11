import "./globals.css";
import { Source_Sans_3, Spectral } from "next/font/google";
import { getUabAccess } from "../lib/auth/uabAccess";

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
  const { authorized } = getUabAccess();

  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-white font-sans`}
      >
        {authorized ? (
          children
        ) : (
          <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              Access restricted to UAB accounts
            </h1>
            <p className="text-sm text-slate-600">
              Project Nexus is only available to signed-in uab.edu accounts.
              Please sign out and sign back in with your UAB credentials.
            </p>
            <a
              href="/.auth/logout?post_logout_redirect_uri=%2F"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign out
            </a>
          </main>
        )}
      </body>
    </html>
  );
}
