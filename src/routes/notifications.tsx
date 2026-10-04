import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Archive, Bell, CheckCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { RequireAuth, Loader } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fmtDate } from "@/lib/requests";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Terra Nova" },
      { name: "description", content: "Vos notifications citoyennes : demandes, sécurité et actualités." },
      { property: "og:title", content: "Notifications — Terra Nova" },
      { property: "og:description", content: "Restez informé de vos démarches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RequireAuth><Notifications /></RequireAuth>,
});

function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [archived, setArchived] = useState(false);
  const key = ["notifications", user!.id];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const update = async (ids: string[], patch: { read_at?: string; archived?: boolean }) => {
    if (!ids.length) return;
    await supabase.from("notifications").update(patch).in("id", ids);
    qc.invalidateQueries({ queryKey: key });
  };
  const list = (data ?? []).filter((n) => n.archived === archived);
  const unread = list.filter((n) => !n.read_at).map((n) => n.id);

  return (
    <PageShell title="Notifications" crumbs={[{ label: "Notifications" }]}
      actions={<div className="flex gap-2">
        <Button variant="outline" onClick={() => setArchived(!archived)}>{archived ? "Voir les actives" : "Voir les archives"}</Button>
        {!archived && <Button variant="outline" disabled={!unread.length} onClick={() => update(unread, { read_at: new Date().toISOString() })}><CheckCheck aria-hidden />Tout marquer lu</Button>}
      </div>}>
      {isLoading ? <Loader /> : list.length === 0 ? <GlassCard><p className="text-muted-foreground">Aucune notification.</p></GlassCard> : (
        <ul className="space-y-3">
          {list.map((n) => (
            <li key={n.id}>
              <GlassCard className={`flex items-start gap-4 ${n.read_at ? "opacity-70" : ""}`}>
                {n.kind === "securite" ? <ShieldAlert aria-hidden className="mt-0.5 size-5 text-destructive" /> : <Bell aria-hidden className="mt-0.5 size-5 text-cyan" />}
                <div className="flex-1">
                  <p className="font-medium">{!n.read_at && <span className="sr-only">Non lue : </span>}{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDate(n.created_at)}</p>
                </div>
                <div className="flex gap-1">
                  {!n.read_at && <Button size="sm" variant="ghost" onClick={() => update([n.id], { read_at: new Date().toISOString() })}>Marquer lu</Button>}
                  <Button size="icon" variant="ghost" aria-label={n.archived ? "Désarchiver" : "Archiver"} onClick={() => update([n.id], { archived: !n.archived, read_at: n.read_at ?? new Date().toISOString() })}><Archive aria-hidden /></Button>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
