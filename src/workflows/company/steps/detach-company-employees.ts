import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types";

type DetachedEmployee = { employeeId: string; customerId?: string };

/**
 * Soft-delete a company's employees and drop their customer links.
 *
 * Deleting a company used to touch only the `company` row. Its employees stayed
 * live pointing at a dead `company_id`, and — worse — the one-to-one
 * employee↔customer link rows stayed live too. Since every read path resolves a
 * customer's membership through that single link (`customer.employee`), those
 * customers stayed bound to a company that no longer exists and could never be
 * added to another one.
 */
export const detachCompanyEmployeesStep = createStep(
  "detach-company-employees",
  async (
    companyId: string,
    { container }
  ): Promise<StepResponse<DetachedEmployee[], DetachedEmployee[]>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const { data: employees } = await query.graph({
      entity: "employee",
      fields: ["id", "customer.id"],
      filters: { company_id: companyId },
    });

    if (!employees.length) {
      return new StepResponse([], []);
    }

    const detached: DetachedEmployee[] = employees.map((employee) => ({
      employeeId: employee.id as string,
      customerId: (employee as { customer?: { id?: string } }).customer?.id,
    }));

    const links = detached
      .filter((entry) => entry.customerId)
      .map((entry) => ({
        [COMPANY_MODULE]: { employee_id: entry.employeeId },
        [Modules.CUSTOMER]: { customer_id: entry.customerId as string },
      }));

    if (links.length) {
      await remoteLink.dismiss(links);
    }

    await companyModule.softDeleteEmployees(
      detached.map((entry) => entry.employeeId)
    );

    return new StepResponse(detached, detached);
  },
  async (detached: DetachedEmployee[] | undefined, { container }) => {
    if (!detached?.length) {
      return;
    }

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModule.restoreEmployees(
      detached.map((entry) => entry.employeeId)
    );

    const links = detached
      .filter((entry) => entry.customerId)
      .map((entry) => ({
        [COMPANY_MODULE]: { employee_id: entry.employeeId },
        [Modules.CUSTOMER]: { customer_id: entry.customerId as string },
      }));

    if (links.length) {
      await remoteLink.create(links);
    }
  }
);
