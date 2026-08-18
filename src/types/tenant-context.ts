import type { MedusaRequest } from "@medusajs/framework"

export type TenantContext = {
  tenant_id: string
  slug: string
  source: "header" | "domain" | "default" | "single-tenant"
}

export type TenantAwareRequest<TBody = unknown> = MedusaRequest<TBody> & {
  tenant_context: TenantContext
  trace_id: string
}

export const getTenantId = (req: MedusaRequest): string => {
  const tenantId = (req as Partial<TenantAwareRequest>).tenant_context?.tenant_id

  if (!tenantId) {
    throw new Error("Tenant context is required for this operation")
  }

  return tenantId
}
