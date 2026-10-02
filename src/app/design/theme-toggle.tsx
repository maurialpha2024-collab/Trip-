// Switches the preview between light and dark. The real theme control is
// built in task 13; this only flips the class the tokens key off.

"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <Button variant="outline" onClick={toggle}>
      {isDark ? <SunIcon /> : <MoonIcon />}
      {isDark ? "الوضع الفاتح" : "الوضع الداكن"}
    </Button>
  );
}
