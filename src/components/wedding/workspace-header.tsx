import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

type WorkspaceHeaderProps = {
  active: "dashboard" | "events" | "wedding" | "members";
  coupleName: string;
  city: string;
  title: string;
  userName: string;
};

export function WorkspaceHeader({ active, coupleName, city, title, userName }: WorkspaceHeaderProps) {
  return (
    <header className="workspace-topbar">
      <Link className="workspace-brand" href="/" aria-label="Make My Marriage home">
        <span>Make My Marriage</span><small>CEREMONIAL ATELIER</small>
        {title && <small className="workspace-title" title={title}>{title}</small>}
      </Link>
      <div className="workspace-couple"><b>{coupleName}</b><span aria-hidden="true">•</span><span>{city}</span></div>
      <nav className="workspace-nav" aria-label="Wedding workspace">
        <Link href="/dashboard" className={active === "dashboard" ? "active" : ""} aria-current={active === "dashboard" ? "page" : undefined}>Dashboard</Link>
        <Link href="/events" className={active === "events" ? "active" : ""} aria-current={active === "events" ? "page" : undefined}>Events</Link>
        <Link href="/wedding/edit" className={active === "wedding" ? "active" : ""} aria-current={active === "wedding" ? "page" : undefined}>Details</Link>
        <Link href="/members" className={active === "members" ? "active" : ""} aria-current={active === "members" ? "page" : undefined}>Kin &amp; Team</Link>
      </nav>
      <div className="workspace-account">
        <span className="workspace-avatar" aria-hidden="true">{userName.slice(0, 1).toUpperCase()}</span>
        <span className="workspace-user"><b>{userName}</b><small>Host</small></span>
        <SignOutButton />
      </div>
    </header>
  );
}
