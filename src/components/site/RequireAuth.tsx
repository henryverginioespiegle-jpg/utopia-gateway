import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Loader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative size-14">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan border-r-violet" />
        <div className="absolute inset-3 animate-pulse rounded-full bg-aurora opacity-60" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function RequireAuth({ children, staff = false }: { children: ReactNode; staff?: boolean }) {
  const { user, loading, isStaff } = useAuth();
  if (loading) return <Loader />;
  if (!user || (staff && !isStaff)) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="glass mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
          <Lock aria-hidden className="size-7 text-cyan" />
        </div>
        <h1 className="text-2xl font-semibold">{user ? "Accès réservé aux agents" : "Connexion requise"}</h1>
        <p className="mt-2 text-muted-foreground">
          {user ? "Cet espace est réservé aux agents municipaux et administrateurs." : "Connectez-vous pour accéder à votre espace citoyen."}
        </p>
        {!user && (
          <Button asChild className="mt-6">
            <Link to="/connexion">Se connecter</Link>
          </Button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
