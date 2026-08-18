import { randomUUID } from "node:crypto"
import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { TenantAwareRequest } from "../../types/tenant-context"

const TRACE_HEADER = "x-trace-id"

export const attachTraceContext = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const incoming = req.headers[TRACE_HEADER]
  const traceId =
    (Array.isArray(incoming) ? incoming[0] : incoming)?.trim() || randomUUID()

  ;(req as Partial<TenantAwareRequest>).trace_id = traceId
  res.setHeader(TRACE_HEADER, traceId)

  const startedAt = Date.now()
  res.on("finish", () => {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
    const tenantId = (req as Partial<TenantAwareRequest>).tenant_context?.tenant_id

    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        traceId,
        tenantId: tenantId ?? null,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
        message: "http_request_completed",
      })
    )
  })

  next()
}
