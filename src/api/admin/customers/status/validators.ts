import { z } from "zod";

export const AdminUpdateCustomerStatus = z.object({
  is_active: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export type AdminUpdateCustomerStatusType = z.infer<
  typeof AdminUpdateCustomerStatus
>;
