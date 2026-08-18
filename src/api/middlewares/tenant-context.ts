import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { TENANT_MODULE } from "../../modules/tenant"
import type TenantModuleService from "../../modules/tenant/service"
import type {
  TenantAwareRequest,
  TenantContext,
} from "../../types/tenant-context"

const textHeader = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim()

const hostname = (req: MedusaRequest) =>
  textHeader(req.headers["x-forwarded-host"] as string | string[] | undefined) ??
  textHeader(req.headers.host)?.split(":")[0]

export const resolveTenantContext = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const service: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenantId = textHeader(
    req.headers["x-tenant-id"] as string | string[] | undefined
  )
  const tenantSlug = textHeader(
    req.headers["x-tenant-slug"] as string | string[] | undefined
  )
  const host = hostname(req)

  let tenants: Awaited<ReturnType<TenantModuleService["listTenants"]>> = []
  let source: TenantContext["source"] = "header"

  // An x-tenant-id / x-tenant-slug header is an explicit assertion about which
  // tenant the caller means. If it does not resolve, the request is wrong —
  // falling back to the default tenant here would hand the caller another
  // tenant's data under a name they did not ask for.
  const explicit = Boolean(tenantId || tenantSlug)

  if (tenantId) {
    tenants = await service.listTenants({ id: tenantId, is_active: true })
  } else if (tenantSlug) {
    tenants = await service.listTenants({ slug: tenantSlug, is_active: true })
  } else if (host && host !== "localhost" && host !== "127.0.0.1") {
    source = "domain"
    tenants = await service.listTenants({ domain: host, is_active: true })
  }

  if (explicit && !tenants.length) {
    res.status(400).json({
      message: "A valid tenant context is required",
      error: {
        code: "TENANT_CONTEXT_REQUIRED",
        message: "A valid tenant context is required",
        details: {
          reason: "unknown_or_inactive_tenant",
          received: tenantId ? { "x-tenant-id": tenantId } : { "x-tenant-slug": tenantSlug },
        },
        traceId: (req as Partial<TenantAwareRequest>).trace_id,
      },
    })
    return
  }

  if (!tenants.length && process.env.DEFAULT_TENANT_ID) {
    source = "default"
    tenants = await service.listTenants({
      id: process.env.DEFAULT_TENANT_ID,
      is_active: true,
    })
  }

  if (!tenants.length && process.env.NODE_ENV !== "production") {
    const active = await service.listTenants(
      { is_active: true },
      { take: 2, order: { created_at: "ASC" } }
    )
    if (active.length === 1) {
      source = "single-tenant"
      tenants = active
    }
  }

  const tenant = tenants[0]
  if (!tenant) {
    res.status(400).json({
      message: "A valid tenant context is required",
      error: {
        code: "TENANT_CONTEXT_REQUIRED",
        message: "A valid tenant context is required",
        details: {
          accepted: ["x-tenant-id", "x-tenant-slug", "tenant domain"],
        },
        traceId: (req as Partial<TenantAwareRequest>).trace_id,
      },
    })
    return
  }

  ;(req as Partial<TenantAwareRequest>).tenant_context = {
    tenant_id: tenant.id,
    slug: tenant.slug,
    source,
  }

  next()
}
