import { headers } from "next/headers";

// Azure Static Web Apps validates the sign-in session itself (see the
// "authenticated" role requirement in staticwebapp.config.json) and, once a
// request is authenticated, injects an "x-ms-client-principal" header
// containing the user's claims as base64-encoded JSON before forwarding the
// request to this app. That header is set by the platform after verifying
// the session cookie — any client-supplied version of it is stripped and
// overwritten by Azure before the request reaches here, so it can't be
// spoofed by a caller.
//
// This is enforced here, in plain server-side code, rather than in Next.js
// Edge Middleware: Azure Static Web Apps repackages Next.js apps into a
// Node.js Azure Function behind the scenes, and its middleware support has
// proven unreliable there (see the deploy failures this replaced — the
// Function App failed its post-deploy health check ("warm up") whenever
// middleware.ts was present). Route Handlers and Server Components run
// through that same repackaged Function without issue, so the check lives
// there instead.

const ALLOWED_EMAIL_DOMAIN = "uab.edu";

const EMAIL_CLAIM_TYPES = [
  "emails",
  "email",
  "preferred_username",
  "upn",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
];

interface Claim {
  typ?: string;
  val?: string;
}

interface ClientPrincipal {
  userDetails?: string;
  claims?: Claim[];
}

function getClaimValue(claims: Claim[] | undefined, claimTypes: string[]) {
  return claims?.find((claim) => claim.typ && claimTypes.includes(claim.typ))?.val;
}

function parseClientPrincipal(header: string | null): ClientPrincipal | null {
  if (!header) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function isUabEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export interface UabAccessResult {
  authorized: boolean;
  email: string | null;
}

/**
 * Reads the current request's Azure Static Web Apps client principal and
 * reports whether the signed-in user's email/UPN is on the uab.edu domain.
 * Call this from a Server Component or Route Handler (it relies on
 * next/headers, so it can't run in Client Components or middleware).
 */
export function getUabAccess(): UabAccessResult {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXUS_DEV_AUTH_BYPASS === "true"
  ) {
    return {
      authorized: true,
      email: "local@test.uab.edu"
    };
  }

  const principal = parseClientPrincipal(
    headers().get("x-ms-client-principal")
  );

  const email =
    getClaimValue(principal?.claims, EMAIL_CLAIM_TYPES) ||
    principal?.userDetails ||
    null;

  return {
    authorized: Boolean(principal && email && isUabEmail(email)),
    email,
  };
}
