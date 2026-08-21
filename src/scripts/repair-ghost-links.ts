import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * One-off repair for the rows earlier deletes left behind.
 *
 * Before the cascade fixes, deleting a company or a customer touched only that
 * one row. What survived:
 *
 *  - employees of deleted companies, still live, still linked to a customer —
 *    which permanently occupied that customer's single membership slot
 *  - employee↔customer link rows for deleted employees and deleted customers
 *  - `provider_identity` / `auth_identity` rows for deleted customers, which
 *    claim the email address forever and make re-registration impossible
 *
 * Raw SQL on purpose: `query.graph` rooted at `employee` silently hides rows
 * whose company is soft-deleted, so the ORM cannot even see most of this.
 *
 * Idempotent. Pass `apply` to write; defaults to a dry run. (`medusa exec`
 * rejects dash-prefixed flags, so the argument is positional.)
 *
 *   npx medusa exec ./src/scripts/repair-ghost-links.ts
 *   npx medusa exec ./src/scripts/repair-ghost-links.ts apply
 */
export default async function repairGhostLinks({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const knex = container.resolve(
    ContainerRegistrationKeys.PG_CONNECTION
  ) as any;

  const apply = (args ?? []).includes("apply");
  const mode = apply ? "UYGULANIYOR" : "KURU ÇALIŞMA (yazma yok)";
  logger.info(`repair-ghost-links — ${mode}`);

  const LINK_TABLE = "company_employee_customer_customer";

  const report = async (label: string, sql: string, params: any[] = []) => {
    const { rows } = await knex.raw(sql, params);
    logger.info(`${label}: ${rows.length}`);
    for (const row of rows.slice(0, 20)) {
      logger.info(`   ${JSON.stringify(row)}`);
    }
    if (rows.length > 20) {
      logger.info(`   … ve ${rows.length - 20} tane daha`);
    }
    return rows;
  };

  // 1. Employees whose company is gone.
  const orphanEmployees = await report(
    "1) Silinmiş şirkete bağlı canlı çalışanlar",
    `select e.id as employee_id, e.company_id, c.name as company_name
       from employee e
       join company c on c.id = e.company_id
      where e.deleted_at is null and c.deleted_at is not null`
  );

  // 2. Link rows pointing at an employee or customer that is gone.
  const staleLinks = await report(
    "2) Ölü çalışana/müşteriye işaret eden canlı bağlar",
    `select l.employee_id, l.customer_id
       from ${LINK_TABLE} l
       left join employee e on e.id = l.employee_id
       left join customer cu on cu.id = l.customer_id
      where l.deleted_at is null
        and (e.id is null or e.deleted_at is not null
             or cu.id is null or cu.deleted_at is not null)`
  );

  // 3. Auth rows for deleted customers — the ghost-account blocker.
  //    The discriminator is exact: Medusa's old delete ran
  //    `setAuthAppMetadataStep(value: null)`, which leaves the `customer_id`
  //    key present with a null value. A registration still in progress has no
  //    such key (app_metadata is null), and an admin user has `user_id`. So
  //    "key present AND value null" matches ghosts and nothing else.
  //    jsonb_exists() rather than the `?` operator: knex reads `?` as a
  //    parameter placeholder and the query fails to bind.
  const ghostIdentities = await report(
    "3) Hayalet kimlikler (silinmiş hesaptan kalan, e-postayı bloke eden)",
    `select pi.id as provider_identity_id, pi.entity_id as email,
            pi.auth_identity_id
       from provider_identity pi
       join auth_identity ai on ai.id = pi.auth_identity_id
      where jsonb_exists(ai.app_metadata, 'customer_id')
        and ai.app_metadata->>'customer_id' is null`
  );

  // 4. Duplicate live rows for one email — reported only, never merged:
  //    picking which one keeps the order history is a human decision.
  await report(
    "4) Aynı e-postada birden fazla canlı müşteri (elle karar, otomatik birleştirme yok)",
    `select email, count(*) as adet,
            string_agg(id || ' (has_account=' || has_account || ')', ', ') as kayitlar
       from customer
      where deleted_at is null
      group by email
     having count(*) > 1`
  );

  // 5. Customers holding more than one live membership.
  const duplicateMemberships = await report(
    "5) Birden fazla canlı bağı olan müşteriler",
    `select customer_id, count(*) as adet
       from ${LINK_TABLE}
      where deleted_at is null
      group by customer_id
     having count(*) > 1`
  );

  if (!apply) {
    logger.info(
      "Hiçbir şey yazılmadı. Uygulamak için: npx medusa exec ./src/scripts/repair-ghost-links.ts apply"
    );
    return;
  }

  await knex.transaction(async (trx: any) => {
    if (orphanEmployees.length) {
      const ids = orphanEmployees.map((r: any) => r.employee_id);
      await trx.raw(
        `update ${LINK_TABLE} set deleted_at = now()
          where deleted_at is null and employee_id = any(?)`,
        [ids]
      );
      await trx.raw(
        `update employee set deleted_at = now()
          where deleted_at is null and id = any(?)`,
        [ids]
      );
      logger.info(`   → ${ids.length} çalışan ve bağı kapatıldı`);
    }

    if (staleLinks.length) {
      const { rowCount } = await trx.raw(
        `update ${LINK_TABLE} l set deleted_at = now()
           from (select l2.employee_id, l2.customer_id
                   from ${LINK_TABLE} l2
                   left join employee e on e.id = l2.employee_id
                   left join customer cu on cu.id = l2.customer_id
                  where l2.deleted_at is null
                    and (e.id is null or e.deleted_at is not null
                         or cu.id is null or cu.deleted_at is not null)) s
          where l.employee_id = s.employee_id
            and l.customer_id = s.customer_id
            and l.deleted_at is null`
      );
      logger.info(`   → ${rowCount ?? staleLinks.length} bayat bağ kapatıldı`);
    }

    if (ghostIdentities.length) {
      const providerIds = ghostIdentities.map(
        (r: any) => r.provider_identity_id
      );
      const authIds = [
        ...new Set(ghostIdentities.map((r: any) => r.auth_identity_id)),
      ];
      // Hard delete: the unique index on (entity_id, provider) has no
      // `deleted_at` clause, so a soft delete would still block the email.
      await trx.raw(`delete from provider_identity where id = any(?)`, [
        providerIds,
      ]);
      await trx.raw(
        `delete from auth_identity
          where id = any(?)
            and not exists (
              select 1 from provider_identity p where p.auth_identity_id = auth_identity.id
            )`,
        [authIds]
      );
      logger.info(
        `   → ${providerIds.length} kimlik silindi, e-postalar serbest`
      );
    }
  });

  // Enforce one-company-per-customer in the database, now that the data
  // satisfies it. This lives here rather than in a module migration because the
  // link table is created by Medusa's link sync, which runs *after* module
  // migrations — a migration would silently no-op on a fresh install and never
  // run again, leaving the constraint permanently absent.
  if (duplicateMemberships.length) {
    logger.warn(
      `Tek şirket kısıtı eklenmedi: ${duplicateMemberships.length} müşterinin hâlâ birden fazla canlı bağı var. Önce onları çözün.`
    );
  } else {
    await knex.raw(
      `create unique index if not exists "IDX_${LINK_TABLE}_customer_unique"
         on ${LINK_TABLE} (customer_id) where deleted_at is null`
    );
    logger.info("   → tek şirket kısıtı (unique index) yerinde");
  }

  logger.info("Bitti.");
}
