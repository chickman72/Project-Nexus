import { NextRequest, NextResponse } from "next/server";

// Free-tier Azure Static Web Apps cannot use the "auth" block in
// staticwebapp.config.json (rolesSource / custom identity providers require
// the Standard SKU), so the uab.edu restriction is enforced here instead.
//
// Azure Static Web Apps validates the sign-in session itself (see the
// "authenticated" role requirement in staticwebapp.config.json) and, once a
// request is authenticated, injects an "x-ms-client-principal" header
// containing the user's claims as base64-encoded JSON before forwarding the
// request to this app. That header is set by the platform after verifying
// the session cookie — any client-supplied version of it is stripped and
// overwritten by Azure before the request reaches here, so it can't be
// spoofed by a caller.
//
// This only narrows who is granted access; it does not replace the platform
// sign-in requirement above.

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

function decodeBase64Utf8(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function parseClientPrincipal(header: string | null): ClientPrincipal | null {
  if (!header) {
    return null;
  }
  try {
    return JSON.parse(decodeBase64Utf8(header));
  } catch {
    return null;
  }
}

function isUabEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export function middleware(request: NextRequest) {
  const principal = parseClientPrincipal(
    request.headers.get("x-ms-client-principal")
  );
  const email =
    getClaimValue(principal?.claims, EMAIL_CLAIM_TYPES) ||
    principal?.userDetails ||
    "";

  if (principal && isUabEmail(email)) {
    return NextResponse.next();
  }

  return new NextResponse(
    "Access restricted to UAB (uab.edu) accounts. Please sign out and sign back in with your UAB credentials.\n\n" +
      "Sign out: /.auth/logout?post_logout_redirect_uri=%2F",
    {
      status: 403,
      headers: { "content-type": "text/plain" },
    }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
