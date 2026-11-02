import { describe, expect, it, vi } from "vitest";
import { getEmailProvider, MockEmailProvider, ResendEmailProvider } from "./provider";
import { sendMemberInvitationEmail, type MemberInvitationEmailInput } from "../../modules/auth/invitation-email";

const sampleInvitation: MemberInvitationEmailInput = {
  inviteeEmail: "relative@example.test",
  invitationUrl: "http://localhost:3000/member-invitations/mock-token-1234567890123456789012345678901234567890",
  inviterName: "Asha & Dev",
  brideName: "Asha",
  groomName: "Dev",
  weddingDate: "2027-02-14",
  city: "Jaipur",
  role: "MANAGER",
  relationshipNote: "Bride's sister",
  expiresAt: new Date("2027-01-01T00:00:00.000Z"),
};

describe("wedding invitation email providers", () => {
  it("defaults to the mock provider outside production", () => {
    vi.stubEnv("EMAIL_PROVIDER", "");
    vi.stubEnv("NODE_ENV", "development");
    try { expect(getEmailProvider().name).toBe("mock"); }
    finally { vi.unstubAllEnvs(); }
  });

  it("captures a complete invitation email in the mock provider without making a network request", async () => {
    const provider = new MockEmailProvider();
    const delivery = await sendMemberInvitationEmail(provider, sampleInvitation);
    const [message] = provider.getMessages();

    expect(delivery).toMatchObject({ provider: "mock", status: "MOCKED", id: "mock-1" });
    expect(message).toMatchObject({ to: sampleInvitation.inviteeEmail, subject: "You’re invited to join Asha & Dev’s wedding workspace" });
    expect(message.text).toContain(sampleInvitation.invitationUrl);
    expect(message.text).toContain("Manager · planning access");
    expect(message.html).toContain("Asha &amp; Dev");
    expect(message.html).toContain("Bride&#39;s sister");
    expect(message.html).toContain(sampleInvitation.invitationUrl);
    expect(provider.getMessages()).toHaveLength(1);
  });

  it("sends through the Resend API with the configured sender", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
    const provider = new ResendEmailProvider({ apiKey: "unit-test-key", from: "Make My Marriage <verified@example.test>", fetcher });
    const delivery = await provider.send({ from: "ignored mock sender", to: sampleInvitation.inviteeEmail, subject: "Invite", html: "<p>Join</p>", text: "Join" });

    expect(delivery).toEqual({ provider: "resend", status: "SENT", id: "email_123" });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer unit-test-key", "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toMatchObject({ from: "Make My Marriage <verified@example.test>", to: sampleInvitation.inviteeEmail, subject: "Invite" });
  });

  it("fails safely when Resend credentials are missing", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const provider = new ResendEmailProvider({ fetcher });
    await expect(provider.send({ from: "mock", to: sampleInvitation.inviteeEmail, subject: "Invite", html: "", text: "" }))
      .rejects.toThrow("Resend requires RESEND_API_KEY and RESEND_FROM_EMAIL.");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not expose Resend response bodies when delivery fails", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("private provider diagnostics", { status: 403 }));
    const provider = new ResendEmailProvider({ apiKey: "unit-test-key", from: "verified@example.test", fetcher });
    await expect(provider.send({ from: "mock", to: sampleInvitation.inviteeEmail, subject: "Invite", html: "", text: "" }))
      .rejects.toThrow("Resend rejected the email request (HTTP 403).");
  });
});
