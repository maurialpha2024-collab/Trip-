// Heading + body wrapper shared by every block on the design preview.

import type { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-heading text-ink text-start">{title}</h2>
      {children}
    </section>
  );
}
