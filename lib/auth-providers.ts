import "server-only";

/**
 * Whether Google sign-in is switched on in Supabase (Authentication ->
 * Providers). Read from the public auth settings endpoint and cached for a
 * minute, so the button only appears once it will actually work.
 */
export async function googleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return false;
    const s = (await res.json()) as { external?: Record<string, boolean> };
    return s.external?.google === true;
  } catch {
    return false;
  }
}
