import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073108 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "audit_log" ("id" text not null, "entity_type" text not null, "entity_id" text not null, "action" text check ("action" in ('create', 'update', 'delete')) not null default 'create', "actor_id" text null, "actor_type" text null, "diff" jsonb null, "ip_address" text null, "user_agent" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "audit_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_audit_log_deleted_at" ON "audit_log" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "audit_log" cascade;`);
  }

}
