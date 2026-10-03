import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Mail, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Centre de contact — Terra Nova" },
      { name: "description", content: "Envoyez un message à l'administration planétaire de Terra Nova." },
      { property: "og:title", content: "Centre de contact — Terra Nova" },
      { property: "og:description", content: "Une question ? L'administration de Terra Nova vous répond." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(100),
  email: z.string().trim().email("E-mail invalide").max(255),
  subject: z.string().trim().min(3, "Objet requis").max(150),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return setError(p.error.issues[0].message);
    setError("");
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(p.data);
    setBusy(false);
    if (error) return toast.error("Envoi impossible, réessayez.");
    toast.success("Message transmis à l'administration");
    setSent(true);
  };

  return (
    <PageShell title="Centre de contact" subtitle="Notre administration vous répond sous 24 heures planétaires." crumbs={[{ label: "Contact" }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 aria-hidden className="mx-auto size-14 text-success" />
              <h2 className="mt-4 text-2xl font-semibold">Message bien reçu</h2>
              <p className="mt-2 text-muted-foreground">Merci {form.name}. Une réponse vous sera envoyée à {form.email}.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>Envoyer un autre message</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="c-name">Nom</Label><Input id="c-name" autoComplete="name" value={form.name} onChange={upd("name")} required /></div>
                <div className="space-y-1.5"><Label htmlFor="c-email">E-mail</Label><Input id="c-email" type="email" autoComplete="email" value={form.email} onChange={upd("email")} required /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="c-subject">Objet</Label><Input id="c-subject" value={form.subject} onChange={upd("subject")} required /></div>
              <div className="space-y-1.5"><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" rows={6} value={form.message} onChange={upd("message")} maxLength={2000} required /></div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="bg-aurora" disabled={busy}>{busy ? "Envoi…" : "Envoyer le message"}</Button>
            </form>
          )}
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Administration planétaire</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3"><MapPin aria-hidden className="size-5 text-cyan" /> Palais du Conseil, District Central</li>
            <li className="flex gap-3"><Mail aria-hidden className="size-5 text-cyan" /> contact@terranova.gov</li>
            <li className="flex gap-3"><Clock aria-hidden className="size-5 text-cyan" /> Service ouvert 24h/24 avec NOVA</li>
          </ul>
        </GlassCard>
      </div>
    </PageShell>
  );
}
