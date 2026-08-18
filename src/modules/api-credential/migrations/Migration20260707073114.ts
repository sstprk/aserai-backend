import { Migration } from '@mikro-orm/migrations';

export class Migration20260707073114 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "api_client" ("id" text not null, "name" text not null, "client_id" text not null, "client_secret_hash" text not null, "scopes" jsonb null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "api_client_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_api_client_deleted_at" ON "api_client" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "api_credential" ("id" text not null, "provider" text not null, "credentials_encrypted" jsonb not null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "api_credential_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_api_credential_deleted_at" ON "api_credential" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "api_client" cascade;`);

    this.addSql(`drop table if exists "api_credential" cascade;`);
  }

}
