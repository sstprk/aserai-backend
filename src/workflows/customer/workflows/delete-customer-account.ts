import { deleteCustomersWorkflow } from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { deleteCustomerAuthIdentityStep } from "../steps/delete-customer-auth-identity";
import { detachCustomerEmployeeStep } from "../steps/detach-customer-employee";

type Input = { customerId: string; email?: string | null };

/**
 * Delete a customer account and everything that would otherwise outlive it.
 *
 * Medusa's `removeCustomerAccountWorkflow` soft-deletes the customer row and
 * stops there, leaving the auth identity (so the email can never be reused) and
 * the company membership (so the person stays an employee of a company they
 * were removed from). Per product decision the customer row itself stays —
 * orders reference it and that history must survive — but the identity and the
 * membership go.
 */
export const deleteCustomerAccountWorkflow = createWorkflow(
  "delete-customer-account",
  (input: WorkflowData<Input>) => {
    detachCustomerEmployeeStep(input.customerId);

    deleteCustomerAuthIdentityStep(input);

    deleteCustomersWorkflow.runAsStep({
      input: { ids: [input.customerId] },
    });

    return new WorkflowResponse(undefined);
  }
);
