import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FilePlus2, ListChecks, MessageSquare, Newspaper, Inbox, Loader2, CheckCircle2, Activity } from "lucide-react";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { RequireAuth, Loader } from "@/components/site/RequireAuth";
import { StatusBadge } from "@/components/site/StatusBadge";
import { useAuth } from "@/lib/auth";
import { fetchEvents, fetchRequests, fmtDate } from "@/lib/requests";
import { categoryLabel } from "@/lib/data";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Mon espace citoyen — Terra Nova" },
      { name: "description", content: "Votre tableau de bord citoyen : demandes, statuts et activités." },
      { property: "og:title", content: "Mon espace citoyen — Terra Nova" },
      { property: "og:description", content: "Suivez vos démarches sur Terra Nova." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const quick = [
  { to: "/demandes/nouvelle", label: "Nouvelle demande", icon: FilePlus2 },
  { to: "/demandes", label: "Mes demandes", icon: ListChecks },
  { to: "/contact", label: "Contacter l'administration", icon: MessageSquare },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
] as const;

function Dashboard() {
  const { user, fullName } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-requests", user!.id],
    queryFn: async () => {
      const reqs = await fetchRequests(user!.id);
      const events = await fetchEvents(reqs.map((r) => r.id));
      return { reqs, events };
    },
  });
  const reqs = data?.reqs ?? [];
  const count = (s: string) => reqs.filter((r) => r.status === s).length;
  const kpis = [
    { label: "Demandes totales", value: reqs.length, icon: Activity },
    { label: "Reçues", value: count("recue"), icon: Inbox },
    { label: "En cours", value: count("en_cours"), icon: Loader2 },
    { label: "Résolues", value: count("resolue"), icon: CheckCircle2 },
  ];
  const activity = [...(data?.events ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
  const refOf = (id: string) => reqs.find((r) => r.id === id);

  return (
    <PageShell title={`Bonjour, ${fullName.split(" ")[0] || "citoyen"} 👋`} subtitle="Voici un aperçu de vos démarches sur Terra Nova." crumbs={[{ label: "Mon espace" }]}>
      {isLoading ? <Loader /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="holo">
                  <k.icon aria-hidden className="size-5 text-cyan" />
                  <p className="mt-3 font-display text-3xl font-semibold">{k.value}</p>
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <h2 className="text-lg font-semibold">Statut de mes démarches</h2>
              {reqs.length === 0 ? (
                <p className="mt-4 text-muted-foreground">Aucune demande pour l'instant. <Link to="/demandes/nouvelle" className="text-cyan underline">Créer ma première demande</Link></p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {reqs.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.reference} · {categoryLabel(r.category)} · {fmtDate(r.created_at)}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
            <GlassCard>
              <h2 className="text-lg font-semibold">Actions rapides</h2>
              <div className="mt-4 grid gap-2">
                {quick.map((q) => (
                  <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent">
                    <q.icon aria-hidden className="size-5 text-cyan" /> {q.label}
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
          <GlassCard>
            <h2 className="text-lg font-semibold">Historique des activités</h2>
            {activity.length === 0 ? <p className="mt-4 text-muted-foreground">Aucune activité récente.</p> : (
              <ol className="mt-4 space-y-3 border-l border-border pl-5">
                {activity.map((e) => (
                  <li key={e.id} className="relative">
                    <span aria-hidden className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-aurora" />
                    <p className="text-sm"><strong>{refOf(e.request_id)?.reference}</strong> — {e.note}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(e.created_at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </GlassCard>
        </div>
      )}
    </PageShell>
  );
}
