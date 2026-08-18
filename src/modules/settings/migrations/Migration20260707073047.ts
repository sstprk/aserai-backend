import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073047 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "setting" ("id" text not null, "group" text not null, "key" text not null, "value" jsonb not null, "description" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_setting_deleted_at" ON "setting" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "setting" cascade;`);
  }

}
