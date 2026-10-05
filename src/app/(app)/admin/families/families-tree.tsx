// The family structure agents choose from, as a tree joined by the ochre rail.
// Deleting is refused while anything still points at a family, and the refusal
// says how many records are in the way.

"use client";

import { ChevronDownIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/census/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesSearch } from "@/lib/arabic";
import { deleteLargeFamily, deleteSmallFamily } from "./actions";
import { FamilyFormDialog, type FamilyFormValue } from "./family-form-dialog";

export type TreeSmallFamily = {
  id: string;
  name: string;
  notes: string;
  households: number;
};

export type TreeLargeFamily = {
  id: string;
  name: string;
  notes: string;
  smallFamilies: TreeSmallFamily[];
};

type Pending = { kind: "large" | "small"; id: string; name: string };

export function FamiliesTree({ families }: { families: TreeLargeFamily[] }) {
  const t = useTranslations();
  const router = useRouter();
  const searchId = useId();

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FamilyFormValue | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const visible = families.filter(
    (family) =>
      matchesSearch(family.name, query) ||
      family.smallFamilies.some((small) => matchesSearch(small.name, query))
  );

  const largeOptions = families.map((family) => ({
    id: family.id,
    name: family.name,
  }));

  async function confirmDelete() {
    if (!pending) {
      return;
    }

    const result =
      pending.kind === "large"
        ? await deleteLargeFamily(pending.id)
        : await deleteSmallFamily(pending.id);

    const blocked = pending.kind;
    setPending(null);

    if (result.ok) {
      toast.success(t("families.deleted"));
      router.refresh();
      return;
    }

    if (result.blockedBy === null) {
      toast.error(t("common.delete"));
      return;
    }

    toast.error(
      blocked === "large"
        ? t("families.deleteBlockedSmall", { count: String(result.blockedBy) })
        : t("families.deleteBlockedHouseholds", {
            count: String(result.blockedBy),
          })
    );
  }

  function menu(item: Pending, onEdit: () => void) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" onClick={onEdit}>
          {t("common.edit")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("detail.more")}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setPending(item)}
            >
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-60 flex-1 space-y-1.5">
          <Label htmlFor={searchId} className="text-label text-ink">
            {t("families.search")}
          </Label>
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("families.search")}
          />
        </div>

        <Button
          onClick={() =>
            setEditing({
              id: null,
              name: "",
              notes: "",
              largeFamilyId: null,
            })
          }
        >
          <PlusIcon />
          {t("families.addLarge")}
        </Button>
      </div>

      <ul className="stagger-rise space-y-2">
        {visible.map((family) => {
          const isOpen = openId === family.id;
          const households = family.smallFamilies.reduce(
            (sum, small) => sum + small.households,
            0
          );

          return (
            <li
              key={family.id}
              className="rounded-card border-line bg-surface border p-3"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-expanded={isOpen}
                  aria-label={
                    isOpen ? t("families.collapse") : t("families.expand")
                  }
                  onClick={() => setOpenId(isOpen ? null : family.id)}
                >
                  <ChevronDownIcon
                    className={isOpen ? "rotate-180" : undefined}
                  />
                </Button>

                <div className="min-w-0 flex-1 text-start">
                  <p className="text-title-family text-ink truncate">
                    {family.name}
                  </p>
                  <p className="text-small text-ink-muted">
                    {t("families.counts", {
                      small: String(family.smallFamilies.length),
                      households: String(households),
                    })}
                  </p>
                </div>

                {menu({ kind: "large", id: family.id, name: family.name }, () =>
                  setEditing({
                    id: family.id,
                    name: family.name,
                    notes: family.notes,
                    largeFamilyId: null,
                  })
                )}
              </div>

              {isOpen ? (
                <ul className="border-ochre/40 mt-3 space-y-2 border-s-2 ps-4">
                  {family.smallFamilies.map((small) => (
                    <li key={small.id} className="flex items-center gap-2">
                      <div className="min-w-0 flex-1 text-start">
                        <p className="text-label text-ink truncate">
                          {small.name}
                        </p>
                        <p className="text-small text-ink-muted">
                          {t("families.householdCount", {
                            count: String(small.households),
                          })}
                        </p>
                      </div>

                      {menu(
                        { kind: "small", id: small.id, name: small.name },
                        () =>
                          setEditing({
                            id: small.id,
                            name: small.name,
                            notes: small.notes,
                            largeFamilyId: family.id,
                          })
                      )}
                    </li>
                  ))}

                  <li>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          id: null,
                          name: "",
                          notes: "",
                          largeFamilyId: family.id,
                        })
                      }
                    >
                      <PlusIcon />
                      {t("families.addSmall", { family: family.name })}
                    </Button>
                  </li>
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {editing ? (
        <FamilyFormDialog
          key={editing.id ?? "new"}
          value={editing}
          largeFamilies={largeOptions}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(next) => (next ? undefined : setPending(null))}
        title={t("families.deleteTitle", { name: pending?.name ?? "" })}
        description={t("detail.deleteBody")}
        confirmLabel={t("common.delete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
