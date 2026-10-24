import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  userId: string;
  email: string;
}

export const SESSION_COOKIE_NAME = "blogspace_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days in seconds
const JWT_ALGORITHM = "HS256";
const MIN_SECRET_LENGTH = 32;

/**
 * Retrieves and validates the JWT signing secret from environment variables.
 * Fails safely if the secret is missing or shorter than 32 characters.
 */
export function getAuthSecret(): Uint8Array {
  let secret = process.env.AUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      secret = "dev_blogspace_auth_secret_key_32_characters_minimum_fallback_2026";
    } else {
      throw new Error(
        "AUTH_SECRET is not configured. Define an AUTH_SECRET of at least 32 characters in .env."
      );
    }
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET is too weak (${secret.length} characters). It must be at least ${MIN_SECRET_LENGTH} characters long.`
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Standard cookie configuration for session tokens.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/**
 * Cookie configuration used to immediately expire/clear the session cookie.
 */
export const expiredSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

/**
 * Creates and signs a compact JWT session token with HS256.
 * The subject ('sub') claim contains the user ID.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getAuthSecret();

  return await new SignJWT({
    email: payload.email,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

/**
 * Verifies a JWT session token against the secret and checks algorithm,
 * signature integrity, expiration, and subject claims.
 * Returns the decoded SessionPayload or null if verification fails.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });

    const userId = payload.sub;
    const email = payload.email;

    if (
      !userId ||
      typeof userId !== "string" ||
      !email ||
      typeof email !== "string"
    ) {
      return null;
    }

    return {
      userId,
      email,
    };
  } catch {
    // Fail safely on invalid signatures, expired tokens, or malformed claims
    return null;
  }
}

/**
 * Reads and verifies the current session from incoming cookies.
 * Compatible with Next.js App Router Server Components and Route Handlers.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
