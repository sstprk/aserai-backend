import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073102 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "tax_group" ("id" text not null, "name" text not null, "description" text null, "rates" jsonb null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tax_group_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tax_group_deleted_at" ON "tax_group" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tax_group" cascade;`);
  }

}
