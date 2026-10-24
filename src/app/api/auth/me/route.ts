import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  expiredSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. No session cookie provided." },
        { status: 401 }
      );
    }

    // Verify token signature, algorithm, expiration, and subject
    const session = await verifySessionToken(token);

    if (!session) {
      // Clear invalid/expired cookie on response
      const response = NextResponse.json(
        { error: "Session is invalid or expired." },
        { status: 401 }
      );
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        ...expiredSessionCookieOptions,
      });
      return response;
    }

    // Look up user by verified ID from the token subject (never trust client-supplied IDs)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User account no longer exists." },
        { status: 401 }
      );
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        ...expiredSessionCookieOptions,
      });
      return response;
    }

    // Return safe public user fields (no passwordHash or session tokens)
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw error;
    }

    console.error("Session verification error:", error);

    const errorMessage =
      error instanceof Error && error.message.includes("AUTH_SECRET")
        ? "Authentication service misconfigured. Please check server environment."
        : "Failed to verify session.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
