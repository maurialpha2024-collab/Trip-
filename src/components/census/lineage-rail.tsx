// The lineage rail: large family → small family → household → people.
// A thin ochre line ties the levels together, the way family trees are drawn
// in old Chinguetti manuscripts. Vertical on desktop, a breadcrumb on phones.

import Link from "next/link";
import { cn } from "@/lib/utils";

export type LineageLevel = {
  label: string;
  value: string;
  href?: string;
};

type LineageRailProps = {
  levels: LineageLevel[];
  currentIndex: number;
  className?: string;
};

export function LineageRail({
  levels,
  currentIndex,
  className,
}: LineageRailProps) {
  return (
    <nav className={className}>
      <ol className="flex flex-row items-center gap-3 overflow-x-auto md:flex-col md:items-stretch md:gap-0 md:overflow-visible">
        {levels.map((level, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isLast = index === levels.length - 1;

          const text = (
            <span className="flex flex-col text-start">
              <span className="text-small text-ink-muted hidden md:block">
                {level.label}
              </span>
              <span
                className={cn(
                  "text-label whitespace-nowrap",
                  isCurrent && "text-ink font-semibold",
                  isPast && "text-indigo",
                  !isCurrent && !isPast && "text-ink-muted"
                )}
              >
                {level.value}
              </span>
            </span>
          );

          return (
            <li
              key={level.label}
              className="relative flex shrink-0 items-center gap-2 md:items-start md:gap-3 md:pb-6 md:last:pb-0"
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="bg-ochre/40 absolute start-full top-1/2 h-0.5 w-3 -translate-y-1/2 md:start-[5px] md:top-4 md:bottom-0 md:h-auto md:w-0.5 md:translate-y-0"
                />
              ) : null}

              <span
                aria-hidden="true"
                className={cn(
                  "border-ochre size-3 shrink-0 rounded-full border-2 md:mt-1.5",
                  isCurrent ? "bg-ochre" : "bg-canvas"
                )}
              />

              {isPast && level.href ? (
                <Link
                  href={level.href}
                  className="rounded-control hover:underline"
                >
                  {text}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "step" : undefined}>{text}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
