import { cn } from "@/lib/utils";

export type Status = "recue" | "en_cours" | "resolue";
export const statusLabel: Record<Status, string> = { recue: "Reçue", en_cours: "En cours", resolue: "Résolue" };

const styles: Record<Status, string> = {
  recue: "border-primary/40 bg-primary/10 text-primary",
  en_cours: "border-warning/40 bg-warning/10 text-warning",
  resolue: "border-success/40 bg-success/10 text-success",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", styles[status])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}
