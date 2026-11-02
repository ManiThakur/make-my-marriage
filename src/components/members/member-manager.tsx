"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Role = "ADMIN" | "MANAGER";
type Member = { id: string; userId: string; name: string; email: string; role: Role; joinedAt: string };
type Invitation = { id: string; email: string; role: Role; relationshipNote: string; status: "PENDING" | "EXPIRED" | "ACCEPTED" | "REVOKED"; createdAt: string; expiresAt: string };
type Props = { initialMembers: Member[]; initialInvitations: Invitation[]; coupleName: string; city: string };
type ApiResult = { data?: { members?: Member[]; invitations?: Invitation[]; invitationUrl?: string; email?: string; role?: Role; expiresAt?: string; emailDelivery?: { provider: string; status: string } }; error?: { message?: string } };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function MemberManager({ initialMembers, initialInvitations, coupleName, city }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [emailDelivery, setEmailDelivery] = useState<{ provider: string; status: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const response = await fetch("/api/members/invitations", { cache: "no-store" });
    const result = await response.json() as ApiResult;
    if (!response.ok || !result.data) throw new Error(result.error?.message || "Could not refresh the member list.");
    setMembers(result.data.members ?? []);
    setInvitations(result.data.invitations ?? []);
  }

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setFormError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/members/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), role: form.get("role"), relationshipNote: form.get("relationshipNote") }) });
      const result = await response.json() as ApiResult;
      if (!response.ok || !result.data?.invitationUrl) throw new Error(result.error?.message || "The invitation could not be created.");
      setCreatedLink(result.data.invitationUrl);
      setEmailDelivery(result.data.emailDelivery ?? null);
      setCopied(false);
      await refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "The invitation could not be created.");
    } finally { setBusy(false); }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
    } catch { setNotice("Copy wasn’t available in this browser. Select and copy the link above."); }
  }

  async function revoke(invitation: Invitation) {
    if (!window.confirm(`Revoke the invitation for ${invitation.email}? The link will stop working.`)) return;
    setNotice("");
    try {
      const response = await fetch(`/api/members/invitations/${invitation.id}`, { method: "DELETE" });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.error?.message || "This invitation could not be revoked.");
      await refresh(); setNotice("Invitation revoked.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "This invitation could not be revoked."); }
  }

  const activeCount = invitations.filter((invite) => invite.status === "PENDING").length;
  const shareText = `You’re invited to join ${coupleName}’s wedding workspace: ${createdLink}`;

  return (
    <div className="members-content">
      <div className="members-breadcrumb"><Link href="/dashboard">Dashboard</Link><span>›</span><span>Kin &amp; Team</span></div>
      <section className="members-heading">
        <div><p className="members-eyebrow">YOUR WEDDING · {city.toUpperCase()}</p><h1>Kin &amp; Team</h1><p>Bring your people into the plans. Invite trusted family and wedding leads to coordinate together.</p></div>
        <button className="members-primary" type="button" onClick={() => { setShowForm(true); setCreatedLink(""); setFormError(""); }}>＋ Invite someone</button>
      </section>

      <div className="members-stats"><div><span className="members-stat-icon">♧</span><p><b>{members.length}</b><small>Active members</small></p></div><div><span className="members-stat-icon">✉</span><p><b>{activeCount}</b><small>Pending invitations</small></p></div><div className="members-workspace-stat"><span>Workspace</span><b>{coupleName}</b><small>{city}</small></div></div>

      <section className="members-panel">
        <div className="members-panel-heading"><div><p className="members-eyebrow">THE COLLABORATIVE WEDDING COUNCIL</p><h2>Workspace members</h2><p>Trusted family and coordinators helping shape the celebrations.</p></div><span className="members-live"><i /> Live roster</span></div>
        <div className="members-table-wrap"><table className="members-table"><thead><tr><th>Member</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><div className="member-identity"><span className="member-avatar">{member.name.slice(0, 1).toUpperCase()}</span><span><b>{member.name}</b><small>{member.email}</small></span></div></td><td><span className={`role-pill ${member.role.toLowerCase()}`}>{member.role === "ADMIN" ? "Admin" : "Manager"}</span></td><td>{dateLabel(member.joinedAt)}</td><td><span className="member-active"><i /> Active</span></td></tr>)}</tbody></table></div>
        <div className="members-privacy"><span>♙</span><div><b>Privacy &amp; collaborative boundaries</b><p>Workspace members can coordinate timelines and celebrations. Financial records and private host notes remain visible only to the couple.</p></div></div>
      </section>

      <section className="members-panel pending-panel"><div className="members-panel-heading"><div><p className="members-eyebrow">SHARED WITH YOUR PEOPLE</p><h2>Pending invitations <span>{activeCount}</span></h2><p>Single-use links expire seven days after they’re created.</p></div></div>
        {invitations.length ? <div className="pending-list">{invitations.map((invite) => <article className="pending-invite" key={invite.id}><span className="pending-icon">✉</span><div className="pending-details"><b>{invite.email}</b><span>{invite.relationshipNote || (invite.role === "ADMIN" ? "Admin" : "Manager")} · Sent {dateLabel(invite.createdAt)}</span></div><span className={`pending-status ${invite.status === "EXPIRED" ? "expired" : ""}`}>{invite.status === "EXPIRED" ? "Expired" : `Expires ${dateLabel(invite.expiresAt)}`}</span><button type="button" className="pending-revoke" onClick={() => void revoke(invite)}>Revoke</button></article>)}</div> : <div className="members-empty"><span>✉</span><b>No invitations yet</b><p>Invite trusted family members to help plan together.</p><button type="button" onClick={() => setShowForm(true)}>Create the first invitation</button></div>}
      </section>
      {notice && <p className="members-notice" role="status">{notice}</p>}

      {showForm && <div className="members-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="members-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <button className="members-dialog-close" type="button" aria-label="Close" onClick={() => { setShowForm(false); setCreatedLink(""); }}>×</button>
        {createdLink ? <><span className="members-success-icon">✓</span><p className="members-eyebrow">WORKSPACE ACCESS READY</p><h2 id="invite-title">Your invitation is ready</h2><p className="members-dialog-copy">{emailDelivery?.status === "SENT" ? "The invitation email was sent. You can also copy and share the private link directly." : emailDelivery?.status === "MOCKED" ? "The mock provider captured this email locally; it was not sent over the internet. Copy the link to share it manually." : "Email delivery is not configured or failed. Copy and share the private link manually."}</p><label className="members-field"><span>Private invitation link</span><input readOnly value={createdLink} onFocus={(event) => event.currentTarget.select()} /></label><button className="members-primary members-copy-button" type="button" onClick={() => void copyLink()}>{copied ? "✓ Copied" : "Copy invitation link"}</button><div className="members-share-actions"><a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>Share on WhatsApp ↗</a><a href={`mailto:?subject=${encodeURIComponent(`Join ${coupleName}'s wedding workspace`)}&body=${encodeURIComponent(shareText)}`}>Email draft ↗</a></div><button className="members-secondary" type="button" onClick={() => { setShowForm(false); setCreatedLink(""); }}>Back to family &amp; team</button></> : <><p className="members-eyebrow">INVITE TO YOUR WEDDING SPACE</p><h2 id="invite-title">Invite someone</h2><p className="members-dialog-copy">Email a secure link to trusted family or a wedding lead.</p>{formError && <div className="members-error" role="alert">{formError}</div>}<form className="members-form" onSubmit={createInvitation}>
          <label className="members-field"><span>Email address <b>*</b></span><input name="email" type="email" required maxLength={254} placeholder="name@example.com" /></label>
          <label className="members-field"><span>Workspace role <b>*</b></span><select name="role" defaultValue="MANAGER"><option value="MANAGER">Manager — planning access</option><option value="ADMIN">Admin — full access</option></select></label>
          <div className="role-explainer"><b>Manager</b> can coordinate celebrations and event details. <b>Admin</b> can also manage members and wedding details.</div>
          <label className="members-field"><span>Relationship or family note <small>Optional</small></span><input name="relationshipNote" maxLength={80} placeholder="e.g. Bride’s mother" /></label>
          <p className="members-security-note"><span>♢</span> Each link is unique, single-use, and expires after 7 days.</p>
          <div className="members-dialog-actions"><button className="members-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="members-primary" type="submit" disabled={busy}>{busy ? "Creating link…" : "Create invitation →"}</button></div>
        </form></>}
      </section></div>}
    </div>
  );
}
