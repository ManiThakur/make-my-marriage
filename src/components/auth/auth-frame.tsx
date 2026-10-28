import Link from "next/link";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AuthFrame({ children, showSignOut = false }: { children: React.ReactNode; showSignOut?: boolean }) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="auth-brand" href="/">Make My Marriage</Link>
        <div className="auth-header-actions">
          {showSignOut && <SignOutButton />}
          <Link className="auth-return" href="/">← <span>Return to homepage</span></Link>
        </div>
      </header>
      <div className="auth-grid">
        <AuthShowcase />
        <section className="auth-main">{children}</section>
      </div>
      <footer className="auth-footer"><span>© 2026 Make My Marriage</span><span>Made with love, for the ones you love.</span></footer>
    </main>
  );
}
