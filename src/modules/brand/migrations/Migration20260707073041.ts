import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073041 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "brand" ("id" text not null, "name" text not null, "slug" text not null, "logo_url" text null, "description" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brand" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "brand" cascade;`);
  }

}
