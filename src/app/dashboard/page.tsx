import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthContext } from "@/modules/auth/service";

function formatWeddingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default async function DashboardPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  if (!context.wedding) redirect("/wedding/setup");

  const { wedding, user } = context;
  const title = wedding.title || `${wedding.brideName} & ${wedding.groomName}`;
  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><Link href="/" className="auth-brand">Make My Marriage</Link><div><span className="dashboard-user">{user.name}</span><SignOutButton /></div></header>
      <section className="dashboard-content">
        <p className="eyebrow">YOUR WEDDING, AT A GLANCE</p>
        <p className="dashboard-kicker">A shared space for your favourite people</p>
        <h1>{title}</h1>
        <p className="dashboard-date">{formatWeddingDate(wedding.weddingDate)} <span>·</span> {wedding.location.city}{wedding.location.state ? `, ${wedding.location.state}` : ""}</p>
        <div className="dashboard-welcome-card"><span className="dashboard-flower">✿</span><div><p className="eyebrow">A LOVELY PLACE TO START</p><h2>Your wedding plans live here now.</h2><p>We’re setting up your shared space. Event planning and family invitations are the next pieces to add.</p></div></div>
        <div className="dashboard-next"><span>01</span><div><b>Your wedding space is ready</b><small>You’re the first host with Admin access.</small></div><span className="ready-check">✓</span></div>
      </section>
    </main>
  );
}
