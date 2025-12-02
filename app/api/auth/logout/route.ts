import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("/");
  res.cookies.set("tiktok_token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
