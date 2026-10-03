import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/connexion")({
  validateSearch: z.object({ mode: z.enum(["connexion", "inscription"]).optional() }),
  head: () => ({
    meta: [
      { title: "Connexion et inscription — Terra Nova" },
      { name: "description", content: "Connectez-vous ou créez votre compte citoyen Terra Nova." },
      { property: "og:title", content: "Espace citoyen — Terra Nova" },
      { property: "og:description", content: "Accédez à vos démarches sur le portail Terra Nova." },
    ],
  }),
  component: AuthPage,
});

const creds = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  password: z.string().min(8, "8 caractères minimum").max(72),
});

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<"connexion" | "inscription">(initial ?? "connexion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/tableau-de-bord" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = creds.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    if (mode === "inscription" && !name.trim()) return setError("Indiquez votre nom complet");
    setBusy(true);
    if (mode === "inscription") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/tableau-de-bord", data: { full_name: name.trim().slice(0, 100) } },
      });
      if (error) setError(error.message);
      else if (!data.session) toast.success("Compte créé ! Confirmez votre adresse via l'e-mail reçu.");
      else toast.success("Bienvenue sur Terra Nova !");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Identifiants incorrects ou adresse non confirmée.");
      else toast.success("Connexion réussie");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/connexion" });
    if (r.error) toast.error("Connexion Google impossible");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md rounded-3xl p-8 shadow-glow">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-aurora animate-float">
            <Orbit aria-hidden className="size-6 text-primary-foreground" />
          </span>
          <h1 className="text-2xl font-semibold">{mode === "connexion" ? "Se connecter" : "Créer un compte"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Votre identité citoyenne Terra Nova</p>
        </div>
        <div role="tablist" aria-label="Mode d'authentification" className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
          {(["connexion", "inscription"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-medium transition-colors ${mode === m ? "bg-background shadow" : "text-muted-foreground"}`}>
              {m === "connexion" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "inscription" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" autoComplete={mode === "connexion" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby="pw-hint" />
            <p id="pw-hint" className="text-xs text-muted-foreground">8 caractères minimum</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full bg-aurora" disabled={busy}>
            {busy ? "Patientez…" : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>Continuer avec Google</Button>
      </motion.div>
    </div>
  );
}
