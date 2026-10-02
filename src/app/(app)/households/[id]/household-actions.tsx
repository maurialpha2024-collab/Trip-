// The buttons beside the household title: edit its details, and the ⋯ menu
// holding print and delete.

"use client";

import { MoreHorizontalIcon, PrinterIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/census/confirm-dialog";
import { FormField } from "@/components/census/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { wilayas, type Locale } from "@/lib/constants";
import { OptionSelect } from "../new/person-fields";
import { deleteHousehold, updateHousehold } from "./actions";

export type HouseholdDetails = {
  smallFamilyId: string;
  familyName: string;
  wilaya: string;
  city: string;
  addressNotes: string;
};

type HouseholdActionsProps = {
  householdId: string;
  details: HouseholdDetails;
  smallFamilies: { id: string; name: string }[];
  isAdmin: boolean;
  canDelete: boolean;
  locale: Locale;
};

export function HouseholdActions({
  householdId,
  details,
  smallFamilies,
  isAdmin,
  canDelete,
  locale,
}: HouseholdActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(details);

  async function save() {
    setSaving(true);
    const result = await updateHousehold(householdId, form);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(t("detail.saved"));
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        onClick={() => {
          setForm(details);
          setEditing(true);
        }}
      >
        {t("detail.editHousehold")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("detail.more")}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => window.print()}>
            <PrinterIcon className="size-4" aria-hidden="true" />
            {t("detail.print")}
          </DropdownMenuItem>

          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirming(true)}
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
              {t("detail.deleteHousehold")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-heading text-ink text-start">
              {t("detail.editHousehold")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label={t("fields.householdName")}>
                {(control) => (
                  <Input
                    {...control}
                    value={form.familyName}
                    onChange={(event) =>
                      setForm({ ...form, familyName: event.target.value })
                    }
                  />
                )}
              </FormField>
            </div>

            {isAdmin ? (
              <div className="sm:col-span-2">
                <OptionSelect
                  label={t("detail.moveFamily")}
                  value={form.smallFamilyId}
                  onChange={(next) => setForm({ ...form, smallFamilyId: next })}
                  options={smallFamilies.map((family) => ({
                    key: family.id,
                    label: family.name,
                  }))}
                />
              </div>
            ) : null}

            <OptionSelect
              label={t("fields.wilaya")}
              value={form.wilaya}
              onChange={(next) => setForm({ ...form, wilaya: next })}
              options={wilayas.map((item) => ({
                key: item.key,
                label: item[locale],
              }))}
            />

            <FormField label={t("fields.city")}>
              {(control) => (
                <Input
                  {...control}
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                />
              )}
            </FormField>

            <div className="sm:col-span-2">
              <FormField label={t("fields.addressNotes")}>
                {(control) => (
                  <Textarea
                    {...control}
                    rows={3}
                    value={form.addressNotes}
                    onChange={(event) =>
                      setForm({ ...form, addressNotes: event.target.value })
                    }
                  />
                )}
              </FormField>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={save} loading={saving}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("detail.deleteTitle", { family: details.familyName })}
        description={t("detail.deleteBody")}
        confirmLabel={t("detail.deleteHousehold")}
        onConfirm={async () => {
          await deleteHousehold(householdId);
        }}
      />
    </div>
  );
}
