import { NextResponse } from "next/server";

// This endpoint is invoked server-to-server by Azure Static Web Apps'
// authentication pipeline (configured as "auth.rolesSource" in
// staticwebapp.config.json) immediately after a user signs in. It receives
// the authenticated user's claims and returns the list of roles that should
// be attached to their session. It is NOT a public API for clients to call.
//
// Only users whose verified email/UPN is on the uab.edu domain are granted
// the "uab_user" role, which staticwebapp.config.json requires for every
// route. Anyone who signs in with a non-UAB Microsoft account (personal
// account, another organization's tenant, etc.) gets no roles and is
// blocked with a 403 by the platform before ever reaching the app.

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

function getClaimValue(claims: Claim[] | undefined, claimTypes: string[]) {
  return claims?.find((claim) => claim.typ && claimTypes.includes(claim.typ))?.val;
}

function isUabEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Azure Static Web Apps posts the client principal fields directly at the
  // top level of the request body (identityProvider, userId, userDetails,
  // claims). Fall back to a nested "clientPrincipal" in case of a shape
  // change, so this fails closed either way.
  const principal = body?.claims ? body : body?.clientPrincipal ?? {};
  const claims: Claim[] = principal?.claims ?? [];

  const email =
    getClaimValue(claims, EMAIL_CLAIM_TYPES) || principal?.userDetails || "";

  const roles = typeof email === "string" && isUabEmail(email) ? ["uab_user"] : [];

  return NextResponse.json({ roles });
}
