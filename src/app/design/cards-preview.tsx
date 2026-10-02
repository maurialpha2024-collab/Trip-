// Cards, badges and the empty state, with sample households.
// Delete and edit are wired to local state so the buttons really respond.

"use client";

import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/census/confirm-dialog";
import { EmptyState } from "@/components/census/empty-state";
import { PersonCard, type PersonRole } from "@/components/census/person-card";
import { StatCard } from "@/components/census/stat-card";
import { StatusBadge } from "@/components/census/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Section } from "./section";

type PreviewPerson = {
  id: string;
  role: PersonRole;
  name: string;
  age: number;
  facts: string[];
  deceased?: boolean;
};

const samplePeople: PreviewPerson[] = [
  {
    id: "father",
    role: "father",
    name: "محمد ولد أحمد",
    age: 47,
    facts: ["نواكشوط · تاجر", "متزوج"],
  },
  {
    id: "mother",
    role: "mother",
    name: "مريم بنت سيدي",
    age: 41,
    facts: ["تعليم ثانوي"],
  },
  { id: "son", role: "son", name: "أحمد ولد محمد", age: 12, facts: ["تلميذ"] },
  {
    id: "grandfather",
    role: "father",
    name: "أحمد ولد سالم",
    age: 78,
    facts: ["نواذيبو"],
    deceased: true,
  },
];

export function CardsPreview() {
  const [people, setPeople] = useState(samplePeople);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Section title="البطاقات">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="الأسر المسجلة" value={312} change="+12 هذا الأسبوع" />
        <StatCard label="الأفراد" value={1980} />
        <StatCard label="المسودات" value={24} />
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status="complete" />
        <StatusBadge status="draft" />
      </div>

      {people.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.map((person) => (
            <div
              key={person.id}
              className={cn(
                "rounded-card",
                selectedId === person.id && "ring-indigo ring-2"
              )}
            >
              <PersonCard
                role={person.role}
                name={person.name}
                age={person.age}
                facts={person.facts}
                deceased={person.deceased}
                onEdit={() => setSelectedId(person.id)}
                onDelete={() =>
                  setPeople((current) =>
                    current.filter((item) => item.id !== person.id)
                  )
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UsersIcon}
          message="لا يوجد أفراد في هذه الأسرة بعد."
          action={
            <Button onClick={() => setPeople(samplePeople)}>
              إعادة الأمثلة
            </Button>
          }
        />
      )}

      <ConfirmDialog
        trigger={<Button variant="danger">حذف الطفل</Button>}
        title="حذف أحمد ولد محمد؟"
        description="سيُحذف الطفل من هذه الأسرة نهائياً."
        confirmLabel="حذف الطفل"
        onConfirm={() =>
          setPeople((current) => current.filter((item) => item.id !== "son"))
        }
      />
    </Section>
  );
}
