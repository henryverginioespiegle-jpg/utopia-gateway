import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import hero from "@/assets/terra-nova-hero.jpg";
import { Button } from "@/components/ui/button";
import { articles, categories, services, categoryLabel } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terra Nova — Portail citoyen officiel de la planète" },
      { name: "description", content: "Accédez aux services municipaux de Terra Nova, suivez vos demandes et découvrez l'actualité planétaire." },
      { property: "og:title", content: "Terra Nova — Portail citoyen officiel" },
      { property: "og:description", content: "Le portail citoyen intelligent de la planète utopique Terra Nova, an 2200." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{Math.round(v).toLocaleString("fr-FR")}{suffix}</span>;
}

const stats = [
  { label: "Citoyens connectés", value: 8_420_000 },
  { label: "Démarches traitées ce mois", value: 312_540 },
  { label: "Énergie renouvelable", value: 140, suffix: " %" },
  { label: "Délai moyen de réponse", value: 6, suffix: " h" },
];

function Home() {
  const popular = services.filter((s) => s.popular);
  return (
    <>
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
        <img src={hero} alt="Vue panoramique de Terra Nova : tours de cristal flottantes, jardins verticaux et anneaux de transport lumineux" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mb-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles aria-hidden className="size-4 text-cyan" /> Portail officiel · An 2200
          </motion.p>
          <motion.h1 id="hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="max-w-4xl text-4xl leading-tight font-semibold sm:text-6xl lg:text-7xl">
            Bienvenue sur <span className="text-gradient">Terra Nova</span>, la planète qui vous écoute.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Santé, éducation, logement, mobilité, environnement : toutes vos démarches citoyennes réunies dans un seul portail, guidé par NOVA.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-aurora shadow-glow">
              <Link to="/services">Découvrir les services <ArrowRight aria-hidden /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass">
              <Link to="/connexion" search={{ mode: "inscription" }}>Créer un compte</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/connexion">Se connecter</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section aria-label="Statistiques planétaires" className="mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="glass grid grid-cols-2 gap-6 rounded-3xl p-6 shadow-glow lg:grid-cols-4 lg:p-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-gradient sm:text-3xl">
                <Counter to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="cat-title" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="cat-title" className="text-2xl font-semibold sm:text-3xl">Explorer par domaine</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Link to="/services" search={{ categorie: c.id }} className="glass holo group flex h-full flex-col gap-3 rounded-2xl p-5 transition-transform hover:-translate-y-1">
                <c.icon aria-hidden className="size-7 text-cyan" />
                <span className="font-display font-semibold">{c.label}</span>
                <span className="text-sm text-muted-foreground">{c.blurb}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section aria-labelledby="pop-title" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="pop-title" className="text-2xl font-semibold sm:text-3xl">Services les plus demandés</h2>
          <Link to="/services" className="text-sm text-cyan hover:underline">Tout le catalogue</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((s) => (
            <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="glass holo rounded-2xl p-6 transition-shadow hover:shadow-glow">
              <span className="text-xs font-semibold tracking-wider text-cyan uppercase">{categoryLabel(s.category)}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
              <p className="mt-4 text-xs text-muted-foreground">Délai : {s.delay}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="news-title" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="news-title" className="text-2xl font-semibold sm:text-3xl">Actualités récentes</h2>
          <Link to="/actualites" className="text-sm text-cyan hover:underline">Toutes les actualités</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            <Link key={a.slug} to="/actualites/$slug" params={{ slug: a.slug }} className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
              <p className="text-xs text-muted-foreground">
                <time dateTime={a.date}>{new Date(a.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</time> · {a.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
