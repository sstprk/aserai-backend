import { MedusaError } from "@medusajs/framework/utils";
import { LogNotificationProvider } from "./providers/log-provider";
import { NotificationChannel, NotificationProvider } from "./providers/types";

export class NotificationProviderRegistry {
  private readonly providers = new Map<NotificationChannel, NotificationProvider>();

  constructor(providers?: NotificationProvider[]) {
    const defaults = providers ?? [
      new LogNotificationProvider("email"),
      new LogNotificationProvider("sms"),
    ];

    defaults.forEach((provider) => this.providers.set(provider.channel, provider));
  }

  register(provider: NotificationProvider) {
    this.providers.set(provider.channel, provider);
  }

  get(channel: NotificationChannel) {
    const provider = this.providers.get(channel);
    if (!provider) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${channel} notification provider is not configured`
      );
    }
    return provider;
  }
}
