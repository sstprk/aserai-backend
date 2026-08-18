import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101823 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "webhook_endpoint" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "webhook_endpoint" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "webhook_endpoint" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "webhook_endpoint" drop column if exists "tenant_id";`);
  }

}
