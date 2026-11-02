"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type InvitationInfo = { email: string; role: "ADMIN" | "MANAGER"; relationshipNote: string; status: string; expiresAt: string; wedding: { brideName: string; groomName: string; weddingDate: string | null; city: string; state: string; title: string } };

function dateLabel(value: string | null) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function InvitationAcceptance({ token, invitation, userEmail }: { token: string; invitation: InvitationInfo | null; userEmail?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(invitation?.status === "JOINED");
  const returnTo = `/member-invitations/${token}`;
  const active = invitation?.status === "PENDING" && new Date(invitation.expiresAt).getTime() > Date.now();

  async function accept() {
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/member-invitations/${token}/accept`, { method: "POST" });
      const result = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message || "This invitation could not be accepted.");
      setAccepted(true);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "This invitation could not be accepted."); }
    finally { setPending(false); }
  }

  const title = invitation ? `${invitation.wedding.brideName} & ${invitation.wedding.groomName}` : "Your wedding workspace";
  return <main className="invite-portal">
    <header className="invite-portal-header"><Link href="/" className="invite-brand">Make My Marriage <small>PRIVATE WEDDING SPACE</small></Link>{userEmail && <span>Signed in as <b>{userEmail}</b></span>}</header>
    <section className="invite-portal-card">
      <div className={`invite-portal-mark ${active ? "" : "inactive"}`}>{accepted ? "✓" : active ? "✉" : "⌁"}</div>
      <p className="members-eyebrow">{active ? "A PRIVATE WORKSPACE INVITATION" : "INVITATION STATUS"}</p>
      <h1>{accepted ? "Welcome to the wedding workspace" : active ? "You’ve been invited to join" : "This invitation is no longer active"}</h1>
      <p className="invite-portal-copy">{accepted ? "Your access is ready. Open the workspace to start planning with the family." : active ? `Join ${title}’s private wedding workspace and help coordinate the celebrations.` : "This single-use invitation has expired or has already been claimed. Please contact the wedding host for a fresh invitation."}</p>
      {invitation && <div className="invite-wedding-summary"><span className="invite-monogram">{invitation.wedding.brideName.slice(0, 1)}&amp;{invitation.wedding.groomName.slice(0, 1)}</span><div><small>THE CELEBRATION OF</small><h2>{title}</h2><p>{[invitation.wedding.city, invitation.wedding.state].filter(Boolean).join(", ")} · {dateLabel(invitation.wedding.weddingDate)}</p></div></div>}
      {active && !accepted && <><div className="invite-role-summary"><span>Invited email</span><b>{invitation.email}</b><span>Your role</span><b>{invitation.role === "ADMIN" ? "Admin · Full workspace access" : `Manager · Planning access${invitation.relationshipNote ? ` · ${invitation.relationshipNote}` : ""}`}</b><small>Link expires {dateLabel(invitation.expiresAt.slice(0, 10))}</small></div>
        <div className="invite-benefits"><div><b>⌖ &nbsp;Confidential timelines</b><span>See ceremony schedules and updates.</span></div><div><b>♧ &nbsp;Kin circle sync</b><span>Coordinate plans with both families.</span></div><div><b>◉ &nbsp;Live updates</b><span>Stay in step as plans take shape.</span></div></div>
        {userEmail ? <><button className="members-primary invite-accept-button" type="button" disabled={pending} onClick={() => void accept()}>{pending ? "Joining workspace…" : "Accept invitation & join →"}</button>{error && <div className="members-error" role="alert">{error}</div>}{userEmail.toLowerCase() !== invitation.email.toLowerCase() && <p className="invite-account-note">This invitation is for <b>{invitation.email}</b>. Sign in with that account to accept.</p>}</> : <div className="invite-auth-actions"><Link className="members-primary" href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}>Create account to join →</Link><Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Already have an account? Sign in</Link></div>}
      </>}
      {accepted && <Link className="members-primary invite-accept-button" href="/dashboard">Open your workspace →</Link>}
      {!active && !accepted && <div className="invite-inactive-actions"><Link className="members-secondary" href="/">Return home</Link><p>Need access? Contact the wedding host and request a new link.</p></div>}
    </section>
    <footer className="invite-portal-footer">Private by design · Only invited workspace members can see wedding plans.</footer>
  </main>;
}
