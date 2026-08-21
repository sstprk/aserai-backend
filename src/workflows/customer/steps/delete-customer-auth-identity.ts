import { IAuthModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type Input = { customerId: string; email?: string | null };

type RemovedIdentity = {
  authIdentityId: string;
  appMetadata: Record<string, unknown>;
  providers: {
    entity_id: string;
    provider: string;
    user_metadata?: Record<string, unknown>;
    provider_metadata?: Record<string, unknown>;
  }[];
};

/**
 * Delete the auth identity behind a customer account.
 *
 * Medusa's own `removeCustomerAccountWorkflow` only sets
 * `app_metadata.customer_id = null` and leaves both `auth_identity` and
 * `provider_identity` in place. `provider_identity` carries a unique index on
 * `(entity_id, provider)` with no `deleted_at` clause, so the email stays
 * claimed forever and re-registering it fails with "Identity with email already
 * exists" — the ghost account.
 *
 * Only identities that actually belong to this customer are removed, so an
 * admin user who happens to share the address keeps their login.
 */
export const deleteCustomerAuthIdentityStep = createStep(
  "delete-customer-auth-identity",
  async (
    { customerId, email }: Input,
    { container }
  ): Promise<StepResponse<RemovedIdentity[], RemovedIdentity[]>> => {
    if (!email) {
      return new StepResponse([], []);
    }

    const authService = container.resolve<IAuthModuleService>(Modules.AUTH);

    const identities = await authService.listAuthIdentities(
      { provider_identities: { entity_id: email } },
      { relations: ["provider_identities"] }
    );

    const owned = identities.filter(
      (identity) =>
        (identity.app_metadata as Record<string, unknown> | undefined)
          ?.customer_id === customerId
    );

    if (!owned.length) {
      return new StepResponse([], []);
    }

    const removed: RemovedIdentity[] = owned.map((identity) => ({
      authIdentityId: identity.id,
      appMetadata: (identity.app_metadata ?? {}) as Record<string, unknown>,
      providers: (identity.provider_identities ?? []).map((provider) => ({
        entity_id: provider.entity_id,
        provider: provider.provider,
        ...(provider.user_metadata
          ? { user_metadata: provider.user_metadata }
          : {}),
        ...(provider.provider_metadata
          ? { provider_metadata: provider.provider_metadata }
          : {}),
      })),
    }));

    // Provider identities first — they hold the FK to the auth identity.
    const providerIds = owned.flatMap((identity) =>
      (identity.provider_identities ?? []).map((provider) => provider.id)
    );

    if (providerIds.length) {
      await authService.deleteProviderIdentities(providerIds);
    }

    await authService.deleteAuthIdentities(owned.map((i) => i.id));

    return new StepResponse(removed, removed);
  },
  async (removed: RemovedIdentity[] | undefined, { container }) => {
    if (!removed?.length) {
      return;
    }

    const authService = container.resolve<IAuthModuleService>(Modules.AUTH);

    // Recreated with the original password hash, so a rolled-back delete leaves
    // the customer able to log in exactly as before.
    for (const identity of removed) {
      await authService.createAuthIdentities([
        {
          app_metadata: identity.appMetadata,
          provider_identities: identity.providers,
        },
      ]);
    }
  }
);
