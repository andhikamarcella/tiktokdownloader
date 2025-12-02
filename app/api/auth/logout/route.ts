import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("tiktok_token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
