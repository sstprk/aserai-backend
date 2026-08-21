import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

type UnlinkedEmployee = { employeeId: string; customerId: string };

/**
 * Drop the employee↔customer link rows for the given employees.
 *
 * The link is one-to-one, so a leftover row keeps occupying the customer's only
 * membership slot: `customer.employee` still resolves to the deleted employee
 * and the customer can never join another company. Soft-deleting the employee
 * does not touch the link, so this has to run alongside it.
 */
export const unlinkEmployeesFromCustomersStep = createStep(
  "unlink-employees-from-customers",
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<UnlinkedEmployee[], UnlinkedEmployee[]>> => {
    const ids = Array.isArray(id) ? id : [id];

    if (!ids.length) {
      return new StepResponse([], []);
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const { data: employees } = await query.graph({
      entity: "employee",
      fields: ["id", "customer.id"],
      filters: { id: ids },
    });

    const unlinked: UnlinkedEmployee[] = employees
      .map((employee) => ({
        employeeId: employee.id as string,
        customerId: (employee as { customer?: { id?: string } }).customer?.id,
      }))
      .filter((entry): entry is UnlinkedEmployee => Boolean(entry.customerId));

    if (!unlinked.length) {
      return new StepResponse([], []);
    }

    await remoteLink.dismiss(
      unlinked.map((entry) => ({
        [COMPANY_MODULE]: { employee_id: entry.employeeId },
        [Modules.CUSTOMER]: { customer_id: entry.customerId },
      }))
    );

    return new StepResponse(unlinked, unlinked);
  },
  async (unlinked: UnlinkedEmployee[] | undefined, { container }) => {
    if (!unlinked?.length) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    await remoteLink.create(
      unlinked.map((entry) => ({
        [COMPANY_MODULE]: { employee_id: entry.employeeId },
        [Modules.CUSTOMER]: { customer_id: entry.customerId },
      }))
    );
  }
);
