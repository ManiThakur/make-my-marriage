"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type MouseEvent, useEffect, useMemo, useState } from "react";
import { WorkspaceHeader } from "@/components/wedding/workspace-header";

type WeddingDetails = {
  brideName: string;
  groomName: string;
  weddingDate: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  title: string;
};

type InitialWeddingDetails = Omit<WeddingDetails, "weddingDate"> & {
  weddingDate: string | null;
  updatedAt: string;
};

type ApiResult = {
  error?: { message?: string };
  data?: { updatedAt?: string };
};

const editableFields: { key: keyof WeddingDetails; label: string }[] = [
  { key: "brideName", label: "Partner 1 name" },
  { key: "groomName", label: "Partner 2 name" },
  { key: "weddingDate", label: "Primary wedding date" },
  { key: "city", label: "Wedding city" },
  { key: "state", label: "State / province" },
  { key: "country", label: "Country" },
  { key: "venue", label: "Venue / estate" },
  { key: "title", label: "Wedding subtitle or family note" },
];

function formatDate(value: string) {
  if (!value) return "Date to be confirmed";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function compactLocation(details: WeddingDetails) {
  return [details.city, details.state, details.country].filter(Boolean).join(", ");
}

export function WeddingEditForm({
  initial,
  activeCelebrationCount,
  userName,
  city,
}: {
  initial: InitialWeddingDetails;
  activeCelebrationCount: number;
  userName: string;
  city: string;
}) {
  const router = useRouter();
  const initialDetails = useMemo<WeddingDetails>(() => ({
    brideName: initial.brideName,
    groomName: initial.groomName,
    weddingDate: initial.weddingDate ?? "",
    city: initial.city,
    state: initial.state,
    country: initial.country,
    venue: initial.venue,
    title: initial.title,
  }), [initial]);
  const [details, setDetails] = useState(initialDetails);
  const [dateNotSet, setDateNotSet] = useState(!initialDetails.weddingDate);
  const [lastUpdated, setLastUpdated] = useState(initial.updatedAt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changedFields = editableFields.filter(({ key }) => details[key] !== initialDetails[key] || (key === "weddingDate" && dateNotSet !== !initialDetails.weddingDate));
  const isDirty = changedFields.length > 0;
  const coupleName = `${details.brideName || "Partner 1"} & ${details.groomName || "Partner 2"}`;
  const destination = compactLocation(details) || "Wedding destination";

  useEffect(() => {
    if (!isDirty || saved) return;
    const preventLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLeave);
    return () => window.removeEventListener("beforeunload", preventLeave);
  }, [isDirty, saved]);

  useEffect(() => {
    if (!discardOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") keepEditing();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [discardOpen]);

  function update<K extends keyof WeddingDetails>(key: K, value: WeddingDetails[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function requestLeave(destination: string) {
    if (isDirty && !saved) {
      setPendingDestination(destination);
      setDiscardOpen(true);
      return;
    }
    router.push(destination);
  }

  function handleLinkNavigation(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
    event.preventDefault();
    requestLeave(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  function leaveEditor() {
    setDiscardOpen(false);
    router.push(pendingDestination || "/dashboard");
    setPendingDestination(null);
  }

  function keepEditing() {
    setDiscardOpen(false);
    setPendingDestination(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/wedding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          weddingDate: details.weddingDate || null,
          updatedAt: lastUpdated,
        }),
      });
      const result = await response.json() as ApiResult;
      if (!response.ok) throw new Error(result.error?.message || "We couldn’t save your wedding details. Please try again.");
      if (result.data?.updatedAt) setLastUpdated(result.data.updatedAt);
      setSaved(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t save your wedding details. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (saved) {
    return (
      <div className="wedding-edit-interaction" onClickCapture={handleLinkNavigation}>
      <WorkspaceHeader active="wedding" coupleName={coupleName} city={details.city || city} title={details.title} userName={userName} />
      <section className="wedding-edit-success" aria-live="polite">
        <nav className="wedding-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link><span aria-hidden="true">›</span><span>Wedding details</span><span aria-hidden="true">›</span><span>Updated</span>
        </nav>
        <article className="wedding-success-card">
          <div className="wedding-success-mark" aria-hidden="true">✓</div>
          <p className="wedding-eyebrow">WORKSPACE REGISTRY</p>
          <h1>Wedding details updated</h1>
          <p className="wedding-success-copy">Your shared workspace has been updated with the latest celebration details. Existing ceremony dates remain as scheduled until you edit them individually.</p>
          <div className="wedding-success-summary">
            <span className="wedding-monogram" aria-hidden="true">{(details.brideName[0] || "W").toUpperCase()}&amp;{(details.groomName[0] || "W").toUpperCase()}</span>
            <div><p className="wedding-eyebrow">THE CELEBRATION OF</p><h2>{coupleName}</h2><p>{formatDate(details.weddingDate)} <span aria-hidden="true">·</span> {destination}</p></div>
          </div>
          <p className="wedding-sync-note"><span aria-hidden="true">●</span> Saved just now · {formatUpdatedAt(lastUpdated)} · Shared with your wedding workspace</p>
          <div className="wedding-success-actions">
            <Link className="wedding-primary-button" href="/dashboard">Return to dashboard <span aria-hidden="true">→</span></Link>
            <Link className="wedding-secondary-button" href="/events">Manage celebrations</Link>
          </div>
        </article>
      </section>
      </div>
    );
  }

  return (
    <div className="wedding-edit-interaction" onClickCapture={handleLinkNavigation}>
      <WorkspaceHeader active="wedding" coupleName={coupleName} city={details.city || city} title={details.title} userName={userName} />
      <section className="wedding-edit-shell">
        <div className="wedding-edit-heading">
          <nav className="wedding-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link><span aria-hidden="true">/</span><span>Wedding details</span><span aria-hidden="true">/</span><span>Edit wedding</span>
          </nav>
          <span className="wedding-last-updated"><i aria-hidden="true" /> Last updated {formatUpdatedAt(initial.updatedAt)} by {userName}</span>
          <p className="wedding-eyebrow">EDIT YOUR CELEBRATION</p>
          <h1>Update your wedding details</h1>
          <p className="wedding-edit-intro">Changes will update your shared wedding workspace. Existing celebrations keep their dates unless you edit them separately.</p>
        </div>

        <div className="wedding-edit-grid">
          <form className="wedding-edit-card" onSubmit={save}>
            <div className="wedding-section-heading">
              <div><p className="wedding-eyebrow">SECTION 01 · FOUNDATIONAL DETAILS</p><h2>Your celebration</h2><p>Update the couple, date, and destination details.</p></div>
              <span className="wedding-section-icon" aria-hidden="true">✎</span>
            </div>
            {error && <div className="wedding-form-error" role="alert">{error}</div>}

            <div className="wedding-form-grid">
              <label className="wedding-edit-field" htmlFor="edit-bride-name"><span>Partner 1 name <b>*</b></span><input id="edit-bride-name" value={details.brideName} onChange={(event) => update("brideName", event.target.value)} maxLength={80} required autoComplete="name" /></label>
              <label className="wedding-edit-field" htmlFor="edit-groom-name"><span>Partner 2 name <b>*</b></span><input id="edit-groom-name" value={details.groomName} onChange={(event) => update("groomName", event.target.value)} maxLength={80} required /></label>

              <label className="wedding-edit-field wedding-date-field" htmlFor="edit-wedding-date"><span>Primary wedding date <b>{dateNotSet ? "" : "*"}</b></span><input id="edit-wedding-date" type="date" value={details.weddingDate} onChange={(event) => { update("weddingDate", event.target.value); setDateNotSet(false); }} required={!dateNotSet} disabled={dateNotSet} /></label>
              <label className="wedding-date-undecided"><input type="checkbox" checked={dateNotSet} onChange={(event) => { setDateNotSet(event.target.checked); if (event.target.checked) update("weddingDate", ""); }} /><span>We haven’t set a new date yet</span></label>

              {details.weddingDate !== initialDetails.weddingDate && <div className="wedding-date-notice"><span aria-hidden="true">ⓘ</span><p><b>Date modification notice</b><br />Your existing celebrations keep their current dates and times. Edit individual dates in the Events schedule.</p></div>}

              <label className="wedding-edit-field" htmlFor="edit-wedding-city"><span>Wedding city / primary destination <b>*</b></span><input id="edit-wedding-city" value={details.city} onChange={(event) => update("city", event.target.value)} maxLength={120} required autoComplete="address-level2" /></label>
              <label className="wedding-edit-field" htmlFor="edit-wedding-venue"><span>Venue / estate <small>(Optional)</small></span><input id="edit-wedding-venue" value={details.venue} onChange={(event) => update("venue", event.target.value)} maxLength={160} placeholder="Add your main venue" /></label>
              <label className="wedding-edit-field" htmlFor="edit-wedding-state"><span>State / province <small>(Optional)</small></span><input id="edit-wedding-state" value={details.state} onChange={(event) => update("state", event.target.value)} maxLength={120} autoComplete="address-level1" /></label>
              <label className="wedding-edit-field" htmlFor="edit-wedding-country"><span>Country <small>(Optional)</small></span><input id="edit-wedding-country" value={details.country} onChange={(event) => update("country", event.target.value)} maxLength={120} autoComplete="country-name" /></label>
              <label className="wedding-edit-field wedding-edit-note" htmlFor="edit-wedding-title"><span>Wedding subtitle or family note <small>(Optional)</small><small>{details.title.length} / 180</small></span><small>Shown in your wedding workspace and invitations.</small><textarea id="edit-wedding-title" value={details.title} onChange={(event) => update("title", event.target.value)} maxLength={180} rows={3} /></label>
            </div>

            <div className="wedding-edit-actions">
              <button className="wedding-secondary-button" type="button" onClick={() => requestLeave("/dashboard")}>Cancel</button>
              <span>{isDirty ? `${changedFields.length} unsaved change${changedFields.length === 1 ? "" : "s"}` : "Changes sync to your shared workspace"}</span>
              <button className="wedding-primary-button" type="submit" disabled={pending || !isDirty}>{pending ? "Saving changes…" : "Save changes"} <span aria-hidden="true">✓</span></button>
            </div>
            <p className="wedding-edit-footnote"><span aria-hidden="true">↻</span> Changing wedding details won’t reset guest lists, RSVP links, or your scheduled celebrations.</p>
          </form>

          <aside className="wedding-edit-aside">
            <section className="wedding-ledger-card">
              <div className="wedding-ledger-top"><p className="wedding-eyebrow">WORKSPACE LEDGER</p><span>Live · Synced</span></div>
              <div className="wedding-ledger-identity"><span className="wedding-ledger-monogram">{(details.brideName[0] || "W").toUpperCase()}&amp;{(details.groomName[0] || "W").toUpperCase()}</span><h2>{coupleName}</h2>{details.title && <p>{details.title}</p>}</div>
              <dl className="wedding-ledger-facts">
                <div><dt>Primary date</dt><dd>{formatDate(details.weddingDate)}</dd></div>
                <div><dt>Primary location</dt><dd>{destination}</dd></div>
                {details.venue && <div><dt>Main venue</dt><dd>{details.venue}</dd></div>}
                <div><dt>Active celebrations</dt><dd>{activeCelebrationCount} scheduled</dd></div>
                <div><dt>Workspace lead</dt><dd><i aria-hidden="true" /> {userName} (Admin)</dd></div>
              </dl>
              <p className="wedding-aside-notice"><span aria-hidden="true">♧</span><span><b>Family circle notice</b><br />Editing these details won’t change dates on existing events. Your wedding workspace and event records remain intact.</span></p>
            </section>
            <Link className="wedding-support-card" href="/events"><span aria-hidden="true">♡</span><span><b>Need to adjust ceremony dates?</b><small>Manage each celebration in Events</small></span><span aria-hidden="true">→</span></Link>
          </aside>
        </div>
      </section>

      {discardOpen && <div className="wedding-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) keepEditing(); }}>
        <section className="wedding-discard-dialog" role="alertdialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-description">
          <div className="wedding-dialog-kicker"><span aria-hidden="true">✎</span><span><b>Wedding details</b><small>Unsaved changes</small></span><button type="button" aria-label="Keep editing" onClick={keepEditing}>×</button></div>
          <h2 id="discard-title">Discard your changes?</h2>
          <p id="discard-description">You have unsaved edits to your wedding details. If you leave now, these changes will be lost and your workspace will keep its previous details.</p>
          <div className="wedding-discard-list"><div><b>Unsaved field edits</b><span>{changedFields.length} modification{changedFields.length === 1 ? "" : "s"}</span></div>
            {changedFields.map(({ key, label }) => <div className="wedding-discard-diff" key={key}><span>{label}</span><span>{initialDetails[key] || "Not set"} <i aria-hidden="true">→</i> <b>{details[key] || "Not set"}</b></span></div>)}
          </div>
          <div className="wedding-discard-actions"><button type="button" className="wedding-secondary-button" onClick={keepEditing}>Keep editing</button><button type="button" className="wedding-primary-button" onClick={leaveEditor}>Discard changes</button></div>
          <p className="wedding-esc-hint"><kbd>ESC</kbd> Press ESC to return to editing</p>
        </section>
      </div>}
    </div>
  );
}
