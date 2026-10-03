import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askNova } from "@/lib/nova.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = ["Comment créer une demande ?", "Je cherche un logement", "Obtenir le Pass Mobilité"];

export function Nova() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour, je suis NOVA, votre assistante citoyenne. Comment puis-je vous guider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(askNova);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { messages: next.slice(-12) } });
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Connexion interrompue. Réessayez." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Assistante virtuelle NOVA"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            className="glass fixed right-4 bottom-24 z-50 flex h-[32rem] max-h-[75vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl shadow-glow"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-aurora">
                <Sparkles aria-hidden className="size-4 text-primary-foreground" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold">NOVA</p>
                <p className="text-xs text-muted-foreground">Assistante IA du portail</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Fermer NOVA" onClick={() => setOpen(false)}>
                <X aria-hidden />
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                </div>
              ))}
              {busy && (
                <div className="flex w-16 gap-1 rounded-2xl bg-muted px-3.5 py-3" aria-label="NOVA réfléchit">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-cyan" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              )}
              {msgs.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-border p-3">
              <label htmlFor="nova-input" className="sr-only">Votre question pour NOVA</label>
              <Input id="nova-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Posez votre question…" maxLength={2000} />
              <Button type="submit" size="icon" aria-label="Envoyer" disabled={busy || !input.trim()}>
                <Send aria-hidden />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer l'assistante NOVA" : "Ouvrir l'assistante NOVA"}
        className="fixed right-4 bottom-4 z-50 flex size-16 animate-pulse-ring items-center justify-center rounded-full bg-aurora shadow-glow transition-transform hover:scale-105"
      >
        <Sparkles aria-hidden className="size-7 text-primary-foreground" />
      </button>
    </>
  );
}
