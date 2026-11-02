export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailDelivery = { provider: "mock" | "resend"; status: "MOCKED" | "SENT"; id?: string };

export interface EmailProvider {
  readonly name: "mock" | "resend";
  send(message: EmailMessage): Promise<EmailDelivery>;
}

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock" as const;
  private readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailDelivery> {
    this.messages.push(structuredClone(message));
    return { provider: this.name, status: "MOCKED", id: `mock-${this.messages.length}` };
  }

  getMessages() {
    return structuredClone(this.messages);
  }

  clear() {
    this.messages.length = 0;
  }
}

type ResendConfig = { apiKey?: string; from?: string; fetcher?: typeof fetch };

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend" as const;
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: ResendConfig) {
    this.fetcher = config.fetcher ?? fetch;
  }

  async send(message: EmailMessage): Promise<EmailDelivery> {
    if (!this.config.apiKey || !this.config.from) {
      throw new Error("Resend requires RESEND_API_KEY and RESEND_FROM_EMAIL.");
    }
    const response = await this.fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...message, from: this.config.from }),
    });
    if (!response.ok) throw new Error(`Resend rejected the email request (HTTP ${response.status}).`);
    const payload = await response.json() as { id?: string };
    return { provider: this.name, status: "SENT", ...(payload.id ? { id: payload.id } : {}) };
  }
}

const localMockProvider = new MockEmailProvider();

export function getEmailProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const mode = configured || (process.env.NODE_ENV === "production" ? "resend" : "mock");
  if (mode === "mock") return localMockProvider;
  if (mode === "resend") return new ResendEmailProvider({ apiKey: process.env.RESEND_API_KEY, from: process.env.RESEND_FROM_EMAIL });
  throw new Error("EMAIL_PROVIDER must be either mock or resend.");
}
