// Who is signed in, and the guards every protected page and server action uses.
// The lookup is cached per request: the layout and the page both ask "who is
// this?", and each question costs two network round trips to Supabase, so they
// must share one answer rather than each paying for their own.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Database } from "./supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type Session = {
  profile: Profile;
  hasVerifiedApp: boolean;
};

const loadSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();

  // getUser revalidates the token with Supabase; getSession only reads the
  // cookie, which a client could have tampered with. The user it returns also
  // lists the account's authenticator apps, freshly read, so there is no need
  // for a separate round trip to ask about them.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const hasVerifiedApp = (user.factors ?? []).some(
    (factor) => factor.factor_type === "totp" && factor.status === "verified"
  );

  return { profile, hasVerifiedApp };
});

export async function getCurrentProfile(): Promise<Profile | null> {
  return (await loadSession())?.profile ?? null;
}

// Two-step login is optional: nobody is pushed into setting it up. But once an
// authenticator is registered on an account it has to be cleared, otherwise
// turning it on would protect nothing. The level the session reached is read
// from its own token, so this check costs no network call.
async function requireSecondStep(): Promise<void> {
  const supabase = await createClient();

  const { data: level } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (level?.currentLevel !== "aal2") {
    redirect("/login/verify");
  }
}

export async function requireProfile(): Promise<Profile> {
  const session = await loadSession();

  if (!session || !session.profile.is_active) {
    redirect("/login");
  }

  if (session.hasVerifiedApp) {
    await requireSecondStep();
  }

  return session.profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
