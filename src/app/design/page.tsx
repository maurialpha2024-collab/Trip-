// Preview of every shared design piece, for review before the real pages
// are built. Removed in task 13.

import { PageHeader } from "@/components/census/page-header";
import { ButtonsPreview } from "./buttons-preview";
import { CardsPreview } from "./cards-preview";
import { ColorsPreview } from "./colors-preview";
import { FormsPreview } from "./forms-preview";
import { LineagePreview } from "./lineage-preview";
import { ThemeToggle } from "./theme-toggle";
import { TypographyPreview } from "./typography-preview";

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8">
      <PageHeader
        title="نظام التصميم"
        description="معاينة للعناصر المشتركة قبل بناء الصفحات."
        actions={<ThemeToggle />}
      />
      <ColorsPreview />
      <TypographyPreview />
      <ButtonsPreview />
      <CardsPreview />
      <FormsPreview />
      <LineagePreview />
    </main>
  );
}
