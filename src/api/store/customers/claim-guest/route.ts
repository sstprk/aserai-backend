import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import { MedusaError, Modules } from "@medusajs/framework/utils";

type Body = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Turn the guest customer behind this email into a real account.
 *
 * Checking out as a guest creates a `customer` row with `has_account = false`
 * (Medusa's `findOrCreateCustomerStep`, at cart time). Registering afterwards
 * used to create a *second* row for the same address: the person got an empty
 * account and their guest orders stayed on the orphaned row.
 *
 * This claims the existing row instead — the orders come with it.
 *
 * Responds 404 when there is nothing to claim, which is the caller's signal to
 * fall through to the normal create path.
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) => {
  const authIdentityId = req.auth_context?.auth_identity_id;

  if (!authIdentityId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authentication required"
    );
  }

  const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH);
  const customerService = req.scope.resolve<ICustomerModuleService>(
    Modules.CUSTOMER
  );

  const authIdentity = await authService.retrieveAuthIdentity(authIdentityId, {
    relations: ["provider_identities"],
  });

  // Refuse to move an identity that already owns a customer.
  if (
    (authIdentity.app_metadata as Record<string, unknown> | undefined)
      ?.customer_id
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This identity is already linked to a customer"
    );
  }

  const email = authIdentity.provider_identities?.[0]?.entity_id;

  if (!email) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No email on the authenticated identity"
    );
  }

  const guests = await customerService.listCustomers({
    email,
    has_account: false,
  });

  if (!guests.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No guest customer to claim for this email"
    );
  }

  // Oldest first, so the row the earliest orders point at is the one promoted.
  const guest = guests.sort(
    (a, b) =>
      new Date(a.created_at as string).getTime() -
      new Date(b.created_at as string).getTime()
  )[0];

  const body = req.body ?? {};

  // `has_account` is a real column but absent from UpdateCustomerDTO, hence the
  // cast — the module passes the payload straight through to the entity.
  await customerService.updateCustomers(guest.id, {
    has_account: true,
    ...(body.first_name ? { first_name: body.first_name } : {}),
    ...(body.last_name ? { last_name: body.last_name } : {}),
    ...(body.phone ? { phone: body.phone } : {}),
    ...(body.company_name ? { company_name: body.company_name } : {}),
    ...(body.metadata
      ? { metadata: { ...(guest.metadata ?? {}), ...body.metadata } }
      : {}),
  } as Parameters<ICustomerModuleService["updateCustomers"]>[1]);

  await authService.updateAuthIdentities({
    id: authIdentityId,
    app_metadata: {
      ...((authIdentity.app_metadata as Record<string, unknown>) ?? {}),
      customer_id: guest.id,
    },
  });

  const [customer] = await customerService.listCustomers({ id: guest.id });

  res.json({ customer, claimed: true });
};
