import { apiError, internalError } from "@/lib/http/api-response";
import { connectToDatabase } from "@/lib/db/connect";
import { WeddingMemberInvitation } from "@/modules/auth/models";
import { hashOpaqueToken } from "@/modules/auth/service";
import { invitationStatus } from "@/modules/auth/invitations";
import { Wedding } from "@/modules/weddings/model";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return apiError(404, "INVALID_TOKEN", "This invitation link could not be found.");
    await connectToDatabase();
    const invitation = await WeddingMemberInvitation.findOne({ tokenHash: hashOpaqueToken(token) }).lean();
    if (!invitation) return apiError(404, "INVALID_TOKEN", "This invitation link could not be found.");
    const wedding = await Wedding.findOne({ _id: invitation.weddingId, deletedAt: null }).select("brideName groomName weddingDate location.city location.state title").lean();
    if (!wedding) return apiError(404, "INVALID_TOKEN", "This invitation link could not be found.");
    return Response.json({ data: {
      email: invitation.email,
      role: invitation.role,
      relationshipNote: invitation.relationshipNote ?? "",
      status: invitationStatus(invitation.status, invitation.expiresAt),
      expiresAt: new Date(invitation.expiresAt).toISOString(),
      wedding: {
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDate: wedding.weddingDate ?? null,
        city: wedding.location.city,
        state: wedding.location.state ?? "",
        title: wedding.title ?? "",
      },
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public wedding invitation could not be loaded", error);
    return internalError();
  }
}
