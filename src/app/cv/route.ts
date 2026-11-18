import { connection, NextResponse } from "next/server";
import { getProfile } from "@/server/dal/public";

/**
 * Stable CV URL (/cv). Redirects to whichever PDF is currently set in the
 * admin, so links in emails and printed material never go stale.
 */
export async function GET(request: Request) {
  // Resolve per request so a newly published CV is served immediately.
  await connection();
  const profile = await getProfile();
  const cv = profile?.cv;
  if (!cv) {
    return new NextResponse("CV not available yet.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const target = cv.url.startsWith("http") ? cv.url : new URL(cv.url, request.url).toString();
  return NextResponse.redirect(target, 307);
}
