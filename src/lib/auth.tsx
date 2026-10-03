import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "citoyen" | "agent" | "admin";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  roles: Role[];
  fullName: string;
  loading: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setRoles([]);
        setFullName("");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user.id;
    if (!uid) return;
    setLoading(true);
    Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
    ]).then(([r, p]) => {
      setRoles((r.data ?? []).map((x) => x.role as Role));
      setFullName(p.data?.full_name ?? session.user.email ?? "");
      setLoading(false);
    });
  }, [session?.user.id]);

  const value: AuthCtx = {
    user: session?.user ?? null,
    session,
    roles,
    fullName,
    loading,
    isStaff: roles.includes("agent") || roles.includes("admin"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
