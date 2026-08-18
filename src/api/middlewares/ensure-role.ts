import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const ensureRole = (role: string) => {
  return async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const customerId =
      (req.auth_context.app_metadata?.customer_id as string | undefined) ??
      (req.auth_context.actor_type === "customer"
        ? req.auth_context.actor_id
        : undefined);

    if (!customerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Creating the very first employee is the company bootstrap operation.
    // There is no administrator to authorize it yet.
    if (req.params.id) {
      const {
        data: [company],
      } = await query.graph({
        entity: "companies",
        fields: ["id", "employees.id"],
        filters: { id: req.params.id },
      });

      if (company?.employees?.length === 0) {
        return next();
      }
    }

    const {
      data: [customer],
    } = await query.graph({
      entity: "customer",
      fields: ["id", "employee.id", "employee.is_admin", "employee.company_id"],
      filters: { id: customerId },
    });

    const employee = customer?.employee;
    const isRequestedRole = role === "company_admin" && employee?.is_admin;
    const isRequestedCompany =
      !req.params.id || employee?.company_id === req.params.id;

    if (isRequestedRole && isRequestedCompany) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};
