import { connectToDatabase } from "@/lib/db/connect";
import { InvitationAcceptance, type InvitationInfo } from "@/components/members/invitation-acceptance";
import { WeddingMemberInvitation } from "@/modules/auth/models";
import { getAuthContext, hashOpaqueToken } from "@/modules/auth/service";
import { invitationStatus } from "@/modules/auth/invitations";
import { Wedding } from "@/modules/weddings/model";

export default async function MemberInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await getAuthContext();
  let invitation: InvitationInfo | null = null;
  if (/^[A-Za-z0-9_-]{40,50}$/.test(token)) {
    await connectToDatabase();
    const record = await WeddingMemberInvitation.findOne({ tokenHash: hashOpaqueToken(token) }).lean();
    if (record) {
      const wedding = await Wedding.findOne({ _id: record.weddingId, deletedAt: null }).select("brideName groomName weddingDate location.city location.state title").lean();
      if (wedding) invitation = {
        email: record.email,
        role: record.role as "ADMIN" | "MANAGER",
        relationshipNote: record.relationshipNote ?? "",
        status: record.status === "ACCEPTED" && context && String(record.acceptedByUserId) === String(context.user._id) ? "JOINED" : invitationStatus(record.status, record.expiresAt),
        expiresAt: new Date(record.expiresAt).toISOString(),
        wedding: { brideName: wedding.brideName, groomName: wedding.groomName, weddingDate: wedding.weddingDate ?? null, city: wedding.location.city, state: wedding.location.state ?? "", title: wedding.title ?? "" },
      };
    }
  }
  return <InvitationAcceptance token={token} invitation={invitation} userEmail={context?.user.email} />;
}
