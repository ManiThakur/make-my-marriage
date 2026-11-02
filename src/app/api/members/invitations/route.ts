import { randomBytes } from "node:crypto";
import { z } from "zod";
import { internalError, apiError } from "@/lib/http/api-response";
import { User, WeddingMemberInvitation, WeddingMembership } from "@/modules/auth/models";
import { hashOpaqueToken } from "@/modules/auth/service";
import { invitationStatus, requireInvitationAdmin } from "@/modules/auth/invitations";
import { getEmailProvider } from "@/lib/email/provider";
import { sendMemberInvitationEmail } from "@/modules/auth/invitation-email";

const createSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["ADMIN", "MANAGER"]),
  relationshipNote: z.string().trim().max(80).optional().default(""),
});

export async function GET() {
  try {
    const access = await requireInvitationAdmin();
    if ("response" in access) return access.response;
    const memberships = await WeddingMembership.find({ weddingId: access.context.wedding._id }).sort({ joinedAt: 1 }).lean();
    const users = await User.find({ _id: { $in: memberships.map((member) => member.userId) } }).select("name email").lean();
    const userById = new Map(users.map((user) => [String(user._id), user]));
    const invitations = await WeddingMemberInvitation.find({ weddingId: access.context.wedding._id, status: "PENDING" }).sort({ createdAt: -1 }).lean();
    return Response.json({ data: {
      members: memberships.map((member) => {
        const user = userById.get(String(member.userId));
        return { id: String(member._id), userId: String(member.userId), name: user?.name ?? "Workspace member", email: user?.email ?? "", role: member.role, joinedAt: new Date(member.joinedAt).toISOString() };
      }),
      invitations: invitations.map((invite) => ({ id: String(invite._id), email: invite.email, role: invite.role, relationshipNote: invite.relationshipNote ?? "", status: invitationStatus(invite.status, invite.expiresAt), createdAt: new Date(invite.createdAt).toISOString(), expiresAt: new Date(invite.expiresAt).toISOString() })),
    } });
  } catch (error) {
    console.error("Workspace invitations could not be loaded", error);
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireInvitationAdmin();
    if ("response" in access) return access.response;
    let body: unknown;
    try { body = await request.json(); } catch { return apiError(400, "VALIDATION_ERROR", "Send a valid email address and workspace role."); }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Enter a valid email address and choose a workspace role.");

    const email = parsed.data.email.trim();
    const emailNormalized = email.toLowerCase();
    const existingUser = await User.findOne({ emailNormalized }).select("_id").lean();
    if (existingUser && await WeddingMembership.exists({ userId: existingUser._id })) {
      return apiError(409, "ALREADY_HAS_WEDDING", "This account is already part of a wedding workspace.");
    }
    const now = new Date();
    const existingPending = await WeddingMemberInvitation.findOne({ weddingId: access.context.wedding._id, emailNormalized, status: "PENDING" }).lean();
    if (existingPending && new Date(existingPending.expiresAt).getTime() > now.getTime()) {
      return apiError(409, "INVITATION_PENDING", "An active invitation already exists for this email. Revoke it before creating a new link.");
    }
    if (existingPending) await WeddingMemberInvitation.updateOne({ _id: existingPending._id, status: "PENDING", expiresAt: { $lte: now } }, { $set: { status: "REVOKED" } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
    if (!appUrl) return apiError(500, "APP_URL_NOT_CONFIGURED", "Set NEXT_PUBLIC_APP_URL before creating invitation links.");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await WeddingMemberInvitation.create({
      weddingId: access.context.wedding._id,
      email,
      emailNormalized,
      relationshipNote: parsed.data.relationshipNote,
      role: parsed.data.role,
      tokenHash: hashOpaqueToken(token),
      status: "PENDING",
      invitedByUserId: access.context.user._id,
      expiresAt,
    });
    const origin = new URL(appUrl).origin;
    const invitationUrl = `${origin}/member-invitations/${token}`;
    let emailDelivery: { provider: string; status: string; id?: string } = {
      provider: process.env.EMAIL_PROVIDER?.trim().toLowerCase() || (process.env.NODE_ENV === "production" ? "resend" : "mock"),
      status: "FAILED",
    };
    try {
      emailDelivery = await sendMemberInvitationEmail(getEmailProvider(), {
        inviteeEmail: email,
        invitationUrl,
        inviterName: access.context.user.name,
        brideName: access.context.wedding.brideName,
        groomName: access.context.wedding.groomName,
        weddingDate: access.context.wedding.weddingDate ?? null,
        city: access.context.wedding.location.city,
        role: invitation.role,
        relationshipNote: invitation.relationshipNote,
        expiresAt,
      });
    } catch {
      // Keep the invitation usable: the admin can still copy and share its URL.
      // Do not log provider errors because they may contain private recipient data.
      console.error("Invitation email delivery failed", { invitationId: String(invitation._id), provider: emailDelivery.provider });
    }
    return Response.json({ data: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      relationshipNote: invitation.relationshipNote,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      invitationUrl,
      emailDelivery,
    } }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return apiError(409, "INVITATION_PENDING", "An active invitation already exists for this email. Revoke it before creating a new link.");
    }
    console.error("Workspace invitation could not be created", error);
    return internalError();
  }
}
