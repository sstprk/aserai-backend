import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101806 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "company" add column if not exists "tenant_id" text null, add column if not exists "tax_id" text null, add column if not exists "trade_registry_no" text null, add column if not exists "iban" text null, add column if not exists "org_type" text check ("org_type" in ('manufacturer', 'distributor', 'retailer', 'other')) null;`);
    this.addSql(`update "company" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "company" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "employee" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "employee" set "tenant_id" = coalesce((select "tenant_id" from "company" where "company"."id" = "employee"."company_id"), (select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "employee" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "company" drop column if exists "tenant_id", drop column if exists "tax_id", drop column if exists "trade_registry_no", drop column if exists "iban", drop column if exists "org_type";`);

    this.addSql(`alter table if exists "employee" drop column if exists "tenant_id";`);
  }

}
