import { parseJwtPayload } from "./jwtHelper";

describe("credentials jwt helpers tests", () => {
  test("returns null for malformed structures", () => {
    expect(parseJwtPayload("invalid")).toBeNull();
  });
});
