// Ends an idle session after 30 minutes, warning 2 minutes before. The 8-hour
// absolute limit is set in Supabase Auth, because only the server can enforce
// a cap that a closed browser cannot reset.

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(app)/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const idleLimitMs = 30 * 60_000;
const warnBeforeMs = 2 * 60_000;
const activityEvents = ["pointerdown", "keydown", "scroll"] as const;

export function SessionTimer() {
  const t = useTranslations("session");
  const [warning, setWarning] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restart = useCallback(() => {
    setWarning(false);

    if (warnTimer.current) {
      clearTimeout(warnTimer.current);
    }
    if (endTimer.current) {
      clearTimeout(endTimer.current);
    }

    warnTimer.current = setTimeout(
      () => setWarning(true),
      idleLimitMs - warnBeforeMs
    );
    endTimer.current = setTimeout(() => {
      void signOut();
    }, idleLimitMs);
  }, []);

  useEffect(() => {
    restart();

    // Once the warning is up, further activity must not silently extend the
    // session: the person has to answer the question.
    const onActivity = () => {
      if (!warning) {
        restart();
      }
    };

    for (const event of activityEvents) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      for (const event of activityEvents) {
        window.removeEventListener(event, onActivity);
      }
      if (warnTimer.current) {
        clearTimeout(warnTimer.current);
      }
      if (endTimer.current) {
        clearTimeout(endTimer.current);
      }
    };
  }, [restart, warning]);

  return (
    <AlertDialog open={warning}>
      <AlertDialogContent aria-describedby={undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-heading text-ink text-start">
            {t("warning")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={restart}>
            {t("continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
