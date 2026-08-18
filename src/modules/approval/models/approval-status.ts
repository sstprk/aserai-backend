import { model } from "@medusajs/framework/utils";
import { ApprovalStatusType } from "../../../types/approval";

export const ApprovalStatus = model.define("approval_status", {
  id: model
    .id({
      prefix: "apprstat",
    })
    .primaryKey(),
  tenant_id: model.text(),
  cart_id: model.text(),
  status: model.enum(ApprovalStatusType),
});
