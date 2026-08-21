import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { findLiveMembership } from "../../utils/company-membership";

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

    // `customer.employee` resolves through a one-to-one link that can still
    // point at an employee whose company was deleted. Reading it directly made
    // every request after the first employee 403 — the stale row never matched
    // the requested company. findLiveMembership discards dead memberships.
    const membership = await findLiveMembership(req.scope, customerId);

    const isRequestedRole = role === "company_admin" && membership?.isAdmin;
    const isRequestedCompany =
      !req.params.id || membership?.companyId === req.params.id;

    if (isRequestedRole && isRequestedCompany) {
      return next();
    }

    return res.status(403).json({
      message:
        "Bu işlem için şirket yöneticisi olmanız gerekiyor.",
    });
  };
};
