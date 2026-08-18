import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { APPROVAL_MODULE } from "../../../modules/approval";
import { ApprovalStatusType, IApprovalModuleService } from "../../../types";

export const createApprovalStatusStep = createStep(
  "create-approval-status",
  async (
    approvals: Array<{ cart_id: string; tenant_id: string }>,
    { container }
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    const {
      data: [existingApprovalStatus],
    } = await query.graph({
      entity: "approval_status",
      fields: ["*"],
      filters: {
        cart_id: approvals[0].cart_id,
        tenant_id: approvals[0].tenant_id,
      } as Record<string, unknown>,
    });

    if (existingApprovalStatus) {
      const [approvalStatus] =
        await approvalModuleService.updateApprovalStatuses([
          {
            id: existingApprovalStatus.id,
            status: ApprovalStatusType.PENDING,
          },
        ]);

      return new StepResponse(approvalStatus, [approvalStatus.id]);
    }

    const approvalStatusesToCreate = approvals.map((approval) => ({
      cart_id: approval.cart_id,
      tenant_id: approval.tenant_id,
      status: ApprovalStatusType.PENDING,
    }));

    const [approvalStatus] = await approvalModuleService.createApprovalStatuses(
      approvalStatusesToCreate
    );

    return new StepResponse(approvalStatus, [approvalStatus.id]);
  },
  async (statusIds: string[], { container }) => {
    if (!statusIds) {
      return;
    }

    const approvalModuleService =
      container.resolve<IApprovalModuleService>(APPROVAL_MODULE);

    await approvalModuleService.deleteApprovalStatuses(statusIds);
  }
);
