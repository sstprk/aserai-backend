import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073105 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "dealer" ("id" text not null, "name" text not null, "code" text not null, "status" text check ("status" in ('active', 'inactive', 'suspended')) not null default 'active', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dealer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dealer_deleted_at" ON "dealer" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "dealer" cascade;`);
  }

}
