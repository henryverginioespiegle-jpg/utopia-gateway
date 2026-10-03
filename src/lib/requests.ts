import { supabase } from "@/integrations/supabase/client";
import type { Status } from "@/components/site/StatusBadge";

export type RequestRow = {
  id: string;
  reference: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type RequestEvent = { id: string; request_id: string; status: Status; note: string | null; created_at: string };

export async function fetchRequests(userId?: string) {
  let q = supabase.from("requests").select("*").order("created_at", { ascending: false });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RequestRow[];
}

export async function fetchEvents(requestIds: string[]) {
  if (!requestIds.length) return [] as RequestEvent[];
  const { data } = await supabase.from("request_events").select("*").in("request_id", requestIds).order("created_at");
  return (data ?? []) as RequestEvent[];
}

export const fmtDate = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
