import { ME_URL } from "../shared/reddit";
import type { AccountSummary } from "../shared/types";

interface MeResponse {
  data?: { name?: string; icon_img?: string; snoovatar_img?: string };
}

/** Who is logged in to reddit.com right now, or null if nobody (or Reddit is unreachable). */
export async function whoAmI(): Promise<AccountSummary | null> {
  try {
    const res = await fetch(ME_URL, {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as MeResponse;
    const name = json.data?.name;
    if (!name) return null;
    const icon = json.data?.icon_img || json.data?.snoovatar_img || "";
    return { name, icon: icon.split("?")[0] ?? "" };
  } catch {
    return null;
  }
}
