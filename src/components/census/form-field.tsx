// Label, control, hint and error arranged the same way on every form.
// It owns the generated id so the label and any error stay tied to the
// control for screen readers, whatever input is passed in.

"use client";

import { AlertCircleIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

type ControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
};

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (control: ControlProps) => ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const described = [
    hint && !error ? hintId : undefined,
    error ? errorId : undefined,
  ].filter((value): value is string => value !== undefined);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-label text-ink">
        {label}
      </Label>

      {children({
        id,
        "aria-describedby": described.length > 0 ? described.join(" ") : undefined,
        "aria-invalid": error ? true : undefined,
      })}

      {hint && !error ? (
        <p id={hintId} className="text-small text-ink-muted text-start">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="text-small text-danger flex items-center gap-1.5 text-start"
        >
          <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
