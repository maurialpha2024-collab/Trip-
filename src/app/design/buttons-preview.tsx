// The four button kinds plus the saving and disabled states.

import { Button } from "@/components/ui/button";
import { Section } from "./section";

export function ButtonsPreview() {
  return (
    <Section title="الأزرار">
      <div className="rounded-card border border-line bg-surface flex flex-wrap items-center gap-3 p-4">
        <Button>حفظ</Button>
        <Button variant="outline">إلغاء</Button>
        <Button variant="ghost">تخطي</Button>
        <Button variant="danger">حذف الطفل</Button>
        <Button loading>جارٍ الحفظ…</Button>
        <Button disabled>غير متاح</Button>
      </div>
    </Section>
  );
}
