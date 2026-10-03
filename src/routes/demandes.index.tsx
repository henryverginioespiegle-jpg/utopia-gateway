import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { RequireAuth, Loader } from "@/components/site/RequireAuth";
import { StatusBadge, statusLabel, type Status } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { fetchEvents, fetchRequests, fmtDate } from "@/lib/requests";
import { categories, categoryLabel } from "@/lib/data";

export const Route = createFileRoute("/demandes/")({
  head: () => ({
    meta: [
      { title: "Mes demandes — Terra Nova" },
      { name: "description", content: "Historique complet et suivi de vos demandes citoyennes." },
      { property: "og:title", content: "Mes demandes — Terra Nova" },
      { property: "og:description", content: "Suivez l'avancement de vos demandes." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MyRequests />
    </RequireAuth>
  ),
});

function MyRequests() {
  const { user } = useAuth();
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["my-requests", user!.id],
    queryFn: async () => {
      const reqs = await fetchRequests(user!.id);
      return { reqs, events: await fetchEvents(reqs.map((r) => r.id)) };
    },
  });
  const list = (data?.reqs ?? []).filter(
    (r) => (status === "all" || r.status === status) && (cat === "all" || r.category === cat) &&
      (!q || `${r.title} ${r.reference}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PageShell title="Mes demandes" subtitle="Historique complet et chronologie de traitement." crumbs={[{ label: "Mes demandes" }]}
      actions={<Button asChild className="bg-aurora"><Link to="/demandes/nouvelle"><Plus aria-hidden /> Nouvelle demande</Link></Button>}>
      <div className="glass mb-6 grid gap-3 rounded-2xl p-4 md:grid-cols-3">
        <div className="relative">
          <label htmlFor="rq" className="sr-only">Rechercher par titre ou référence</label>
          <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="rq" className="pl-9" placeholder="Titre ou référence…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filtrer par statut"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {(Object.keys(statusLabel) as Status[]).map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger aria-label="Filtrer par catégorie"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <Loader /> : list.length === 0 ? (
        <GlassCard className="text-center text-muted-foreground">Aucune demande ne correspond.</GlassCard>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const events = (data?.events ?? []).filter((e) => e.request_id === r.id);
            const open = openId === r.id;
            return (
              <li key={r.id} className="glass rounded-2xl">
                <button onClick={() => setOpenId(open ? null : r.id)} aria-expanded={open} aria-controls={`tl-${r.id}`} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left">
                  <div>
                    <p className="font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.reference} · {categoryLabel(r.category)} · {fmtDate(r.created_at)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </button>
                {open && (
                  <div id={`tl-${r.id}`} className="border-t border-border p-5">
                    <p className="mb-4 text-sm whitespace-pre-wrap text-muted-foreground">{r.description}</p>
                    <h3 className="mb-3 text-sm font-semibold">Chronologie de traitement</h3>
                    <ol className="space-y-3 border-l border-border pl-5">
                      {events.map((e) => (
                        <li key={e.id} className="relative">
                          <span aria-hidden className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-aurora" />
                          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={e.status} /><span className="text-sm">{e.note}</span></div>
                          <p className="mt-1 text-xs text-muted-foreground">{fmtDate(e.created_at)}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
