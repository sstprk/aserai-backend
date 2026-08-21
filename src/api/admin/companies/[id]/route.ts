import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  deleteCompaniesWorkflow,
  updateCompaniesWorkflow,
} from "../../../../workflows/company/workflows/";
import {
  AdminGetCompanyParamsType,
  AdminUpdateCompanyType,
} from "../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetCompanyParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateCompanyType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await updateCompaniesWorkflow.run({
    input: { ...req.body, id },
    container: req.scope,
  });

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;

  // `container` was missing here, unlike every sibling route. The workflow then
  // resolved from the global container instead of the request scope, which
  // fails now that the cascade steps resolve QUERY and REMOTE_LINK.
  await deleteCompaniesWorkflow.run({
    input: { id },
    container: req.scope,
  });

  res.status(200).json({
    id,
    object: "company",
    deleted: true,
  });
};
