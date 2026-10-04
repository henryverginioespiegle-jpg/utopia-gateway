import { z } from "zod";

export const ideaSchema = z.object({
  title: z.string().trim().min(3, "Titre : 3 caractères minimum").max(120, "Titre : 120 caractères maximum"),
  body: z.string().trim().min(10, "Description : 10 caractères minimum").max(2000, "Description : 2000 caractères maximum"),
});

/** Une idée devient « proposition soutenue » à partir de ce seuil. */
export const SUPPORT_THRESHOLD = 10;
export const isPopular = (supports: number) => supports >= SUPPORT_THRESHOLD;
