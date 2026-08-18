import { describe, expect, it } from "vitest";
import { demoItemSchema } from "@/lib/validations/demo-item";

describe("demoItemSchema", () => {
  it("accepts a valid title with no description", () => {
    const result = demoItemSchema.safeParse({ title: "Item de teste" });
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 2 characters", () => {
    const result = demoItemSchema.safeParse({ title: "a" });
    expect(result.success).toBe(false);
  });

  it("rejects a description longer than 240 characters", () => {
    const result = demoItemSchema.safeParse({
      title: "Item válido",
      description: "x".repeat(241),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from the title", () => {
    const result = demoItemSchema.safeParse({ title: "  Item com espaços  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Item com espaços");
    }
  });
});
