// Wraps every signed-in page. Unlike the layout, a template is rebuilt on each
// navigation, so the fade plays every time a page opens while the sidebar and
// top bar around it stay still.

import type { ReactNode } from "react";

export default function AppTemplate({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="animate-page">{children}</div>;
}
