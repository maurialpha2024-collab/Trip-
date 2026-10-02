// Small display choices kept in cookies rather than localStorage, so the
// server renders the right theme and sidebar width on the first paint and the
// page never flashes the wrong one.

export const themeCookieName = "theme";
export const sidebarCookieName = "sidebar";

export type Theme = "light" | "dark";
export type SidebarState = "expanded" | "collapsed";

export const defaultTheme: Theme = "light";
export const defaultSidebarState: SidebarState = "expanded";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function isSidebarState(
  value: string | undefined
): value is SidebarState {
  return value === "expanded" || value === "collapsed";
}
