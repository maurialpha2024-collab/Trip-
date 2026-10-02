// The households list. Admins get the full list; an agent gets only what they
// registered themselves, without any personal details.

import { requireProfile } from "@/lib/auth";
import { AdminHouseholds } from "./admin-households";
import type { ListParams } from "./list-params";
import { MyHouseholds } from "./my-households";

type PageProps = {
  searchParams: Promise<ListParams>;
};

export default async function HouseholdsPage({ searchParams }: PageProps) {
  const profile = await requireProfile();
  const params = await searchParams;

  return profile.role === "admin" ? (
    <AdminHouseholds params={params} />
  ) : (
    <MyHouseholds params={params} />
  );
}
