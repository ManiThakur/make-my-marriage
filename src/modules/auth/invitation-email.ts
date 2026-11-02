import { type EmailDelivery, type EmailProvider, type EmailMessage } from "../../lib/email/provider";

export type MemberInvitationEmailInput = {
  inviteeEmail: string;
  invitationUrl: string;
  inviterName: string;
  brideName: string;
  groomName: string;
  weddingDate: string | null;
  city: string;
  role: "ADMIN" | "MANAGER";
  relationshipNote?: string;
  expiresAt: Date;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function dateLabel(value: string | null) {
  if (!value) return "Date to be confirmed";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function buildMemberInvitationEmail(input: MemberInvitationEmailInput): EmailMessage {
  const couple = `${input.brideName} & ${input.groomName}`;
  const role = input.role === "ADMIN" ? "Admin · full workspace access" : "Manager · planning access";
  const note = input.relationshipNote?.trim();
  const expires = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(input.expiresAt);
  const safeCouple = escapeHtml(couple);
  const safeInviter = escapeHtml(input.inviterName);
  const safeCity = escapeHtml(input.city);
  const safeRole = escapeHtml(role);
  const safeNote = note ? escapeHtml(note) : "";
  const safeUrl = escapeHtml(input.invitationUrl);
  const relationshipLine = safeNote ? `<p style="color:#695650">Relationship note: ${safeNote}</p>` : "";
  const text = [
    `You’re invited to join ${couple}’s wedding workspace.`,
    `${input.inviterName} invited you as a ${role}.`,
    ...(note ? [`Relationship note: ${note}.`] : []),
    `Wedding: ${couple}, ${dateLabel(input.weddingDate)} · ${input.city}.`,
    `Accept your invitation: ${input.invitationUrl}`,
    `This single-use link expires on ${expires}.`,
  ].join("\n\n");
  return {
    from: "Make My Marriage <mock@localhost>",
    to: input.inviteeEmail,
    subject: `You’re invited to join ${couple}’s wedding workspace`,
    text,
    html: `<div style="margin:0;background:#f2fcf5;padding:32px 16px;font-family:Arial,sans-serif;color:#151d1a"><div style="max-width:580px;margin:auto;background:#fff;border:1px solid #e6f0ea;border-radius:14px;padding:36px"><p style="color:#466557;font-size:11px;letter-spacing:2px;font-weight:bold">MAKE MY MARRIAGE · PRIVATE WEDDING SPACE</p><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:32px">You’re invited to join ${safeCouple}</h1><p style="color:#695650;line-height:1.7">${safeInviter} invited you to collaborate on their wedding workspace.</p><div style="padding:16px;background:#f2faf5;border-radius:8px"><strong>${safeRole}</strong>${relationshipLine}<p>${safeCouple} · ${dateLabel(input.weddingDate)} · ${safeCity}</p></div><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;border-radius:7px;background:#b85437;color:#fff;text-decoration:none;font-weight:bold">View invitation</a></p><p style="color:#797165;font-size:12px;line-height:1.7">This private link is single-use and expires on ${expires}. If you weren’t expecting this invitation, you can ignore this email.</p></div></div>`,
  };
}

export function sendMemberInvitationEmail(provider: EmailProvider, input: MemberInvitationEmailInput): Promise<EmailDelivery> {
  return provider.send(buildMemberInvitationEmail(input));
}
