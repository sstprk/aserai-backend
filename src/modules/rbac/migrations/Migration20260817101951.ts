import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101951 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "role_assignment" ("id" text not null, "tenant_id" text not null, "actor_type" text check ("actor_type" in ('user', 'customer', 'api_client')) not null, "actor_id" text not null, "role_id" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "role_assignment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_assignment_role_id" ON "role_assignment" (role_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_role_assignment_deleted_at" ON "role_assignment" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "role_assignment" add constraint "role_assignment_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "role_assignment" cascade;`);
  }

}
