// The staff list and everything that can be done to an account.

"use client";

import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resetStaffMfa, setStaffActive } from "./actions";
import { AgentFormDialog, type AgentFormValue } from "./agent-form-dialog";
import { ConfirmPasswordDialog } from "./confirm-password-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

export type StaffRow = {
  id: string;
  fullName: string;
  username: string;
  role: "admin" | "agent";
  isActive: boolean;
  households: number;
  lastLogin: string | null;
};

type Confirming = { kind: "active" | "mfa"; row: StaffRow };

export function AgentsTable({ staff }: { staff: StaffRow[] }) {
  const t = useTranslations();
  const router = useRouter();

  const [editing, setEditing] = useState<AgentFormValue | null>(null);
  const [resetting, setResetting] = useState<StaffRow | null>(null);
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  function menu(row: StaffRow) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("detail.more")}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              setEditing({
                id: row.id,
                fullName: row.fullName,
                username: row.username,
                role: row.role,
              })
            }
          >
            {t("common.edit")}
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setResetting(row)}>
            {t("staff.changePassword")}
          </DropdownMenuItem>

          {row.role === "admin" ? (
            <DropdownMenuItem
              onSelect={() => setConfirming({ kind: "mfa", row })}
            >
              {t("staff.resetMfa")}
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem
            variant={row.isActive ? "destructive" : "default"}
            onSelect={() => setConfirming({ kind: "active", row })}
          >
            {row.isActive ? t("staff.deactivate") : t("staff.activate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function statusBadge(row: StaffRow) {
    return (
      <Badge
        className={
          row.isActive
            ? "bg-success/15 text-success"
            : "bg-ink-muted/15 text-ink-muted"
        }
      >
        {row.isActive ? t("staff.active") : t("staff.inactive")}
      </Badge>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() =>
            setEditing({ id: null, fullName: "", username: "", role: "agent" })
          }
        >
          <PlusIcon />
          {t("staff.addAgent")}
        </Button>
      </div>

      <div className="rounded-card border-line bg-surface hidden overflow-hidden border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t("staff.name")}</TableHead>
              <TableHead className="text-start">{t("staff.username")}</TableHead>
              <TableHead className="text-start">{t("staff.role")}</TableHead>
              <TableHead className="text-start">
                {t("staff.accountStatus")}
              </TableHead>
              <TableHead className="text-start">
                {t("staff.households")}
              </TableHead>
              <TableHead className="text-start">
                {t("staff.lastLogin")}
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {staff.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-start">{row.fullName}</TableCell>
                <TableCell className="text-start font-mono text-sm">
                  {row.username}
                </TableCell>
                <TableCell className="text-start">
                  {row.role === "admin" ? t("roles.admin") : t("roles.agent")}
                </TableCell>
                <TableCell className="text-start">{statusBadge(row)}</TableCell>
                <TableCell className="text-start">{row.households}</TableCell>
                <TableCell className="text-small text-ink-muted text-start">
                  {row.lastLogin ?? t("staff.never")}
                </TableCell>
                <TableCell className="text-end">{menu(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="stagger-rise space-y-2 lg:hidden">
        {staff.map((row) => (
          <li
            key={row.id}
            className="rounded-card border-line bg-surface flex items-start justify-between gap-2 border p-4"
          >
            <div className="min-w-0 text-start">
              <p className="text-label text-ink truncate">{row.fullName}</p>
              <p className="text-small text-ink-muted font-mono">
                {row.username}
              </p>
              <p className="text-small text-ink-muted mt-1">
                {row.role === "admin" ? t("roles.admin") : t("roles.agent")} ·{" "}
                {row.households} · {row.lastLogin ?? t("staff.never")}
              </p>
              <div className="mt-2">{statusBadge(row)}</div>
            </div>
            {menu(row)}
          </li>
        ))}
      </ul>

      {editing ? (
        <AgentFormDialog
          key={editing.id ?? "new"}
          value={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {resetting ? (
        <ResetPasswordDialog
          key={resetting.id}
          id={resetting.id}
          username={resetting.username}
          onClose={() => setResetting(null)}
        />
      ) : null}

      {confirming ? (
        <ConfirmPasswordDialog
          key={`${confirming.kind}-${confirming.row.id}`}
          title={
            confirming.kind === "mfa"
              ? t("staff.resetMfa")
              : confirming.row.isActive
                ? t("staff.deactivate")
                : t("staff.activate")
          }
          description={confirming.row.fullName}
          confirmLabel={t("common.save")}
          danger={confirming.kind === "active" && confirming.row.isActive}
          onConfirm={async (ownPassword) => {
            const result =
              confirming.kind === "mfa"
                ? await resetStaffMfa({ id: confirming.row.id, ownPassword })
                : await setStaffActive({
                    id: confirming.row.id,
                    active: !confirming.row.isActive,
                    ownPassword,
                  });

            if (result.ok) {
              toast.success(
                confirming.kind === "mfa"
                  ? t("staff.mfaReset")
                  : t("staff.updated")
              );
              router.refresh();
            }

            return result;
          }}
          onClose={() => setConfirming(null)}
        />
      ) : null}
    </div>
  );
}
