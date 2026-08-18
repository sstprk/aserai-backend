import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073056 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "aserai_address" ("id" text not null, "owner_type" text not null, "owner_id" text not null, "type" text check ("type" in ('billing', 'shipping', 'default')) not null default 'default', "label" text null, "first_name" text null, "last_name" text null, "company_name" text null, "address_1" text not null, "address_2" text null, "city" text not null, "province" text null, "postal_code" text null, "country_code" text not null, "phone" text null, "is_default" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "aserai_address_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_aserai_address_deleted_at" ON "aserai_address" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "aserai_address" cascade;`);
  }

}
