import Link from "next/link";
import { redirect } from "next/navigation";
import { WeddingSetupForm } from "@/components/auth/wedding-setup-form";
import { getAuthContext } from "@/modules/auth/service";

export default async function WeddingSetupPage() {
  const context = await getAuthContext();
  if (!context) redirect("/signup");
  if (context.wedding) redirect("/dashboard");
  return (
    <main className="wedding-onboarding-page">
      <header className="onboarding-topbar">
        <Link className="onboarding-brand" href="/">Make My Marriage</Link>
        <Link className="onboarding-exit" href="/">Exit setup <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="onboarding-progress" aria-label="Wedding setup progress">
        <div className="progress-step active"><span>1</span><p><small>STEP 1</small><b>Your wedding</b></p></div>
        <i className="progress-connector" />
        <div className="progress-step"><span>2</span><p><small>STEP 2</small><b>Make it yours</b></p></div>
      </div>
      <WeddingSetupForm />
      <Link className="onboarding-back" href="/">← &nbsp;Return to homepage</Link>
      <footer className="onboarding-footer"><span>© 2026 Make My Marriage</span><span>Privacy Policy &nbsp;&nbsp;&nbsp; Terms of Service</span></footer>
    </main>
  );
}
