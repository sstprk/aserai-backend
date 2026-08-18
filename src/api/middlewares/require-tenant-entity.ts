import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { getTenantId } from "../../types/tenant-context";

/**
 * Prevents an ID from another tenant from reaching a read or mutation route.
 * Keeping this check in middleware also protects workflows that only receive an ID.
 */
export const requireTenantEntity = (entity: string, parameter = "id") => {
  return async (
    req: MedusaRequest,
    _res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const id = req.params[parameter];

    if (!id) {
      return next();
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
      entity,
      fields: ["id"],
      filters: { id, tenant_id: getTenantId(req) },
    });

    if (!data.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `${entity} was not found`
      );
    }

    next();
  };
};
