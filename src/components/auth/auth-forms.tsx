"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type AuthResponse = {
  data?: { hasWedding?: boolean };
  error?: { message?: string };
};

function Alert({ children }: { children: string }) {
  return <div className="form-alert" role="alert"><span aria-hidden="true">!</span>{children}</div>;
}

function PasswordField({ id = "password", label = "Password", autoComplete }: { id?: string; label?: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <span className="password-wrap">
        <input id={id} name={id} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={8} maxLength={128} placeholder={label === "Password" ? "At least 8 characters" : "Enter your password"} />
        <button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>{visible ? "Hide" : "Show"}</button>
      </span>
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe: form.get("rememberMe") === "on" }),
      });
      const result = await response.json() as AuthResponse;
      if (!response.ok) throw new Error(result.error?.message || "We couldn’t sign you in. Please try again.");
      router.replace(result.data?.hasWedding ? "/dashboard" : "/wedding/setup");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t sign you in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-heading"><p className="eyebrow">WELCOME BACK</p><h2>Come on in.</h2><p>Sign in to keep planning the celebrations together.</p></div>
      {error && <Alert>{error}</Alert>}
      <form className="auth-form" method="post" onSubmit={submit}>
        <label className="field" htmlFor="email"><span>Email address</span><input id="email" name="email" type="email" autoComplete="email" placeholder="e.g. meera.sharma@family.in" required maxLength={254} /></label>
        <PasswordField autoComplete="current-password" />
        <label className="remember-row"><input name="rememberMe" type="checkbox" defaultChecked /><span>Remember this device for 30 days</span></label>
        <button className="auth-submit" disabled={pending}>{pending ? "Signing you in…" : "Sign in"}<span aria-hidden="true">→</span></button>
      </form>
      <p className="auth-switch">New to the workspace? <Link href="/signup">Create an account</Link></p>
      <div className="guest-hint"><b><span aria-hidden="true">♡</span> Invited as a guest?</b><p>You don’t need an account. Open the personal invitation link shared with you to see the details and RSVP.</p></div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== form.get("confirmPassword")) {
      setError("Those passwords don’t match yet.");
      setPending(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password }),
      });
      const result = await response.json() as AuthResponse;
      if (!response.ok) throw new Error(result.error?.message || "We couldn’t create your account. Please try again.");
      router.replace("/wedding/setup");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t create your account. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-heading"><p className="eyebrow">A LOVELY PLACE TO BEGIN</p><h2>Create your account.</h2><p>Start your wedding space, then bring your favourite people along.</p></div>
      {error && <Alert>{error}</Alert>}
      <form className="auth-form" method="post" onSubmit={submit}>
        <label className="field" htmlFor="name"><span>Your name</span><input id="name" name="name" type="text" autoComplete="name" placeholder="How should we call you?" required minLength={2} maxLength={80} /></label>
        <label className="field" htmlFor="email"><span>Email address</span><input id="email" name="email" type="email" autoComplete="email" placeholder="e.g. meera.sharma@family.in" required maxLength={254} /></label>
        <PasswordField autoComplete="new-password" />
        <PasswordField id="confirmPassword" label="Confirm password" autoComplete="new-password" />
        <button className="auth-submit" disabled={pending}>{pending ? "Creating your account…" : "Create account"}<span aria-hidden="true">→</span></button>
        <p className="terms-note">By continuing, you agree to use this space with care for everyone’s wedding details.</p>
      </form>
      <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
    </div>
  );
}
