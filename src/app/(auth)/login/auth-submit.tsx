// The full-width submit button of the sign-in screens. The arrow leans forward
// on hover to say "this takes you in"; while the request runs it gives way to
// the spinner and a "working" label.

"use client";

import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthSubmitProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
};

export function AuthSubmit({
  pending,
  label,
  pendingLabel,
  className,
}: AuthSubmitProps) {
  return (
    <div className={className}>
      <Button
        type="submit"
        size="lg"
        loading={pending}
        className="w-full transition-[translate,scale,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[0_12px_24px_-12px_var(--indigo)] active:translate-y-0 active:scale-[0.98]"
      >
        {pending ? pendingLabel : label}
        {pending ? null : (
          <ArrowRightIcon
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/button:translate-x-1 rtl:rotate-180 rtl:group-hover/button:-translate-x-1"
          />
        )}
      </Button>
    </div>
  );
}
