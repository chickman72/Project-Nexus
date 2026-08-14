import "./globals.css";
import { getUabAccess } from "../lib/auth/uabAccess";

export const metadata = {
  title: "Project Nexus",
  description: "AI and data science resources for the UAB School of Nursing"
};

export default function RootLayout({ children }) {
  const { authorized } = getUabAccess();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {authorized ? (
          children
        ) : (
          <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Access restricted to UAB accounts
            </h1>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Project Nexus is only available to signed-in uab.edu accounts.
              Please sign out and sign back in with your UAB credentials.
            </p>
            <a
              href="/.auth/logout?post_logout_redirect_uri=%2F"
              className="nexus-button rounded-md bg-[color:var(--uab-green)] px-4 py-2 text-sm font-semibold text-white"
            >
              Sign out
            </a>
          </main>
        )}
      </body>
    </html>
  );
}
