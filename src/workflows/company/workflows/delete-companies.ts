import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ModuleDeleteCompany } from "../../../types";
import { deleteApprovalSettingsStep } from "../../approval/steps/delete-approval-settings";
import { deleteCompaniesStep } from "../steps";
import { detachCompanyEmployeesStep } from "../steps/detach-company-employees";

export const deleteCompaniesWorkflow = createWorkflow(
  "delete-companies",
  function (input: ModuleDeleteCompany) {
    // Employees first — once they are soft-deleted they can no longer be
    // queried to clean up their customer links.
    detachCompanyEmployeesStep(input.id);

    // Everything else hanging off the company: customer group, carts, orders.
    removeRemoteLinkStep([{ [COMPANY_MODULE]: { company_id: input.id } }]);

    deleteCompaniesStep([input.id]);

    deleteApprovalSettingsStep({
      companyIds: [input.id],
    });

    return new WorkflowResponse(undefined);
  }
);
