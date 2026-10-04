import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { RequireAuth, Loader } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/requests";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal d'audit — Terra Nova" },
      { name: "description", content: "Traçabilité des actions sur le portail Terra Nova, réservée aux agents." },
      { property: "og:title", content: "Journal d'audit — Terra Nova" },
      { property: "og:description", content: "Historique des actions et connexions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RequireAuth staff><Journal /></RequireAuth>,
});

function Journal() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });
  const rows = (data ?? []).filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["date,action,objet,reference,acteur,details", ...rows.map((r) => [r.created_at, r.action, r.entity, r.entity_id, r.actor_id, JSON.stringify(r.details)].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `journal-terra-nova-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  return (
    <PageShell title="Journal d'audit" subtitle="Connexions, créations, modifications, suppressions et changements de rôle." crumbs={[{ label: "Journal" }]}
      actions={<Button variant="outline" onClick={exportCsv} disabled={!rows.length}><Download aria-hidden />Exporter CSV</Button>}>
      <div className="relative mb-4 max-w-md">
        <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Rechercher dans le journal" placeholder="Rechercher…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading ? <Loader /> : (
        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground"><tr>{["Date", "Action", "Objet", "Référence", "Détails"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="whitespace-nowrap px-4 py-2">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-2">{r.action}</td>
                  <td className="px-4 py-2">{r.entity}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.entity_id}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{r.details ? JSON.stringify(r.details) : ""}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Aucune entrée.</td></tr>}
            </tbody>
          </table>
        </GlassCard>
      )}
    </PageShell>
  );
}
