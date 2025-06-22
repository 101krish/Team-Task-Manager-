import { isValidTransition } from "./statusValidator";

describe("board status transition rules tests", () => {
  test("denies direct todo to completion transfers", () => {
    expect(isValidTransition("Todo", "Completed")).toBe(false);
  });
});
