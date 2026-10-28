import Link from "next/link";
import { AuthShowcase } from "@/components/auth/auth-showcase";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="auth-brand" href="/">Make My Marriage</Link>
        <Link className="auth-return" href="/">← <span>Return to homepage</span></Link>
      </header>
      <div className="auth-grid">
        <AuthShowcase />
        <section className="auth-main">{children}</section>
      </div>
      <footer className="auth-footer"><span>© 2026 Make My Marriage</span><span>Made with love, for the ones you love.</span></footer>
    </main>
  );
}
