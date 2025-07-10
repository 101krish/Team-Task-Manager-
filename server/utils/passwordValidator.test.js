import { isPasswordStrong } from "./passwordValidator";

describe("password validation check", () => {
  it("rejects short input passwords", () => {
    expect(isPasswordStrong("Short1")).toBe(false);
  });

  it("passes for secure entries", () => {
    expect(isPasswordStrong("SecurePass123")).toBe(true);
  });
});
