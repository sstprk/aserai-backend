import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101810 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "approval" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "approval" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "approval" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "approval_settings" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "approval_settings" set "tenant_id" = coalesce((select "tenant_id" from "company" where "company"."id" = "approval_settings"."company_id"), (select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "approval_settings" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "approval_status" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "approval_status" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "approval_status" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "approval" drop column if exists "tenant_id";`);

    this.addSql(`alter table if exists "approval_settings" drop column if exists "tenant_id";`);

    this.addSql(`alter table if exists "approval_status" drop column if exists "tenant_id";`);
  }

}
