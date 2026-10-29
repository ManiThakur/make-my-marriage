import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthContext } from "@/modules/auth/service";

function formatWeddingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default async function DashboardPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  if (!context.wedding) redirect("/wedding/setup");

  const { wedding, user } = context;
  const location = [wedding.location.city, wedding.location.state].filter(Boolean).join(", ");
  const name = `${wedding.brideName} & ${wedding.groomName}`;

  return (
    <main className="welcome-page">
      <header className="welcome-topbar">
        <Link className="welcome-brand" href="/">Make My Marriage <span>ATELIER</span></Link>
        <div className="welcome-account"><span className="welcome-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span className="welcome-user"><b>{user.name}</b><small>Host Kin</small></span><SignOutButton /></div>
      </header>
      <section className="welcome-intro">
        <span className="welcome-eyebrow"><i /> Your wedding space is ready</span>
        <h1>It’s a lovely beginning,<br /><em>{wedding.brideName} &amp; {wedding.groomName}.</em></h1>
        <p>Your private wedding workspace has been created. Take your time to shape your ceremonies and bring your family in whenever you are ready.</p>
      </section>

      <div className="welcome-grid">
        <section className="identity-card" aria-label="Wedding identity">
          <div className="identity-badges"><span className="active-workspace"><i /> Workspace active · Just created</span><span className="host-badge">♙ &nbsp;Hosted by {user.name} (Admin)</span></div>
          <div className="identity-main"><p>THE CELEBRATIONS OF</p><h2>{name}</h2><div className="identity-arch" aria-hidden="true"><i /><i /><i /></div></div>
          <div className="identity-facts"><span>▣ &nbsp;{formatWeddingDate(wedding.weddingDate)}</span><span>⌖ &nbsp;{location}</span></div>
        </section>

        <section className="readiness-card" id="readiness" aria-labelledby="readiness-title">
          <div className="readiness-heading"><div><h2 id="readiness-title">Workspace readiness</h2><p>A serene path forward to shape your celebrations without feeling rushed.</p></div><span>Step 1 of 3 complete</span></div>
          <div className="readiness-progress" aria-label="1 of 3 steps complete"><i /></div>
          <div className="readiness-step complete"><span className="readiness-icon">✓</span><div><b>Wedding details added <small>Done</small></b><p>Couple names, celebration date, and {wedding.location.city} destination confirmed.</p></div></div>
          <div className="readiness-step upcoming" id="celebrations-step"><span className="readiness-icon">▤</span><div><b>Add your celebrations <small>Next up</small></b><p>Set up multi-day ceremonies like Mehendi, Haldi, Sangeet, and the Pheras at your own pace.</p></div></div>
          <div className="readiness-step later"><span className="readiness-icon">♧</span><div><b>Invite your family <small>Subsequent</small></b><p>Add parents and trusted family members as Admins or Managers when you’re ready to coordinate together.</p></div></div>
          <div className="readiness-actions"><Link className="readiness-primary" href="#celebrations-step">Start with your celebrations <span aria-hidden="true">→</span></Link><a href="#privacy-note" className="readiness-secondary">Invite family later</a></div>
        </section>
      </div>

      <section className="welcome-moodboard" aria-label="A few themes for your celebrations">
        <div className="mood-image mood-ritual"><span>Tradition &amp; Rituals</span></div>
        <div className="mood-image mood-spaces"><span>Sacred Spaces</span></div>
        <div className="mood-image mood-memories"><span>Shared Memories</span></div>
      </section>
      <p className="workspace-privacy" id="privacy-note"><span aria-hidden="true">♙</span> Your wedding workspace is private and accessible only to invited hosts. No details are visible publicly until you choose to share.</p>
      <footer className="welcome-footer"><span>© 2026 Make My Marriage Atelier.</span><span>Curated Ceremonies &amp; Kin Collaboration</span><div><a href="#privacy-note">Privacy</a><a href="#privacy-note">Terms</a></div></footer>
    </main>
  );
}
