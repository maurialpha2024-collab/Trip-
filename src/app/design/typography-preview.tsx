// The type scale, so the Amiri and Readex Pro pairing can be checked together.

import { Section } from "./section";

const samples = [
  { style: "title-page", className: "text-title-page", text: "إحصاء الأسر" },
  {
    style: "title-family",
    className: "text-title-family",
    text: "أهل محمد عبد الله",
  },
  { style: "heading", className: "text-heading", text: "بيانات الأسرة" },
  {
    style: "body",
    className: "text-body",
    text: "تُسجَّل كل أسرة مع أفرادها ومكان إقامتها.",
  },
  { style: "label", className: "text-label", text: "الاسم الكامل" },
  { style: "small", className: "text-small", text: "آخر تحديث 12 مارس 2026" },
  { style: "stat", className: "text-stat", text: "1,980" },
];

export function TypographyPreview() {
  return (
    <Section title="الخطوط">
      <ul className="rounded-card border border-line bg-surface divide-line divide-y">
        {samples.map((sample) => (
          <li
            key={sample.style}
            className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <span className={`${sample.className} text-ink text-start`}>
              {sample.text}
            </span>
            <span className="text-small text-ink-muted shrink-0">
              {sample.style}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
