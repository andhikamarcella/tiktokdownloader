import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { fetchUserInfo, fetchUserVideos } from "../../lib/tiktok";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const token = cookies().get("tiktok_token")?.value;
  if (!token) {
    redirect("/api/auth/tiktok");
  }

  const [user, videos] = await Promise.all([
    fetchUserInfo(token!).catch(() => null),
    fetchUserVideos(token!).catch(() => []),
  ]);

  return <ProfileClient user={user} videos={videos} />;
}
