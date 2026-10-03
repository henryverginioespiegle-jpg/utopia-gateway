import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(20),
});

const SYSTEM = `Tu es NOVA, l'assistante virtuelle officielle du portail citoyen de Terra Nova, planète utopique en l'an 2200.
Tu réponds en français, avec chaleur et concision (3 à 5 phrases maximum), et tu guides les citoyens dans leurs démarches.
Pages du portail : /services (catalogue : Santé, Éducation, Logement, Transport, Environnement), /demandes/nouvelle (créer une demande),
/demandes (suivre ses demandes : Reçue, En cours, Résolue), /tableau-de-bord (espace citoyen), /actualites, /contact, /connexion (créer un compte ou se connecter).
Services notables : Bilan santé génomique, Téléconsultation holographique, Inscription à l'Académie, Bourse du savoir, Attribution d'habitat adaptatif,
Aide à la rénovation énergétique, Pass Mobilité orbitale, Signalement voirie, Parcelle de jardin vertical, Collecte et recyclage moléculaire.
Indique toujours la page à visiter quand c'est pertinent.`;

export const askNova = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: "NOVA est momentanément indisponible. Réessayez dans un instant." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });
    if (res.status === 429) return { reply: "Trop de demandes en ce moment. Patientez quelques secondes." };
    if (res.status === 402) return { reply: "Le service NOVA a atteint sa limite d'utilisation." };
    if (!res.ok) return { reply: "Je n'ai pas pu répondre. Réessayez dans un instant." };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "…" };
  });
