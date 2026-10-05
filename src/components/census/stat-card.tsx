// One figure on the admin dashboard: the number, what it counts,
// and an optional note about how it changed.

type StatCardProps = {
  label: string;
  value: number;
  change?: string;
};

export function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4 text-start transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_var(--indigo)]">
      {/* en-US keeps Western digits and thousand separators in Arabic pages. */}
      <p className="text-stat text-ink">{value.toLocaleString("en-US")}</p>
      <p className="text-label text-ink-muted mt-1">{label}</p>
      {change ? <p className="text-small text-success mt-2">{change}</p> : null}
    </div>
  );
}
