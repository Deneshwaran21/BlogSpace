import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be an object." },
        { status: 400 }
      );
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Look up user by normalized email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Use generic error message to prevent user enumeration
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign session token using the server secret
    const sessionToken = await signSessionToken({
      userId: user.id,
      email: user.email,
    });

    // Build response with safe public fields only (no passwordHash or token in JSON)
    const response = NextResponse.json(
      {
        message: "Signed in successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    // Set HttpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      ...sessionCookieOptions,
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);

    const errorMessage =
      error instanceof Error && error.message.includes("AUTH_SECRET")
        ? "Authentication service misconfigured. Please check server environment."
        : "Unable to sign in right now.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
