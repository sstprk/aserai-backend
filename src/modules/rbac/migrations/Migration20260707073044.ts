import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073044 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "role" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "is_system" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "role_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_deleted_at" ON "role" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "permission" ("id" text not null, "resource" text not null, "action" text not null, "description" text null, "role_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "permission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_permission_role_id" ON "permission" (role_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_permission_deleted_at" ON "permission" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "permission" add constraint "permission_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "permission" drop constraint if exists "permission_role_id_foreign";`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "permission" cascade;`);
  }

}
