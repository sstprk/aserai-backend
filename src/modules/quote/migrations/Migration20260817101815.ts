import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101815 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "quote" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "quote" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "quote" alter column "tenant_id" set not null;`);

    this.addSql(`alter table if exists "message" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "message" set "tenant_id" = coalesce((select "tenant_id" from "quote" where "quote"."id" = "message"."quote_id"), (select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "message" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "quote" drop column if exists "tenant_id";`);

    this.addSql(`alter table if exists "message" drop column if exists "tenant_id";`);
  }

}
