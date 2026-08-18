import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073053 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "subscription_plan" ("id" text not null, "name" text not null, "slug" text not null, "tier" text check ("tier" in ('free', 'starter', 'pro', 'enterprise')) not null default 'free', "price_monthly" numeric not null default 0, "price_yearly" numeric not null default 0, "max_products" integer null, "max_orders_per_month" integer null, "max_users" integer null, "features" jsonb null, "is_active" boolean not null default true, "metadata" jsonb null, "raw_price_monthly" jsonb not null, "raw_price_yearly" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "subscription_plan_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_plan_deleted_at" ON "subscription_plan" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "subscription_plan" cascade;`);
  }

}
