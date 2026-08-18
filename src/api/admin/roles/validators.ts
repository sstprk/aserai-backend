import { z } from "zod"

export const AdminCreateRole = z
  .object({
    name: z.string().trim().min(2).max(80),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().max(500).optional().nullable(),
    permissions: z
      .array(
        z.object({
          resource: z.string().trim().min(1).max(120),
          action: z.string().trim().min(1).max(80),
          description: z.string().max(500).optional().nullable(),
        })
      )
      .default([]),
  })
  .strict()

export const AdminUpdateRole = AdminCreateRole.omit({ permissions: true }).partial()

export const AdminCreatePermission = z
  .object({
    resource: z.string().trim().min(1).max(120),
    action: z.string().trim().min(1).max(80),
    description: z.string().max(500).optional().nullable(),
  })
  .strict()

export const AdminCreateRoleAssignment = z
  .object({
    actor_type: z.enum(["user", "customer", "api_client"]),
    actor_id: z.string().min(1),
    role_id: z.string().min(1),
    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict()

export type AdminCreateRoleType = z.infer<typeof AdminCreateRole>
export type AdminUpdateRoleType = z.infer<typeof AdminUpdateRole>
export type AdminCreatePermissionType = z.infer<typeof AdminCreatePermission>
export type AdminCreateRoleAssignmentType = z.infer<
  typeof AdminCreateRoleAssignment
>
