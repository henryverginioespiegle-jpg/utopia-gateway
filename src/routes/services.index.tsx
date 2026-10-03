import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { PageShell } from "@/components/site/PageShell";
import { Input } from "@/components/ui/input";
import { categories, services, categoryLabel } from "@/lib/data";

export const Route = createFileRoute("/services/")({
  validateSearch: z.object({ categorie: z.string().optional(), q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Catalogue des services — Terra Nova" },
      { name: "description", content: "Santé, éducation, logement, transport et environnement : tous les services municipaux de Terra Nova." },
      { property: "og:title", content: "Catalogue des services — Terra Nova" },
      { property: "og:description", content: "Recherchez et accédez aux services municipaux de Terra Nova." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { categorie, q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const term = q.toLowerCase();
  const list = services.filter(
    (s) => (!categorie || s.category === categorie) && (!term || `${s.name} ${s.summary}`.toLowerCase().includes(term)),
  );

  return (
    <PageShell title="Catalogue des services" subtitle="Trouvez le service dont vous avez besoin parmi les cinq grands domaines de la vie citoyenne." crumbs={[{ label: "Services" }]}>
      <div className="glass mb-6 flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <label htmlFor="search" className="sr-only">Rechercher un service</label>
          <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="search" type="search" value={q} onChange={(e) => navigate({ search: (p) => ({ ...p, q: e.target.value || undefined }), replace: true })} placeholder="Rechercher un service…" className="pl-9" />
        </div>
        <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
          <Chip active={!categorie} onClick={() => navigate({ search: (p) => ({ ...p, categorie: undefined }) })}>Tous</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={categorie === c.id} onClick={() => navigate({ search: (p) => ({ ...p, categorie: c.id }) })}>
              <c.icon aria-hidden className="size-4" /> {c.label}
            </Chip>
          ))}
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{list.length} service{list.length > 1 ? "s" : ""} trouvé{list.length > 1 ? "s" : ""}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s, i) => (
          <motion.div key={s.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to="/services/$slug" params={{ slug: s.slug }} className="glass holo flex h-full flex-col rounded-2xl p-6 transition-shadow hover:shadow-glow">
              <span className="text-xs font-semibold tracking-wider text-cyan uppercase">{categoryLabel(s.category)}</span>
              <h2 className="mt-2 font-display text-lg font-semibold">{s.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.summary}</p>
              <p className="mt-4 text-xs text-muted-foreground">Délai : {s.delay} · {s.cost}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? "border-transparent bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>
      {children}
    </button>
  );
}
