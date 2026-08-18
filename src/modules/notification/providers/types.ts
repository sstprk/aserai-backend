export type NotificationChannel = "email" | "sms";

export type NotificationProviderInput = {
  tenant_id: string;
  recipient: string;
  subject?: string | null;
  body: string;
  metadata?: Record<string, unknown>;
};

export type NotificationProviderResult = {
  message_id: string;
};

export interface NotificationProvider {
  readonly id: string;
  readonly channel: NotificationChannel;
  send(input: NotificationProviderInput): Promise<NotificationProviderResult>;
}
