// The dashboard's signature chart: one bar per large family, opening to its
// small families down the ochre rail. Plain HTML bars rather than a chart
// library, because these have to be clickable and behave in right-to-left.

"use client";

import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type FamilyBar = {
  id: string;
  name: string;
  households: number;
  smallFamilies: { id: string; name: string; households: number }[];
};

export function FamilyTreeChart({ families }: { families: FamilyBar[] }) {
  const t = useTranslations("dashboard");
  const [openId, setOpenId] = useState<string | null>(null);

  const largest = Math.max(...families.map((family) => family.households), 1);

  return (
    <section className="rounded-card border-line bg-surface space-y-4 border p-4">
      <h2 className="text-heading text-ink text-start">{t("byFamily")}</h2>

      <ul className="space-y-3">
        {families.map((family) => {
          const isOpen = openId === family.id;

          return (
            <li key={family.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/households?large=${family.id}`}
                  className="min-w-0 flex-1"
                >
                  <span className="text-label text-ink block truncate text-start">
                    {family.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className="bg-indigo h-3 rounded-full"
                      style={{
                        width: `${Math.max((family.households / largest) * 100, 2)}%`,
                      }}
                    />
                    <span className="text-small text-ink-muted shrink-0">
                      {family.households}
                    </span>
                  </span>
                </Link>

                {family.smallFamilies.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? t("collapse") : t("expand")}
                    onClick={() => setOpenId(isOpen ? null : family.id)}
                  >
                    <ChevronDownIcon
                      className={isOpen ? "rotate-180" : undefined}
                    />
                  </Button>
                ) : null}
              </div>

              {isOpen ? (
                <ul className="border-ochre/40 space-y-2 border-s-2 ps-4">
                  {family.smallFamilies.map((small) => (
                    <li key={small.id}>
                      <Link
                        href={`/households?large=${family.id}&small=${small.id}`}
                        className="block"
                      >
                        <span className="text-small text-ink-muted block truncate text-start">
                          {small.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <span
                            className="bg-chart-3 h-2 rounded-full"
                            style={{
                              width: `${Math.max((small.households / largest) * 100, 2)}%`,
                            }}
                          />
                          <span className="text-small text-ink-muted shrink-0">
                            {small.households}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
