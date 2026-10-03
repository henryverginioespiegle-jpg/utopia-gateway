import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Coins, FileText, MapPin, Send } from "lucide-react";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { services, categoryLabel } from "@/lib/data";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Service introuvable — Terra Nova" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.service;
    return {
      meta: [
        { title: `${s.name} — Services Terra Nova` },
        { name: "description", content: s.summary },
        { property: "og:title", content: `${s.name} — Terra Nova` },
        { property: "og:description", content: s.summary },
      ],
    };
  },
  notFoundComponent: () => <p className="p-16 text-center">Ce service n'existe pas.</p>,
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service: s } = Route.useLoaderData();
  const info = [
    { icon: Clock, label: "Délai de traitement", value: s.delay },
    { icon: Coins, label: "Coût", value: s.cost },
    { icon: MapPin, label: "Lieu", value: s.location },
  ];
  return (
    <PageShell title={s.name} subtitle={s.summary} crumbs={[{ label: "Services", to: "/services" }, { label: s.name }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <span className="text-xs font-semibold tracking-wider text-cyan uppercase">{categoryLabel(s.category)}</span>
          <h2 className="mt-2 text-xl font-semibold">Description</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{s.description}</p>
          <h2 className="mt-8 text-xl font-semibold">Pièces à fournir</h2>
          {s.documents.length ? (
            <ul className="mt-3 space-y-2">
              {s.documents.map((d) => (
                <li key={d} className="flex items-center gap-2"><FileText aria-hidden className="size-4 text-cyan" /> {d}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Aucun document requis.</p>
          )}
        </GlassCard>
        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-lg font-semibold">Informations pratiques</h2>
            <dl className="mt-4 space-y-4">
              {info.map((i) => (
                <div key={i.label} className="flex gap-3">
                  <i.icon aria-hidden className="mt-0.5 size-5 text-cyan" />
                  <div>
                    <dt className="text-sm text-muted-foreground">{i.label}</dt>
                    <dd className="font-medium">{i.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold">Actions</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild className="bg-aurora">
                <Link to="/demandes/nouvelle" search={{ categorie: s.category, service: s.name }}><Send aria-hidden /> Faire une demande</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Poser une question</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
