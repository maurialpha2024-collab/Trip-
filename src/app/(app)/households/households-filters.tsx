// Search and filters for the households list. Every choice is written to the
// URL, so a filtered list can be bookmarked and the back button behaves.

"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { wilayas, type Locale } from "@/lib/constants";

const searchDelayMs = 300;

export type FilterFamily = {
  id: string;
  name: string;
  smallFamilies: { id: string; name: string }[];
};

type FiltersProps = {
  // null hides the family and wilaya filters: an agent only needs to search
  // their own list and filter it by status.
  largeFamilies: FilterFamily[] | null;
  agents: { id: string; fullName: string }[] | null;
  locale: Locale;
  searchPlaceholder?: string;
};

export function HouseholdsFilters({
  largeFamilies,
  agents,
  locale,
  searchPlaceholder,
}: FiltersProps) {
  const t = useTranslations("list");
  const tStatus = useTranslations("status");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value.length === 0) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Any change to the filters starts again from the first page.
      params.delete("page");
      router.replace(params.size > 0 ? `${pathname}?${params}` : pathname);
    },
    [pathname, router, searchParams]
  );

  // Wait until typing stops before touching the URL.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (current === query) {
      return;
    }

    const timer = setTimeout(() => setParam("q", query), searchDelayMs);
    return () => clearTimeout(timer);
  }, [query, searchParams, setParam]);

  const selectedLarge = searchParams.get("large") ?? "";
  const smallFamilies =
    largeFamilies?.find((family) => family.id === selectedLarge)
      ?.smallFamilies ?? [];

  const hasFilters = ["q", "large", "small", "wilaya", "status", "agent"].some(
    (key) => searchParams.get(key)
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={searchId} className="text-label text-ink">
          {t("search")}
        </Label>
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder ?? t("searchPlaceholder")}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        {largeFamilies ? (
          <>
            <FilterSelect
              label={t("lineage")}
              value={selectedLarge}
              onChange={(value) => {
                setParam("small", null);
                setParam("large", value);
              }}
              allLabel={t("all")}
              options={largeFamilies.map((family) => ({
                key: family.id,
                label: family.name,
              }))}
            />

            {selectedLarge ? (
              <FilterSelect
                label={t("familyName")}
                value={searchParams.get("small") ?? ""}
                onChange={(value) => setParam("small", value)}
                allLabel={t("all")}
                options={smallFamilies.map((family) => ({
                  key: family.id,
                  label: family.name,
                }))}
              />
            ) : null}

            <FilterSelect
              label={t("wilaya")}
              value={searchParams.get("wilaya") ?? ""}
              onChange={(value) => setParam("wilaya", value)}
              allLabel={t("all")}
              options={wilayas.map((item) => ({
                key: item.key,
                label: item[locale],
              }))}
            />
          </>
        ) : null}

        <FilterSelect
          label={t("status")}
          value={searchParams.get("status") ?? ""}
          onChange={(value) => setParam("status", value)}
          allLabel={t("all")}
          options={[
            { key: "complete", label: tStatus("complete") },
            { key: "draft", label: tStatus("draft") },
          ]}
        />

        {agents ? (
          <FilterSelect
            label={t("agent")}
            value={searchParams.get("agent") ?? ""}
            onChange={(value) => setParam("agent", value)}
            allLabel={t("all")}
            options={agents.map((agent) => ({
              key: agent.id,
              label: agent.fullName,
            }))}
          />
        ) : null}

        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              router.replace(pathname);
            }}
          >
            {t("clearFilters")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { key: string; label: string }[];
  allLabel: string;
};

const allValue = "__all__";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: FilterSelectProps) {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-label text-ink">
        {label}
      </Label>
      <Select
        value={value === "" ? allValue : value}
        onValueChange={(next) => onChange(next === allValue ? "" : next)}
      >
        <SelectTrigger id={id} className="min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={allValue}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
