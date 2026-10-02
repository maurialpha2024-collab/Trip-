// The household drawn as a family: parents across the top, children hanging
// from an ochre rail below. Built with borders rather than an image, so it
// reflows on a phone and prints cleanly.

"use client";

import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/census/confirm-dialog";
import { PersonCard } from "@/components/census/person-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/constants";
import { educationLevels } from "@/lib/constants";
import { ageFromBirthDate } from "@/lib/validation/person";
import { deletePerson } from "../new/actions";
import type { PersonDraft } from "../new/types";
import { PersonEditDialog } from "./person-edit-dialog";

type Editing = { person: PersonDraft; sortOrder: number };

type FamilyTreeProps = {
  householdId: string;
  father: PersonDraft | null;
  mothers: PersonDraft[];
  // Not named "children": that is React's own prop and this is data, not slots.
  childPeople: PersonDraft[];
  locale: Locale;
  canEdit: boolean;
  continueHref: string;
};

export function FamilyTree({
  householdId,
  father,
  mothers,
  childPeople,
  locale,
  canEdit,
  continueHref,
}: FamilyTreeProps) {
  const t = useTranslations();
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<PersonDraft | null>(null);

  const motherOptions = mothers
    .filter((mother) => mother.id !== null)
    .map((mother) => ({ id: mother.id ?? "", name: mother.fullName }));

  function facts(person: PersonDraft): string[] {
    const level = educationLevels.find(
      (item) => item.key === person.educationLevel
    );
    return level ? [level[locale]] : [];
  }

  function card(person: PersonDraft, sortOrder: number, removable: boolean) {
    return (
      <PersonCard
        role={
          person.role === "father"
            ? "father"
            : person.role === "mother"
              ? "mother"
              : person.gender === "female"
                ? "daughter"
                : "son"
        }
        name={person.fullName}
        age={ageFromBirthDate(person.birthDate) ?? 0}
        facts={facts(person)}
        deceased={!person.isAlive}
        onEdit={canEdit ? () => setEditing({ person, sortOrder }) : undefined}
        onDelete={
          canEdit && removable ? () => setDeleting(person) : undefined
        }
      />
    );
  }

  async function confirmDelete() {
    if (!deleting?.id) {
      return;
    }

    const result = await deletePerson(deleting.id);
    setDeleting(null);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(t("detail.childDeleted"));
    router.refresh();
  }

  // With more than one mother, each mother's children sit under her.
  const groups =
    mothers.length > 1
      ? mothers.map((mother) => ({
          key: mother.id ?? mother.fullName,
          title: mother.fullName,
          items: childPeople.filter((child) => child.motherId === mother.id),
        }))
      : [{ key: "all", title: null, items: childPeople }];

  const unassigned =
    mothers.length > 1
      ? childPeople.filter(
          (child) =>
            child.motherId === null ||
            !mothers.some((mother) => mother.id === child.motherId)
        )
      : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {father ? card(father, 0, false) : null}
        {mothers.map((mother, index) => (
          <div key={mother.id ?? `mother-${index}`}>
            {card(mother, index + 1, false)}
          </div>
        ))}
      </div>

      <div className="border-ochre/40 space-y-6 border-s-2 ps-4">
        {[...groups, ...(unassigned.length > 0 ? [{ key: "other", title: null, items: unassigned }] : [])].map(
          (group) => (
            <div key={group.key} className="space-y-3">
              {group.title ? (
                <h3 className="text-label text-ink-muted text-start">
                  {group.title}
                </h3>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((child, index) => (
                  <div key={child.id ?? `child-${index}`}>
                    {card(child, 10 + index, true)}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {canEdit ? (
          <Button asChild variant="outline" className="print:hidden">
            <a href={continueHref}>
              <PlusIcon />
              {t("register.addChild")}
            </a>
          </Button>
        ) : null}
      </div>

      {editing ? (
        <PersonEditDialog
          key={editing.person.id ?? "new"}
          householdId={householdId}
          person={editing.person}
          sortOrder={editing.sortOrder}
          mothers={motherOptions}
          locale={locale}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(next) => (next ? undefined : setDeleting(null))}
        title={t("detail.deleteChildTitle", {
          name: deleting?.fullName ?? "",
        })}
        description={t("detail.deleteBody")}
        confirmLabel={t("detail.deleteChild")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
