import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { deleteEmployeesStep } from "../steps";
import { unlinkEmployeesFromCustomersStep } from "../steps/unlink-employees-from-customers";

export const deleteEmployeesWorkflow = createWorkflow(
  "delete-employees",
  (input: WorkflowData<string | string[]>): WorkflowResponse<string> => {
    // Must run before the soft delete: afterwards the employees can no longer
    // be queried to find which customers they were linked to.
    unlinkEmployeesFromCustomersStep(input);

    deleteEmployeesStep(input);

    return new WorkflowResponse("Company customers deleted");
  }
);
