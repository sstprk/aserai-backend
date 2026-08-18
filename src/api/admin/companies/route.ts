import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createCompaniesWorkflow } from "../../../workflows/company/workflows/create-companies";
import { AdminCreateCompanyType } from "./validators";
import { getTenantId } from "../../../types/tenant-context";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { fields, pagination } = req.queryConfig;

  const { data: companies, metadata } = await query.graph({
    entity: "companies",
    fields,
    filters: {
      ...req.filterableFields,
      tenant_id: getTenantId(req),
    } as Record<string, unknown>,
    pagination,
  });

  res.json({
    companies,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<
    AdminCreateCompanyType | AdminCreateCompanyType[]
  >,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result: createdCompanies } = await createCompaniesWorkflow.run({
    input: Array.isArray(req.validatedBody)
      ? req.validatedBody.map((company) => ({
          ...company,
          tenant_id: getTenantId(req),
        }))
      : [{ ...req.validatedBody, tenant_id: getTenantId(req) }],
    container: req.scope,
  });

  const { data: companies } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id: createdCompanies.map((company) => company.id) },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ companies });
};
