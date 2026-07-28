"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { copy } from "@/lib/copy";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-[var(--color-net)] hover:underline">
      {copy.nav.signOut}
    </button>
  );
}
