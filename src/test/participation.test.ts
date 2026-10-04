import { describe, expect, it } from "vitest";
import { ideaSchema, isPopular } from "@/lib/participation";

describe("Participation citoyenne", () => {
  it("refuse un titre de moins de 3 caractères", () => {
    expect(ideaSchema.safeParse({ title: "ab", body: "Une description valable" }).success).toBe(false);
  });
  it("refuse une description de plus de 2000 caractères", () => {
    expect(ideaSchema.safeParse({ title: "Idée", body: "x".repeat(2001) }).success).toBe(false);
  });
  it("accepte une idée valide", () => {
    expect(ideaSchema.safeParse({ title: "Jardins", body: "Plus de jardins suspendus" }).success).toBe(true);
  });
  it("marque populaire à partir de 10 soutiens", () => {
    expect(isPopular(9)).toBe(false);
    expect(isPopular(10)).toBe(true);
  });
});
