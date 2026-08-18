import { Migration } from "@mikro-orm/migrations";

export class Migration20260817104000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      insert into "tenant" ("id", "name", "slug", "is_active")
      select 'tenant_default', 'Varsayılan Mağaza', 'default', true
      where not exists (
        select 1 from "tenant" where "deleted_at" is null
      );
    `);
  }

  override async down(): Promise<void> {
    // Additive-only policy: the bootstrap tenant is intentionally retained.
  }
}
