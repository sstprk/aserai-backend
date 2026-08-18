import { randomUUID } from "node:crypto";
import {
  NotificationChannel,
  NotificationProvider,
  NotificationProviderInput,
  NotificationProviderResult,
} from "./types";

/** Development provider. Production must register a real provider explicitly. */
export class LogNotificationProvider implements NotificationProvider {
  readonly id = "log";

  constructor(readonly channel: NotificationChannel) {}

  async send(
    _input: NotificationProviderInput
  ): Promise<NotificationProviderResult> {
    return { message_id: `log_${randomUUID()}` };
  }
}
