import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073117 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "language" ("id" text not null, "code" text not null, "name" text not null, "native_name" text null, "is_rtl" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "language_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_language_deleted_at" ON "language" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "timezone" ("id" text not null, "identifier" text not null, "utc_offset" text not null, "display_name" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "timezone_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_timezone_deleted_at" ON "timezone" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "language" cascade;`);

    this.addSql(`drop table if exists "timezone" cascade;`);
  }

}
