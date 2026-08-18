import {
  isCustomerRegistrationRequest,
  resolveCustomerId,
} from "../ensure-active-customer";

describe("isCustomerRegistrationRequest", () => {
  it("allows the customer creation request through the active-account guard", () => {
    expect(
      isCustomerRegistrationRequest({
        method: "POST",
        path: "/store/customers",
        originalUrl: "/store/customers",
      } as any)
    ).toBe(true);
  });

  it("handles query strings and a trailing slash", () => {
    expect(
      isCustomerRegistrationRequest({
        method: "POST",
        path: "/store/customers/",
        originalUrl: "/store/customers/?fields=id",
      } as any)
    ).toBe(true);
  });

  it("keeps normal customer routes protected", () => {
    expect(
      isCustomerRegistrationRequest({
        method: "GET",
        path: "/store/customers/me",
        originalUrl: "/store/customers/me",
      } as any)
    ).toBe(false);
  });
});

describe("resolveCustomerId", () => {
  it("prefers Medusa's linked customer id over the auth identity actor id", () => {
    expect(
      resolveCustomerId({
        actor_type: "customer",
        actor_id: "authid_123",
        app_metadata: { customer_id: "cus_123" },
      } as any)
    ).toBe("cus_123");
  });

  it("falls back to the actor id for a customer token without app metadata", () => {
    expect(
      resolveCustomerId({
        actor_type: "customer",
        actor_id: "cus_123",
        app_metadata: {},
      } as any)
    ).toBe("cus_123");
  });
});
