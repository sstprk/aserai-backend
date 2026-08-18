import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import {
  IApprovalModuleService,
  ModuleApprovalSettingsFilters,
} from "../../../types";

type DeleteApprovalSettingsStepInput = {
  ids?: string[];
  companyIds?: string[];
};

export const deleteApprovalSettingsStep = createStep(
  "delete-approval-settings",
  async (input: DeleteApprovalSettingsStepInput, { container }) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const filters: ModuleApprovalSettingsFilters = {};

    if (input.ids) {
      filters.id = input.ids;
    }

    if (input.companyIds) {
      filters.company_id = input.companyIds;
    }

    const approvalSettings = await approvalModule.listApprovalSettings(filters);

    await approvalModule.deleteApprovalSettings(
      approvalSettings.map((setting) => setting.id)
    );

    return new StepResponse(undefined, approvalSettings.map((setting) => ({
      company_id: setting.company_id,
      tenant_id: setting.tenant_id!,
    })));
  },
  async (
    companies: Array<{ company_id: string; tenant_id: string }>,
    { container }
  ) => {
    const approvalModule =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModule.createApprovalSettings(
      companies.map((company) => ({
        company_id: company.company_id,
        tenant_id: company.tenant_id,
        requires_admin_approval: false,
        requires_sales_manager_approval: false,
      }))
    );
  }
);
