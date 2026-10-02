// Paging maths shared by the admin list and the agent's own list, so both read
// the page number and build links the same way.

export type ListParams = Record<string, string | undefined>;

export const pageSize = 25;

// A missing, negative or non-numeric ?page= falls back to the first page.
export function pageFrom(value: string | undefined): number {
  return Math.max(Number(value ?? "1") || 1, 1);
}

// The current filters with a different page number, for the previous/next links.
export function listHref(params: ListParams, page: number): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") {
      next.set(key, value);
    }
  }

  next.set("page", String(page));
  return `/households?${next}`;
}
