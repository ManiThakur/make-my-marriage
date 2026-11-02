import { redirect } from "next/navigation";
import { WorkspaceHeader } from "@/components/wedding/workspace-header";
import { MemberManager } from "@/components/members/member-manager";
import { connectToDatabase } from "@/lib/db/connect";
import { getAuthContext } from "@/modules/auth/service";
import { User, WeddingMemberInvitation, WeddingMembership } from "@/modules/auth/models";
import { invitationStatus } from "@/modules/auth/invitations";

export default async function MembersPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  if (!context.wedding || !context.membership) redirect("/wedding/setup");
  if (context.membership.role !== "ADMIN") redirect("/dashboard");
  await connectToDatabase();
  const memberships = await WeddingMembership.find({ weddingId: context.wedding._id }).sort({ joinedAt: 1 }).lean();
  const users = await User.find({ _id: { $in: memberships.map((member) => member.userId) } }).select("name email").lean();
  const userById = new Map(users.map((user) => [String(user._id), user]));
  const initialMembers = memberships.map((member) => {
    const user = userById.get(String(member.userId));
    return { id: String(member._id), userId: String(member.userId), name: user?.name ?? "Workspace member", email: user?.email ?? "", role: member.role, joinedAt: new Date(member.joinedAt).toISOString() };
  });
  const invitations = await WeddingMemberInvitation.find({ weddingId: context.wedding._id, status: "PENDING" }).sort({ createdAt: -1 }).lean();
  const initialInvitations = invitations.map((invite) => ({ id: String(invite._id), email: invite.email, role: invite.role, relationshipNote: invite.relationshipNote ?? "", status: invitationStatus(invite.status, invite.expiresAt), createdAt: new Date(invite.createdAt).toISOString(), expiresAt: new Date(invite.expiresAt).toISOString() }));
  const coupleName = `${context.wedding.brideName} & ${context.wedding.groomName}`;
  return (
    <main className="members-page">
      <WorkspaceHeader active="members" coupleName={coupleName} city={context.wedding.location.city} title={context.wedding.title ?? ""} userName={context.user.name} />
      <MemberManager initialMembers={initialMembers} initialInvitations={initialInvitations} coupleName={coupleName} city={context.wedding.location.city} />
      <footer className="events-footer"><span>Make My Marriage</span><span>Bring your people into the plans.</span><span>Invitation links expire after 7 days.</span></footer>
    </main>
  );
}
