import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categories, type CategoryId } from "@/lib/data";

export const Route = createFileRoute("/demandes/nouvelle")({
  validateSearch: z.object({ categorie: z.string().optional(), service: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Nouvelle demande — Terra Nova" },
      { name: "description", content: "Déposez une demande auprès des services municipaux de Terra Nova." },
      { property: "og:title", content: "Nouvelle demande — Terra Nova" },
      { property: "og:description", content: "Créez une demande citoyenne en quelques secondes." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewRequest />
    </RequireAuth>
  ),
});

const schema = z.object({
  category: z.string().min(1, "Choisissez une catégorie"),
  title: z.string().trim().min(3, "Titre trop court").max(120),
  description: z.string().trim().min(10, "Décrivez votre besoin (10 caractères minimum)").max(2000),
});

function NewRequest() {
  const search = Route.useSearch();
  const [category, setCategory] = useState<string>(search.categorie ?? "");
  const [title, setTitle] = useState(search.service ?? "");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ category, title, description });
    if (!p.success) return setError(p.error.issues[0]?.message ?? "Champ invalide");
    setError("");
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("requests").insert({ ...p.data, user_id: u.user!.id }).select("reference").single();
    setBusy(false);
    if (error) return toast.error("Envoi impossible, réessayez.");
    toast.success("Demande envoyée avec succès");
    setDone(data.reference);
  };

  if (done) {
    return (
      <PageShell title="Demande envoyée" crumbs={[{ label: "Mes demandes", to: "/demandes" }, { label: "Confirmation" }]}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="mx-auto max-w-lg text-center shadow-glow">
            <CheckCircle2 aria-hidden className="mx-auto size-16 text-success" />
            <h2 className="mt-4 text-2xl font-semibold" role="status">Votre demande a bien été reçue</h2>
            <p className="mt-2 text-muted-foreground">Référence de suivi :</p>
            <p className="mt-1 font-display text-2xl text-gradient">{done}</p>
            <p className="mt-4 text-sm text-muted-foreground">Un agent municipal va la prendre en charge. Vous pouvez suivre son avancement à tout moment.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild className="bg-aurora"><Link to="/demandes">Suivre mes demandes</Link></Button>
              <Button variant="outline" onClick={() => { setDone(null); setTitle(""); setDescription(""); }}>Nouvelle demande</Button>
            </div>
          </GlassCard>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Nouvelle demande" subtitle="Décrivez votre besoin : nos agents vous répondent rapidement." crumbs={[{ label: "Mes demandes", to: "/demandes" }, { label: "Nouvelle demande" }]}>
      <GlassCard className="mx-auto max-w-2xl">
        <form onSubmit={submit} className="space-y-6" noValidate>
          <fieldset>
            <legend className="mb-3 text-sm font-medium">1. Catégorie</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {categories.map((c) => (
                <label key={c.id} className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center text-sm transition-colors focus-within:ring-2 focus-within:ring-ring ${category === c.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
                  <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => setCategory(c.id as CategoryId)} className="sr-only" />
                  <c.icon aria-hidden className="size-5 text-cyan" />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <Label htmlFor="title">2. Objet de la demande</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">3. Description du besoin</Label>
            <Textarea id="desc" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} required aria-describedby="desc-count" />
            <p id="desc-count" className="text-right text-xs text-muted-foreground">{description.length}/2000</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full bg-aurora shadow-glow" disabled={busy}>
            {busy ? "Envoi en cours…" : "Envoyer ma demande"}
          </Button>
        </form>
      </GlassCard>
    </PageShell>
  );
}
