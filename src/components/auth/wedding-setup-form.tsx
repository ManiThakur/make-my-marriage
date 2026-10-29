"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type SetupResponse = { error?: { message?: string } };

function formatDate(value: string) {
  if (!value) return "Wedding date";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function WeddingSetupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [title, setTitle] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/wedding", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brideName, groomName, weddingDate, city, state, country, title }),
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

  const displayBride = brideName.trim() || "Bride";
  const displayGroom = groomName.trim() || "Groom";
  const locationParts = [city.trim(), state.trim(), country.trim()].filter(Boolean);
  const initials = `${displayGroom[0]}&${displayBride[0]}`;

  return (
    <section className="onboarding-card">
      <div className="onboarding-heading"><p className="eyebrow">FOUNDATION &amp; ATELIER SETUP</p><h1>Let’s make it yours.</h1><p>A few details will give your family a shared place to start.</p></div>
      {error && <div className="form-alert" role="alert"><span aria-hidden="true">!</span>{error}</div>}
      <form className="onboarding-form" onSubmit={submit}>
        <div className="field-pair">
          <label className="field" htmlFor="brideName"><span>Bride’s name <b>*</b></span><input id="brideName" name="brideName" value={brideName} onChange={(event) => setBrideName(event.target.value)} placeholder="Full name" required maxLength={80} autoComplete="name" /></label>
          <label className="field" htmlFor="groomName"><span>Groom’s name <b>*</b></span><input id="groomName" name="groomName" value={groomName} onChange={(event) => setGroomName(event.target.value)} placeholder="Full name" required maxLength={80} /></label>
        </div>
        <label className="field" htmlFor="weddingDate"><span>Primary wedding date <b>*</b></span><input id="weddingDate" name="weddingDate" type="date" value={weddingDate} onChange={(event) => setWeddingDate(event.target.value)} required /><small className="field-hint">ⓘ &nbsp;You can add multi-day ceremony dates (Mehendi, Haldi, Sangeet, Reception) next.</small></label>
        <div className="field-pair">
          <label className="field" htmlFor="city"><span>Primary city <b>*</b></span><input id="city" name="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Jaipur" required maxLength={120} autoComplete="address-level2" /></label>
          <label className="field" htmlFor="state"><span>State / Province <small>(Optional)</small></span><input id="state" name="state" value={state} onChange={(event) => setState(event.target.value)} placeholder="e.g. Rajasthan" maxLength={120} autoComplete="address-level1" /></label>
        </div>
        <div className="field-pair">
          <label className="field" htmlFor="country"><span>Country <small>(Optional)</small></span><input id="country" name="country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="e.g. India" maxLength={120} autoComplete="country-name" /></label>
          <label className="field" htmlFor="title"><span>Wedding title or celebration subtitle <small>(Optional)</small></span><input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. The Winter Celebration" maxLength={120} /></label>
        </div>
        <p className="field-hint title-hint">Used on your family workspace header and private portal invitations.</p>

        <div className="preview-label"><span>Preview of your wedding identity</span><span className="preview-ready"><i /> Ready to create</span></div>
        <div className="onboarding-preview" aria-live="polite">
          <div className="onboarding-preview-copy">
            <p>▦ &nbsp;Family Workspace • {title.trim() || "The Celebration"}</p>
            <h2>{displayGroom} &amp; {displayBride} · {formatDate(weddingDate)} · {city.trim() || "City"}</h2>
            <small>{locationParts.join(", ") || "Location details"} &nbsp; • &nbsp; 1 host configured &nbsp; • &nbsp; 0 ceremonies added</small>
          </div>
          <span className="preview-monogram">{initials}</span>
        </div>
        <button className="auth-submit" disabled={pending}>{pending ? "Creating your wedding space…" : "Create our wedding space"}<span aria-hidden="true">→</span></button>
        <p className="setup-footnote">♧ &nbsp;As creator, you will become the primary host (Admin). You can invite family members in the next step.</p>
      </form>
    </section>
  );
}
