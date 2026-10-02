// One person in a household: who they are, a few key facts, and the
// actions allowed on them.

"use client";

import type { LucideIcon } from "lucide-react";
import {
  BabyIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type PersonRole = "father" | "mother" | "son" | "daughter";

const roleIcons: Record<PersonRole, LucideIcon> = {
  father: UserIcon,
  mother: UserRoundIcon,
  son: BabyIcon,
  daughter: BabyIcon,
};

const femaleRoles: ReadonlySet<PersonRole> = new Set<PersonRole>([
  "mother",
  "daughter",
]);

type PersonCardProps = {
  role: PersonRole;
  name: string;
  age: number;
  facts: string[];
  deceased?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function PersonCard({
  role,
  name,
  age,
  facts,
  deceased = false,
  onEdit,
  onDelete,
}: PersonCardProps) {
  const t = useTranslations("person");
  const tCommon = useTranslations("common");
  const Icon = roleIcons[role];

  return (
    <article className="flex items-start gap-3 rounded-card border border-line bg-surface p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-soft text-indigo">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 text-start">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-title-family text-ink truncate">{name}</h3>
          {deceased ? (
            <Badge variant="outline" className="text-ink-muted">
              {femaleRoles.has(role) ? t("deceasedFemale") : t("deceasedMale")}
            </Badge>
          ) : null}
        </div>

        <p className="text-small text-ink-muted mt-0.5">
          {t(role)} · {t("age", { count: age })}
        </p>

        {facts.length > 0 ? (
          <ul className="text-small text-ink-muted mt-2 space-y-0.5">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={tCommon("edit")}
          >
            <PencilIcon />
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={tCommon("delete")}
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>
    </article>
  );
}
