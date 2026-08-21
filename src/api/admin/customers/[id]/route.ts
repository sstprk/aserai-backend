import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { deleteCustomerAccountWorkflow } from "../../../../workflows/customer/workflows/delete-customer-account";

/**
 * Overrides Medusa's core customer delete.
 *
 * The core route runs `removeCustomerAccountWorkflow`, which soft-deletes the
 * customer and leaves the auth identity and the company membership behind. The
 * leftover `provider_identity` row permanently claims the email address, so the
 * same person can never register again — the reported "ghost account".
 *
 * Only DELETE is declared here; GET and POST keep falling through to core.
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { id },
  });

  const customer = customers[0] as { id: string; email?: string } | undefined;

  if (!customer) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Customer with id "${id}" was not found`
    );
  }

  await deleteCustomerAccountWorkflow.run({
    input: { customerId: customer.id, email: customer.email },
    container: req.scope,
  });

  res.json({ id, object: "customer", deleted: true });
};
