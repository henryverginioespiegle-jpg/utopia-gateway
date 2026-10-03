import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Input } from "@/components/ui/input";
import { articles } from "@/lib/data";

export const Route = createFileRoute("/actualites/")({
  head: () => ({
    meta: [
      { title: "Actualités municipales — Terra Nova" },
      { name: "description", content: "Toutes les publications officielles du Conseil planétaire de Terra Nova." },
      { property: "og:title", content: "Actualités — Terra Nova" },
      { property: "og:description", content: "Les dernières nouvelles de la planète Terra Nova." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [q, setQ] = useState("");
  const list = articles.filter((a) => `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <PageShell title="Actualités" subtitle="Publications officielles du Conseil planétaire." crumbs={[{ label: "Actualités" }]}>
      <div className="relative mb-6 max-w-md">
        <label htmlFor="nq" className="sr-only">Rechercher une actualité</label>
        <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="nq" type="search" className="glass pl-9" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="sr-only" aria-live="polite">{list.length} résultat(s)</p>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <Link key={a.slug} to="/actualites/$slug" params={{ slug: a.slug }} className="glass holo rounded-2xl p-6 transition-shadow hover:shadow-glow">
            <p className="text-xs text-muted-foreground"><time dateTime={a.date}>{new Date(a.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</time> · <span className="text-cyan">{a.category}</span></p>
            <h2 className="mt-2 font-display text-xl font-semibold">{a.title}</h2>
            <p className="mt-2 text-muted-foreground">{a.excerpt}</p>
          </Link>
        ))}
        {list.length === 0 && <p className="text-muted-foreground">Aucune actualité trouvée.</p>}
      </div>
    </PageShell>
  );
}
