import { redirect } from "next/navigation";

export async function GET() {
  const url = new URL("https://www.tiktok.com/auth/authorize/");
  url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "user.info.basic,user.info.profile,user.video.list");
  url.searchParams.set("redirect_uri", process.env.TIKTOK_REDIRECT_URI!);

  redirect(url.toString());
}
