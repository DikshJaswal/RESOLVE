import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.validator";

describe("auth validators", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid login emails", () => {
    expect(
      loginSchema.safeParse({ email: "not-an-email", password: "Password123!" })
        .success,
    ).toBe(false);
  });
});
