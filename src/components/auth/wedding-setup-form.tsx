"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type SetupResponse = { error?: { message?: string } };

export function WeddingSetupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/wedding", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: form.get("brideName"), groomName: form.get("groomName"),
          weddingDate: form.get("weddingDate"), city: form.get("city"),
          state: form.get("state"), country: form.get("country"), title: form.get("title"),
        }),
      });
      const result = await response.json() as SetupResponse;
      if (!response.ok) throw new Error(result.error?.message || "We couldn’t save your wedding details. Please try again.");
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t save your wedding details. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card setup-card">
      <div className="auth-card-heading"><p className="eyebrow">YOUR SHARED SPACE</p><h2>Let’s make it yours.</h2><p>Start with a few details. You can fill in more of the story later.</p></div>
      {error && <div className="form-alert" role="alert"><span aria-hidden="true">!</span>{error}</div>}
      <form className="auth-form" onSubmit={submit}>
        <div className="field-pair">
          <label className="field" htmlFor="brideName"><span>Bride’s name</span><input id="brideName" name="brideName" placeholder="First name" required maxLength={80} /></label>
          <label className="field" htmlFor="groomName"><span>Groom’s name</span><input id="groomName" name="groomName" placeholder="First name" required maxLength={80} /></label>
        </div>
        <label className="field" htmlFor="title"><span>What should we call your wedding? <small>Optional</small></span><input id="title" name="title" placeholder="e.g. Aanya & Rohan’s wedding" maxLength={120} /></label>
        <div className="field-pair">
          <label className="field" htmlFor="weddingDate"><span>Wedding date</span><input id="weddingDate" name="weddingDate" type="date" required /></label>
          <label className="field" htmlFor="city"><span>City</span><input id="city" name="city" placeholder="e.g. Jaipur" required maxLength={120} /></label>
        </div>
        <div className="field-pair">
          <label className="field" htmlFor="state"><span>State <small>Optional</small></span><input id="state" name="state" placeholder="e.g. Rajasthan" maxLength={120} /></label>
          <label className="field" htmlFor="country"><span>Country <small>Optional</small></span><input id="country" name="country" placeholder="e.g. India" maxLength={120} /></label>
        </div>
        <button className="auth-submit" disabled={pending}>{pending ? "Saving your wedding…" : "Create our wedding space"}<span aria-hidden="true">→</span></button>
      </form>
      <p className="setup-footnote">You’ll be the first host and can invite family once your space is ready.</p>
    </div>
  );
}
