import { apiError, internalError } from "@/lib/http/api-response";
import { connectToDatabase } from "@/lib/db/connect";
import { User, WeddingMemberInvitation, WeddingMembership } from "@/modules/auth/models";
import { getAuthContext, hashOpaqueToken } from "@/modules/auth/service";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const context = await getAuthContext();
    if (!context) return apiError(401, "UNAUTHORIZED", "Sign in with the email address this invitation was sent to.");
    const { token } = await params;
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return apiError(404, "INVALID_TOKEN", "This invitation link could not be found.");
    await connectToDatabase();
    const user = await User.findById(context.user._id).select("emailNormalized").lean();
    if (!user) return apiError(401, "UNAUTHORIZED", "Please sign in again to accept this invitation.");
    const tokenHash = hashOpaqueToken(token);
    const invitation = await WeddingMemberInvitation.findOne({ tokenHash }).lean();
    if (!invitation) return apiError(404, "INVALID_TOKEN", "This invitation link could not be found.");
    if (invitation.status === "ACCEPTED" && String(invitation.acceptedByUserId) === String(user._id)) {
      return Response.json({ data: { weddingId: String(invitation.weddingId), role: invitation.role, alreadyAccepted: true } });
    }
    if (invitation.status !== "PENDING") return apiError(410, "INVITATION_ALREADY_ACCEPTED", "This invitation is no longer active. Ask the wedding host for a fresh link.");
    if (new Date(invitation.expiresAt).getTime() <= Date.now()) return apiError(410, "TOKEN_EXPIRED", "This invitation link has expired. Ask the wedding host for a fresh link.");
    if (user.emailNormalized !== invitation.emailNormalized) return apiError(403, "INVITATION_EMAIL_MISMATCH", `Sign in with ${invitation.email} to accept this invitation.`);
    if (await WeddingMembership.exists({ userId: user._id })) return apiError(409, "ALREADY_HAS_WEDDING", "This account already belongs to a wedding workspace.");

    // Claim the single-use token first. This conditional update also prevents two
    // simultaneous acceptance requests from creating duplicate memberships.
    const claimed = await WeddingMemberInvitation.findOneAndUpdate(
      { _id: invitation._id, status: "PENDING", expiresAt: { $gt: new Date() } },
      { $set: { status: "ACCEPTED", acceptedByUserId: user._id, acceptedAt: new Date() } },
      { new: true },
    ).lean();
    if (!claimed) return apiError(410, "INVITATION_ALREADY_ACCEPTED", "This invitation is no longer active. Ask the wedding host for a fresh link.");
    try {
      await WeddingMembership.create({ userId: user._id, weddingId: invitation.weddingId, role: invitation.role, joinedAt: new Date() });
    } catch (error) {
      await WeddingMemberInvitation.updateOne(
        { _id: invitation._id, status: "ACCEPTED", acceptedByUserId: user._id },
        { $set: { status: "PENDING", acceptedByUserId: null, acceptedAt: null } },
      ).catch(() => undefined);
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return apiError(409, "ALREADY_HAS_WEDDING", "This account already belongs to a wedding workspace.");
      }
      throw error;
    }
    return Response.json({ data: { weddingId: String(invitation.weddingId), role: invitation.role } });
  } catch (error) {
    console.error("Wedding invitation could not be accepted", error);
    return internalError();
  }
}
