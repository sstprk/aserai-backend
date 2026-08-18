import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073059 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "unit" ("id" text not null, "name" text not null, "code" text not null, "unit_type" text check ("unit_type" in ('weight', 'length', 'volume', 'count', 'area')) not null default 'count', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "unit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_unit_deleted_at" ON "unit" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "unit_conversion" ("id" text not null, "from_unit_id" text not null, "to_unit_id" text not null, "factor" numeric not null, "metadata" jsonb null, "raw_factor" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "unit_conversion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_unit_conversion_from_unit_id" ON "unit_conversion" (from_unit_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_unit_conversion_deleted_at" ON "unit_conversion" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "unit_conversion" add constraint "unit_conversion_from_unit_id_foreign" foreign key ("from_unit_id") references "unit" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "unit_conversion" drop constraint if exists "unit_conversion_from_unit_id_foreign";`);

    this.addSql(`drop table if exists "unit" cascade;`);

    this.addSql(`drop table if exists "unit_conversion" cascade;`);
  }

}
