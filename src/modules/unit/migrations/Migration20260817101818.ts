import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101818 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "unit" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "unit" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "unit" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "unit_conversion" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "unit_conversion" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "unit_conversion" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "unit" drop column if exists "tenant_id";`);

    this.addSql(`alter table if exists "unit_conversion" drop column if exists "tenant_id";`);
  }

}
