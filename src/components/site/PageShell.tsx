import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Crumb = { label: string; to?: string };

export function PageShell({
  title,
  subtitle,
  crumbs,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">Accueil</Link>
          </li>
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-3.5" />
              {c.to ? (
                <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
              ) : (
                <span aria-current="page" className="text-foreground">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </motion.header>
      {children}
    </div>
  );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-6 ${className}`}>{children}</div>;
}
