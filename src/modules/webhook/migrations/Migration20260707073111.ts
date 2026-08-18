import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073111 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "webhook_endpoint" ("id" text not null, "url" text not null, "events" jsonb not null, "secret" text null, "is_active" boolean not null default true, "description" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "webhook_endpoint_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_webhook_endpoint_deleted_at" ON "webhook_endpoint" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "webhook_endpoint" cascade;`);
  }

}
