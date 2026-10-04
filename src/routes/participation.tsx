import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, Lightbulb, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { Loader } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { ideaSchema, isPopular } from "@/lib/participation";
import { fmtDate } from "@/lib/requests";

export const Route = createFileRoute("/participation")({
  head: () => ({
    meta: [
      { title: "Participation citoyenne — Terra Nova" },
      { name: "description", content: "Proposez vos idées et soutenez celles des autres citoyens de Terra Nova." },
      { property: "og:title", content: "Participation citoyenne — Terra Nova" },
      { property: "og:description", content: "Idées et propositions citoyennes pour la planète." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Participation,
});

function Participation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"toutes" | "miennes">("toutes");

  const { data, isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: async () => {
      const [i, s] = await Promise.all([
        supabase.from("ideas").select("*").order("created_at", { ascending: false }),
        supabase.from("idea_supports").select("idea_id,user_id"),
      ]);
      return { ideas: i.data ?? [], supports: s.data ?? [] };
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const p = ideaSchema.safeParse({ title, body });
    if (!p.success) return setError(p.error.issues[0]?.message ?? "Champ invalide");
    setError("");
    setBusy(true);
    const { error } = await supabase.from("ideas").insert(p.data);
    setBusy(false);
    if (error) return toast.error("Impossible de publier l'idée");
    setTitle(""); setBody("");
    toast.success("Idée publiée, merci !");
    qc.invalidateQueries({ queryKey: ["ideas"] });
  };

  const toggle = async (ideaId: string, supported: boolean) => {
    const { error } = supported
      ? await supabase.from("idea_supports").delete().eq("idea_id", ideaId).eq("user_id", user!.id)
      : await supabase.from("idea_supports").insert({ idea_id: ideaId });
    if (error) toast.error("Action impossible");
    qc.invalidateQueries({ queryKey: ["ideas"] });
  };

  const ideas = (data?.ideas ?? []).filter((i) => tab === "toutes" || i.user_id === user?.id || data?.supports.some((s) => s.idea_id === i.id && s.user_id === user?.id));

  return (
    <PageShell title="Participation citoyenne" subtitle="Partagez vos idées pour Terra Nova et soutenez les propositions qui vous inspirent." crumbs={[{ label: "Participation" }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="ideas-h">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id="ideas-h" className="text-xl font-semibold">Propositions</h2>
            {user && (
              <div role="tablist" aria-label="Filtrer les idées" className="flex rounded-xl bg-muted p-1 text-sm">
                {(["toutes", "miennes"] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 ${tab === t ? "bg-background shadow" : "text-muted-foreground"}`}>
                    {t === "toutes" ? "Toutes" : "Mes participations"}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isLoading ? <Loader /> : ideas.length === 0 ? (
            <GlassCard><p className="text-muted-foreground">Aucune idée pour le moment.</p></GlassCard>
          ) : (
            <ul className="space-y-4">
              {ideas.map((i) => {
                const count = data!.supports.filter((s) => s.idea_id === i.id).length;
                const mine = !!user && data!.supports.some((s) => s.idea_id === i.id && s.user_id === user.id);
                return (
                  <li key={i.id}>
                    <GlassCard>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold">
                            {i.title}
                            {isPopular(count) && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs"><Sparkles aria-hidden className="size-3" />Populaire</span>}
                          </h3>
                          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{i.body}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{fmtDate(i.created_at)}</p>
                        </div>
                        <Button variant={mine ? "default" : "outline"} size="sm" disabled={!user} aria-pressed={mine} onClick={() => toggle(i.id, mine)} aria-label={`${mine ? "Retirer mon soutien" : "Soutenir"} : ${i.title}`}>
                          <Heart aria-hidden className={mine ? "fill-current" : ""} /> {count}
                        </Button>
                      </div>
                    </GlassCard>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <aside>
          <GlassCard>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Lightbulb aria-hidden className="size-5 text-cyan" />Déposer une idée</h2>
            {user ? (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-1.5"><Label htmlFor="it">Titre</Label><Input id="it" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="ib">Description</Label><Textarea id="ib" rows={5} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} /></div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full bg-aurora" disabled={busy}>{busy ? "Publication…" : "Publier"}</Button>
              </form>
            ) : (
              <Button asChild className="w-full"><Link to="/connexion">Se connecter pour participer</Link></Button>
            )}
          </GlassCard>
        </aside>
      </div>
    </PageShell>
  );
}
