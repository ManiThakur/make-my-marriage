import "server-only";
import { apiError } from "@/lib/http/api-response";
import { connectToDatabase } from "@/lib/db/connect";
import { getAuthContext } from "@/modules/auth/service";

export async function requireInvitationAdmin() {
  const context = await getAuthContext();
  if (!context) return { response: apiError(401, "UNAUTHORIZED", "Please sign in to manage family invitations.") } as const;
  if (!context.wedding || !context.membership) return { response: apiError(403, "WEDDING_REQUIRED", "Create or join a wedding before inviting family.") } as const;
  if (context.membership.role !== "ADMIN") return { response: apiError(403, "FORBIDDEN", "Only a wedding admin can manage family invitations.") } as const;
  await connectToDatabase();
  return { context } as const;
}

export function invitationStatus(status: string, expiresAt: Date | string): "PENDING" | "EXPIRED" | "ACCEPTED" | "REVOKED" {
  if (status === "PENDING" && new Date(expiresAt).getTime() <= Date.now()) return "EXPIRED";
  if (status === "PENDING" || status === "ACCEPTED") return status;
  return "REVOKED";
}
