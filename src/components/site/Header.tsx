import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Orbit, LogOut, Accessibility, Sun, Moon, Contrast, AArrowUp, AArrowDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useA11y } from "@/lib/a11y";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const publicLinks = [
  { to: "/services", label: "Services" },
  { to: "/actualites", label: "Actualités" },
  { to: "/contact", label: "Contact" },
] as const;

function A11yMenu() {
  const a = useA11y();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Options d'accessibilité" className="min-h-11 min-w-11">
          <Accessibility aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass w-72" align="end">
        <h2 className="mb-3 font-display text-sm font-semibold">Accessibilité</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => a.set({ theme: a.theme === "dark" ? "light" : "dark" })}>
            {a.theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
            Mode {a.theme === "dark" ? "clair" : "sombre"}
          </Button>
          <Button variant="outline" aria-pressed={a.contrast} className="w-full justify-start" onClick={() => a.set({ contrast: !a.contrast })}>
            <Contrast aria-hidden /> Contraste élevé {a.contrast ? "(activé)" : ""}
          </Button>
          <div className="flex items-center gap-2" role="group" aria-label="Taille du texte">
            <Button variant="outline" size="icon" aria-label="Réduire la taille du texte" onClick={() => a.set({ fontSize: Math.max(14, a.fontSize - 2) })}>
              <AArrowDown aria-hidden />
            </Button>
            <span className="flex-1 text-center text-sm" aria-live="polite">Texte : {Math.round((a.fontSize / 16) * 100)} %</span>
            <Button variant="outline" size="icon" aria-label="Augmenter la taille du texte" onClick={() => a.set({ fontSize: Math.min(24, a.fontSize + 2) })}>
              <AArrowUp aria-hidden />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    ...publicLinks,
    ...(user ? ([{ to: "/tableau-de-bord", label: "Mon espace" }, { to: "/demandes", label: "Mes demandes" }] as const) : []),
  ];

  const logout = async () => {
    await signOut();
    toast.success("Vous êtes déconnecté. À bientôt sur Terra Nova !");
    navigate({ to: "/" });
  };

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Terra Nova, accueil">
          <span className="flex size-9 items-center justify-center rounded-xl bg-aurora shadow-glow">
            <Orbit aria-hidden className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-semibold">Terra Nova</span>
        </Link>
        <nav aria-label="Navigation principale" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent !text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <A11yMenu />
          {user ? (
            <Button variant="ghost" onClick={logout} className="hidden sm:inline-flex">
              <LogOut aria-hidden /> Déconnexion
            </Button>
          ) : (
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/connexion">Se connecter</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Ouvrir le menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass">
              <SheetTitle className="font-display">Menu</SheetTitle>
              <nav aria-label="Navigation mobile" className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-accent">
                    {l.label}
                  </Link>
                ))}
                {user ? (
                  <Button variant="outline" className="mt-4" onClick={() => { setOpen(false); logout(); }}>
                    <LogOut aria-hidden /> Déconnexion
                  </Button>
                ) : (
                  <Button asChild className="mt-4">
                    <Link to="/connexion" onClick={() => setOpen(false)}>Se connecter</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2200 Conseil planétaire de Terra Nova — Portail citoyen officiel</p>
        <nav aria-label="Liens de pied de page" className="flex gap-4">
          <Link to="/services" className="hover:text-foreground">Services</Link>
          <Link to="/actualites" className="hover:text-foreground">Actualités</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
