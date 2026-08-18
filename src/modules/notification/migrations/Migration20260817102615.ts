import { Migration } from '@mikro-orm/migrations';

export class Migration20260817102615 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "notification_delivery" ("id" text not null, "tenant_id" text not null, "channel" text check ("channel" in ('email', 'sms')) not null, "recipient" text not null, "template_key" text not null, "provider" text not null, "status" text check ("status" in ('pending', 'sent', 'failed')) not null default 'pending', "provider_message_id" text null, "error_message" text null, "payload" jsonb null, "sent_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "notification_delivery_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_notification_delivery_deleted_at" ON "notification_delivery" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "notification_preference" ("id" text not null, "tenant_id" text not null, "actor_type" text check ("actor_type" in ('user', 'customer')) not null, "actor_id" text not null, "channel" text check ("channel" in ('email', 'sms')) not null, "event_key" text not null, "enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "notification_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_notification_preference_deleted_at" ON "notification_preference" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "notification_template" ("id" text not null, "tenant_id" text not null, "key" text not null, "channel" text check ("channel" in ('email', 'sms')) not null, "subject" text null, "body" text not null, "locale" text not null default 'tr-TR', "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "notification_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_notification_template_deleted_at" ON "notification_template" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notification_delivery" cascade;`);

    this.addSql(`drop table if exists "notification_preference" cascade;`);

    this.addSql(`drop table if exists "notification_template" cascade;`);
  }

}
