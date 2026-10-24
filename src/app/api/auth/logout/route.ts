import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  expiredSessionCookieOptions,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Signed out successfully." },
    { status: 200 }
  );

  // Expire the session cookie with matching security attributes
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    ...expiredSessionCookieOptions,
  });

  return response;
}
