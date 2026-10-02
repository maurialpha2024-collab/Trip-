// There is no home page: each role has somewhere better to be. Agents go
// straight to registering a household, admins to the dashboard.

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function HomeRedirectPage() {
  const profile = await requireProfile();

  redirect(profile.role === "admin" ? "/admin" : "/households/new");
}
