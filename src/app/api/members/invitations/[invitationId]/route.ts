import { isValidObjectId } from "mongoose";
import { internalError, apiError } from "@/lib/http/api-response";
import { WeddingMemberInvitation } from "@/modules/auth/models";
import { requireInvitationAdmin } from "@/modules/auth/invitations";

export async function DELETE(_request: Request, { params }: { params: Promise<{ invitationId: string }> }) {
  try {
    const access = await requireInvitationAdmin();
    if ("response" in access) return access.response;
    const { invitationId } = await params;
    if (!isValidObjectId(invitationId)) return apiError(404, "INVITATION_NOT_FOUND", "This invitation could not be found.");
    const result = await WeddingMemberInvitation.updateOne(
      { _id: invitationId, weddingId: access.context.wedding._id, status: "PENDING" },
      { $set: { status: "REVOKED" } },
    );
    if (!result.modifiedCount) return apiError(404, "INVITATION_NOT_FOUND", "This invitation is no longer active.");
    return Response.json({ data: { id: invitationId, status: "REVOKED" } });
  } catch (error) {
    console.error("Workspace invitation could not be revoked", error);
    return internalError();
  }
}
