import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types";

type DetachedEmployee = { employeeId: string; customerId: string } | null;

/**
 * Release the customer's company membership before the customer is deleted.
 *
 * `deleteCustomersWorkflow` never touches the employee record or the
 * employee↔customer link, so deleting a customer used to leave a live employee
 * row and a live link pointing at a customer that no longer exists.
 */
export const detachCustomerEmployeeStep = createStep(
  "detach-customer-employee",
  async (
    customerId: string,
    { container }
  ): Promise<StepResponse<DetachedEmployee, DetachedEmployee>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    // Rooted at `customer` on purpose: rooted at `employee`, rows belonging to
    // a soft-deleted company are filtered out and the stale link would survive.
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "employee.id"],
      filters: { id: customerId },
    });

    const employeeId = (customers[0] as { employee?: { id?: string } })
      ?.employee?.id;

    if (!employeeId) {
      return new StepResponse(null, null);
    }

    await remoteLink.dismiss({
      [COMPANY_MODULE]: { employee_id: employeeId },
      [Modules.CUSTOMER]: { customer_id: customerId },
    });

    await companyModule.softDeleteEmployees([employeeId]);

    return new StepResponse(
      { employeeId, customerId },
      { employeeId, customerId }
    );
  },
  async (detached: DetachedEmployee | undefined, { container }) => {
    if (!detached) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModule.restoreEmployees([detached.employeeId]);
    await remoteLink.create({
      [COMPANY_MODULE]: { employee_id: detached.employeeId },
      [Modules.CUSTOMER]: { customer_id: detached.customerId },
    });
  }
);
