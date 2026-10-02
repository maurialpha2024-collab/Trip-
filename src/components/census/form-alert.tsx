// The one error box a whole form can show, used where a message must not point
// at a single field (a wrong login must not reveal which half was wrong).

import { AlertCircleIcon } from "lucide-react";

export function FormAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="text-small text-danger border-danger/30 bg-danger/10 rounded-control flex items-start gap-2 border p-3 text-start"
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
