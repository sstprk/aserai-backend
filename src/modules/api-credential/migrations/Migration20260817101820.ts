import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101820 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "api_client" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "api_client" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "api_client" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "api_credential" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "api_credential" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "api_credential" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "api_client" drop column if exists "tenant_id";`);

    this.addSql(`alter table if exists "api_credential" drop column if exists "tenant_id";`);
  }

}
