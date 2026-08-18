import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetQuoteParamsType } from "./validators";
import { getTenantId } from "../../../types/tenant-context";

export const GET = async (
  req: MedusaRequest<AdminGetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { fields, pagination } = req.remoteQueryConfig;
  const { data: quotes, metadata } = await query.graph({
    entity: "quote",
    fields,
    filters: { tenant_id: getTenantId(req) } as Record<string, unknown>,
    pagination: {
      ...pagination,
      skip: pagination.skip!,
    },
  });

  res.json({
    quotes,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};
