import { NotificationProviderRegistry } from "../provider-registry";
import type { NotificationProvider } from "../providers/types";

describe("NotificationProviderRegistry", () => {
  it("routes each channel to its registered provider", async () => {
    const provider: NotificationProvider = {
      id: "test-email",
      channel: "email",
      send: jest.fn().mockResolvedValue({ message_id: "msg_1" }),
    };
    const registry = new NotificationProviderRegistry([provider]);

    expect(registry.get("email")).toBe(provider);
    await expect(registry.get("email").send({
      tenant_id: "tenant_1",
      recipient: "test@example.com",
      body: "Merhaba",
    })).resolves.toEqual({ message_id: "msg_1" });
  });

  it("fails closed when a channel has no provider", () => {
    const registry = new NotificationProviderRegistry([]);
    expect(() => registry.get("sms")).toThrow("not configured");
  });
});
