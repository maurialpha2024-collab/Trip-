// Shown in place of an empty list: an icon, one sentence, one way forward.

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <Icon className="size-8 text-ink-muted" aria-hidden="true" />
      <p className="text-body text-ink-muted max-w-sm">{message}</p>
      {action}
    </div>
  );
}
