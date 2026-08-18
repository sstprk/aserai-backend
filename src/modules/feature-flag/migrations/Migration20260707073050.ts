import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073050 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "feature_flag" ("id" text not null, "flag_key" text not null, "is_enabled" boolean not null default false, "description" text null, "config" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "feature_flag_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_feature_flag_deleted_at" ON "feature_flag" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "feature_flag" cascade;`);
  }

}
