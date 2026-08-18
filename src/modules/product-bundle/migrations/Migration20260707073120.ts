import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073120 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_bundle_item" ("id" text not null, "product_id" text not null, "child_product_id" text not null, "quantity" integer not null default 1, "sort_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_bundle_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_bundle_item_deleted_at" ON "product_bundle_item" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_bundle_item" cascade;`);
  }

}
