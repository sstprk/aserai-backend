import { MedusaService } from "@medusajs/framework/utils";
import {
  NotificationDelivery,
  NotificationPreference,
  NotificationTemplate,
} from "./models";
import { NotificationProviderRegistry } from "./provider-registry";
import { NotificationChannel } from "./providers/types";

type DispatchInput = {
  tenant_id: string;
  channel: NotificationChannel;
  recipient: string;
  template_key: string;
  subject?: string | null;
  body: string;
  payload?: Record<string, unknown>;
};

const BaseNotificationService = MedusaService({
  NotificationDelivery,
  NotificationPreference,
  NotificationTemplate,
});

class NotificationModuleService extends BaseNotificationService {
  private readonly providerRegistry = new NotificationProviderRegistry();

  registerProvider(provider: Parameters<NotificationProviderRegistry["register"]>[0]) {
    this.providerRegistry.register(provider);
  }

  async dispatch(input: DispatchInput) {
    const provider = this.providerRegistry.get(input.channel);
    const delivery = await this.createNotificationDeliveries({
      tenant_id: input.tenant_id,
      channel: input.channel,
      recipient: input.recipient,
      template_key: input.template_key,
      provider: provider.id,
      status: "pending",
      payload: input.payload,
    });

    try {
      const result = await provider.send(input);
      return await this.updateNotificationDeliveries({
        id: delivery.id,
        status: "sent",
        provider_message_id: result.message_id,
        sent_at: new Date(),
      });
    } catch (error) {
      await this.updateNotificationDeliveries({
        id: delivery.id,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

export default NotificationModuleService;
