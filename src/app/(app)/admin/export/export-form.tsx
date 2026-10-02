// Chooses what to export and downloads it. The file is fetched rather than
// linked, so the button can show "جارٍ التحضير…" while the server builds it.

"use client";

import { DownloadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OptionSelect } from "../../households/new/person-fields";
import { countForExport, type ExportCounts } from "./actions";

export type ExportFamily = {
  id: string;
  name: string;
  smallFamilies: { id: string; name: string }[];
};

// Radix rejects an empty string as a select value, so "everything" needs its
// own key that is translated back to "no filter".
const allKey = "__all__";

export function ExportForm({ families }: { families: ExportFamily[] }) {
  const t = useTranslations("export");
  const statusId = useId();
  const hideId = useId();

  const [large, setLarge] = useState("");
  const [small, setSmall] = useState("");
  const [completeOnly, setCompleteOnly] = useState(true);
  const [hideSensitive, setHideSensitive] = useState(false);
  const [counts, setCounts] = useState<ExportCounts>({
    households: 0,
    persons: 0,
  });
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    let current = true;

    countForExport({
      large: large === "" ? null : large,
      small: small === "" ? null : small,
      completeOnly,
    }).then((result) => {
      if (current) {
        setCounts(result);
      }
    });

    return () => {
      current = false;
    };
  }, [large, small, completeOnly]);

  const smallFamilies =
    families.find((family) => family.id === large)?.smallFamilies ?? [];

  async function download() {
    setPreparing(true);

    try {
      const params = new URLSearchParams();
      if (large) {
        params.set("large", large);
      }
      if (small) {
        params.set("small", small);
      }
      params.set("status", completeOnly ? "complete" : "all");
      if (hideSensitive) {
        params.set("hide", "1");
      }

      const response = await fetch(`/api/export?${params}`);
      if (!response.ok) {
        throw new Error("export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? "census.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("preparing"));
    } finally {
      setPreparing(false);
    }
  }

  return (
    <section className="rounded-card border-line bg-surface space-y-5 border p-4">
      <h2 className="text-heading text-ink text-start">{t("whatToExport")}</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <OptionSelect
          label={t("columns.largeFamily")}
          value={large === "" ? allKey : large}
          onChange={(next) => {
            setSmall("");
            setLarge(next === allKey ? "" : next);
          }}
          options={[
            { key: allKey, label: t("all") },
            ...families.map((family) => ({
              key: family.id,
              label: family.name,
            })),
          ]}
        />

        <OptionSelect
          label={t("columns.smallFamily")}
          value={small === "" ? allKey : small}
          onChange={(next) => setSmall(next === allKey ? "" : next)}
          options={[
            { key: allKey, label: t("all") },
            ...smallFamilies.map((family) => ({
              key: family.id,
              label: family.name,
            })),
          ]}
        />
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-label text-ink">{t("columns.status")}</legend>
        <RadioGroup
          value={completeOnly ? "complete" : "all"}
          onValueChange={(next) => setCompleteOnly(next === "complete")}
          className="flex flex-wrap gap-6"
        >
          <span className="flex items-center gap-2">
            <RadioGroupItem value="complete" id={`${statusId}-complete`} />
            <Label htmlFor={`${statusId}-complete`}>{t("completeOnly")}</Label>
          </span>
          <span className="flex items-center gap-2">
            <RadioGroupItem value="all" id={`${statusId}-all`} />
            <Label htmlFor={`${statusId}-all`}>{t("all")}</Label>
          </span>
        </RadioGroup>
      </fieldset>

      <div className="flex items-center gap-2">
        <Checkbox
          id={hideId}
          checked={hideSensitive}
          onCheckedChange={(checked) => setHideSensitive(checked === true)}
        />
        <Label htmlFor={hideId} className="text-label text-ink">
          {t("hideSensitive")}
        </Label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-ink text-start">
          {t("preview", {
            households: String(counts.households),
            persons: String(counts.persons),
          })}
        </p>

        <Button
          onClick={download}
          loading={preparing}
          disabled={counts.households === 0}
        >
          <DownloadIcon />
          {preparing ? t("preparing") : t("download")}
        </Button>
      </div>
    </section>
  );
}
