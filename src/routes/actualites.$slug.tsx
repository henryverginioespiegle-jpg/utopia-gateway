import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, GlassCard } from "@/components/site/PageShell";
import { articles } from "@/lib/data";

export const Route = createFileRoute("/actualites/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Article introuvable — Terra Nova" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title} — Actualités Terra Nova` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => <p className="p-16 text-center">Cet article n'existe pas.</p>,
  component: ArticlePage,
});

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  return (
    <PageShell title={a.title} subtitle={a.excerpt} crumbs={[{ label: "Actualités", to: "/actualites" }, { label: a.title }]}>
      <GlassCard className="mx-auto max-w-3xl">
        <article>
          <p className="text-sm text-muted-foreground"><time dateTime={a.date}>{new Date(a.date).toLocaleDateString("fr-FR", { dateStyle: "full" })}</time> · <span className="text-cyan">{a.category}</span></p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {a.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
        <Link to="/actualites" className="mt-8 inline-flex items-center gap-2 text-sm text-cyan hover:underline"><ArrowLeft aria-hidden className="size-4" /> Retour aux actualités</Link>
      </GlassCard>
    </PageShell>
  );
}
