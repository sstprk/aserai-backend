import { hasPermission } from "../require-permission";

describe("hasPermission", () => {
  it("accepts an exact permission", () => {
    expect(hasPermission([
      { role: { permissions: [{ resource: "company", action: "read" }] } },
    ], "company", "read")).toBe(true);
  });

  it("accepts wildcard resource and action", () => {
    expect(hasPermission([
      { role: { permissions: [{ resource: "*", action: "*" }] } },
    ], "tenant", "manage")).toBe(true);
  });

  it("rejects a permission from another resource", () => {
    expect(hasPermission([
      { role: { permissions: [{ resource: "quote", action: "read" }] } },
    ], "company", "read")).toBe(false);
  });
});
