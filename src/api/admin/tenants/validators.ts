import { z } from "zod"

export const AdminCreateTenant = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    domain: z.string().trim().toLowerCase().optional().nullable(),
    subscription_plan_id: z.string().optional().nullable(),
    config: z.record(z.unknown()).optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
    // Deactivating a tenant is how it is taken offline: resolveTenantContext
    // only resolves active tenants. The schema is strict, so without this the
    // flag on the model is unreachable through the API.
    is_active: z.boolean().optional(),
  })
  .strict()

export const AdminUpdateTenant = AdminCreateTenant.partial()

export type AdminCreateTenantType = z.infer<typeof AdminCreateTenant>
export type AdminUpdateTenantType = z.infer<typeof AdminUpdateTenant>
