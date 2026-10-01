import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, PWA files and images.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline.html|models/|icons/|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|tflite|wasm)$).*)",
  ],
};
