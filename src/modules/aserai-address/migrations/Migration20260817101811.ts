import { Migration } from '@mikro-orm/migrations';

export class Migration20260817101811 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "aserai_address" add column if not exists "tenant_id" text null;`);
    this.addSql(`update "aserai_address" set "tenant_id" = coalesce((select "id" from "tenant" where "deleted_at" is null order by "created_at" limit 1), 'tenant_default') where "tenant_id" is null;`);
    this.addSql(`alter table if exists "aserai_address" alter column "tenant_id" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "aserai_address" drop column if exists "tenant_id";`);
  }

}
