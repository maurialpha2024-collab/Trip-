// Every colour token as a swatch, so light and dark values can be compared.

import { Section } from "./section";

// Class names are written out in full because Tailwind scans source text.
const swatches = [
  { token: "canvas", className: "bg-canvas" },
  { token: "surface", className: "bg-surface" },
  { token: "ink", className: "bg-ink" },
  { token: "ink-muted", className: "bg-ink-muted" },
  { token: "line", className: "bg-line" },
  { token: "indigo", className: "bg-indigo" },
  { token: "indigo-deep", className: "bg-indigo-deep" },
  { token: "indigo-soft", className: "bg-indigo-soft" },
  { token: "ochre", className: "bg-ochre" },
  { token: "success", className: "bg-success" },
  { token: "warning", className: "bg-warning" },
  { token: "danger", className: "bg-danger" },
];

export function ColorsPreview() {
  return (
    <Section title="الألوان">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((swatch) => (
          <li
            key={swatch.token}
            className="rounded-card border border-line bg-surface overflow-hidden"
          >
            <div className={`${swatch.className} h-14 w-full`} />
            <p className="text-small text-ink-muted px-3 py-2 text-start">
              {swatch.token}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
