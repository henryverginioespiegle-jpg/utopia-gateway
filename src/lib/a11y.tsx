import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Prefs = { theme: "dark" | "light"; contrast: boolean; fontSize: number };
type Ctx = Prefs & { set: (p: Partial<Prefs>) => void };

const defaults: Prefs = { theme: "dark", contrast: false, fontSize: 16 };
const A11yCtx = createContext<Ctx | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(defaults);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tn-a11y");
      if (raw) setPrefs({ ...defaults, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", prefs.theme === "dark");
    el.classList.toggle("hc", prefs.contrast);
    el.style.setProperty("--base-font", `${prefs.fontSize}px`);
    localStorage.setItem("tn-a11y", JSON.stringify(prefs));
  }, [prefs]);

  return (
    <A11yCtx.Provider value={{ ...prefs, set: (p) => setPrefs((s) => ({ ...s, ...p })) }}>
      {children}
    </A11yCtx.Provider>
  );
}

export function useA11y() {
  const c = useContext(A11yCtx);
  if (!c) throw new Error("useA11y outside provider");
  return c;
}
