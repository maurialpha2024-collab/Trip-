// The lineage rail and the leatherwork pattern, the two pieces that carry
// the app's identity.

import { LineageRail } from "@/components/census/lineage-rail";
import { GeoPattern } from "@/components/census/geo-pattern";
import { Section } from "./section";

const levels = [
  { label: "العائلة الكبيرة", value: "أهل محمد عبد الله", href: "#" },
  { label: "العائلة الصغيرة", value: "أولاد الشيخ", href: "#" },
  { label: "الأسرة", value: "أسرة محمد ولد أحمد" },
  { label: "الأفراد", value: "6 أفراد" },
];

export function LineagePreview() {
  return (
    <Section title="سلسلة النسب والزخرفة">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-surface p-4">
          <LineageRail levels={levels} currentIndex={2} />
        </div>

        <div className="rounded-card bg-indigo-deep text-ochre relative min-h-40 overflow-hidden">
          <GeoPattern className="absolute inset-0 opacity-40" />
        </div>
      </div>
    </Section>
  );
}
