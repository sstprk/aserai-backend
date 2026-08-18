import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tax_group" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "tax_group" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "tax_group" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tax_group" drop column if exists "tenant_id";`);
  }

}
