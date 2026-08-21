import { MedusaContainer } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";

export type ExistingMembership = {
  employeeId: string;
  companyId: string;
  companyName?: string;
  isAdmin: boolean;
};

/**
 * Resolve the customer's employee record, if it still points at a live company.
 *
 * Two verified quirks of `query.graph` drive the shape of this:
 *
 * 1. Rooted at `employee`, rows whose `company_id` points at a soft-deleted
 *    company are silently excluded. Rooted at `customer`, the same employee is
 *    still reachable through the link. So a customer can hold a membership that
 *    is invisible from one direction and visible from the other — which is
 *    exactly what made this feel like a "ghost relationship".
 * 2. Asking for a relation that resolves to a deleted row (`employee.company.id`
 *    on a deleted company) collapses the whole branch, so `employee` comes back
 *    empty rather than partially populated. Hence the two-step lookup.
 *
 * A membership whose employee or company is gone is treated as no membership:
 * it must not block the customer from joining a real company.
 */
export const findLiveMembership = async (
  container: MedusaContainer,
  customerId: string
): Promise<ExistingMembership | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "employee.id"],
    filters: { id: customerId },
  });

  const employeeId = (customers[0] as { employee?: { id?: string } })?.employee
    ?.id;

  if (!employeeId) {
    return null;
  }

  // Empty here means the employee is soft-deleted or its company is — either
  // way the membership is dead.
  const { data: employees } = await query.graph({
    entity: "employee",
    fields: ["id", "is_admin", "company.id", "company.name"],
    filters: { id: employeeId },
  });

  const employee = employees[0] as
    | { is_admin?: boolean; company?: { id?: string; name?: string } }
    | undefined;
  const company = employee?.company;

  if (!company?.id) {
    return null;
  }

  return {
    employeeId,
    companyId: company.id,
    companyName: company.name,
    isAdmin: Boolean(employee?.is_admin),
  };
};

/**
 * Reject adding a customer who already belongs to a live company.
 *
 * Without this the create route silently added a second link row, after which
 * the customer's membership resolved unpredictably between the two companies.
 */
export const assertCustomerHasNoCompany = async (
  container: MedusaContainer,
  customerId: string
): Promise<void> => {
  const membership = await findLiveMembership(container, customerId);

  if (!membership) {
    return;
  }

  throw new MedusaError(
    MedusaError.Types.DUPLICATE_ERROR,
    `Bu müşteri zaten "${
      membership.companyName ?? "başka bir"
    }" şirketinin çalışanı. Önce mevcut şirketinden çıkarın.`
  );
};
