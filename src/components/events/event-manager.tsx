"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { EventType, WeddingEventData } from "@/modules/events/types";

const EVENT_OPTIONS: { type: EventType; label: string; suggestedName: string; description: string }[] = [
  { type: "ROKA", label: "Roka", suggestedName: "Roka Ceremony", description: "A joyful first celebration with both families." },
  { type: "ENGAGEMENT", label: "Engagement", suggestedName: "Engagement", description: "Mark the beginning of your celebrations." },
  { type: "MEHENDI", label: "Mehendi", suggestedName: "Mehendi Ceremony", description: "Henna, music, and an afternoon with family." },
  { type: "HALDI", label: "Haldi", suggestedName: "Haldi Ceremony", description: "Auspicious turmeric blessings and floral traditions." },
  { type: "SANGEET", label: "Sangeet", suggestedName: "Sangeet Evening", description: "An evening of music, dance, and dinner." },
  { type: "COCKTAIL", label: "Cocktail", suggestedName: "Cocktail Evening", description: "A relaxed evening to celebrate together." },
  { type: "WEDDING", label: "Wedding / Pheras", suggestedName: "Wedding Ceremony", description: "The vows and rituals at the heart of your wedding." },
  { type: "RECEPTION", label: "Reception", suggestedName: "Reception", description: "A warm gathering with family and friends." },
  { type: "CUSTOM", label: "Custom event", suggestedName: "", description: "Add any celebration that is part of your story." },
];

type EventDraft = {
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  description: string;
  dressCode: string;
};

type ApiResult = { data?: WeddingEventData; error?: { message?: string } };
const TIME_ZONE = "Asia/Kolkata";

function dateParts(isoDate: string) {
  const values = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(isoDate));
  return Object.fromEntries(values.map((part) => [part.type, part.value])) as Record<string, string>;
}

function localDate(isoDate: string) {
  const parts = dateParts(isoDate);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function localTime(isoDate: string) {
  const parts = new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(isoDate));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.hour}:${values.minute}`;
}

function formatDate(isoDate: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: TIME_ZONE }).format(new Date(isoDate));
}

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(isoDate));
}

function shiftDate(date: string, amount: number) {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + amount);
  return shifted.toISOString().slice(0, 10);
}

function eventTypeLabel(type: EventType) {
  return EVENT_OPTIONS.find((option) => option.type === type)?.label ?? "Custom event";
}

function emptyDraft(weddingDate: string, option?: EventType): EventDraft {
  const selected = EVENT_OPTIONS.find((item) => item.type === option);
  return {
    name: selected?.suggestedName ?? "",
    type: option ?? "CUSTOM",
    date: weddingDate,
    startTime: "10:00",
    endTime: "",
    venueName: "",
    address: "",
    description: "",
    dressCode: "",
  };
}

function draftFromEvent(event: WeddingEventData): EventDraft {
  const date = localDate(event.startsAt);
  return {
    name: event.name,
    type: event.type,
    date,
    startTime: localTime(event.startsAt),
    endTime: event.endsAt ? localTime(event.endsAt) : "",
    venueName: event.venueName,
    address: event.address,
    description: event.description,
    dressCode: event.dressCode,
  };
}

function isoAtIst(date: string, time: string) {
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

export function EventManager({ initialEvents, coupleName, city, weddingDate }: {
  initialEvents: WeddingEventData[];
  coupleName: string;
  city: string;
  weddingDate: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<EventDraft>(() => emptyDraft(weddingDate));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<WeddingEventData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [endsNextDay, setEndsNextDay] = useState(false);

  useEffect(() => {
    if (!formOpen && !archiveTarget) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) {
        setFormOpen(false);
        setArchiveTarget(null);
        setError("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formOpen, archiveTarget, pending]);

  const nextEvent = useMemo(() => {
    const now = Date.now();
    return events.find((event) => new Date(event.startsAt).getTime() >= now) ?? null;
  }, [events]);

  function openCreate(type?: EventType) {
    setEditingId(null);
    setDraft(emptyDraft(weddingDate, type));
    setEndsNextDay(false);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEdit(event: WeddingEventData) {
    setEditingId(event.id);
    setDraft(draftFromEvent(event));
    setEndsNextDay(Boolean(event.endsAt && localDate(event.endsAt) !== localDate(event.startsAt)));
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function changeType(type: EventType) {
    setDraft((current) => {
      const oldSuggestion = EVENT_OPTIONS.find((option) => option.type === current.type)?.suggestedName;
      const nextSuggestion = EVENT_OPTIONS.find((option) => option.type === type)?.suggestedName ?? "";
      const shouldReplaceName = !current.name || current.name === oldSuggestion;
      return { ...current, type, name: shouldReplaceName ? nextSuggestion : current.name };
    });
  }

  async function saveEvent(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setError("");
    if (!draft.date || !draft.startTime) {
      setError("Choose a date and start time for this celebration.");
      return;
    }

    let startsAt: string;
    let endsAt: string | null = null;
    try {
      startsAt = isoAtIst(draft.date, draft.startTime);
      if (draft.endTime) {
        const endDate = endsNextDay ? shiftDate(draft.date, 1) : draft.date;
        endsAt = isoAtIst(endDate, draft.endTime);
        if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
          setError("The end time must be after the start time. If it ends after midnight, select “Ends the next day.”");
          return;
        }
      }
    } catch {
      setError("Enter a valid date and time.");
      return;
    }

    setPending(true);
    try {
      const payload = {
        name: draft.name.trim(),
        type: draft.type,
        startsAt,
        endsAt,
        venueName: draft.venueName.trim(),
        address: draft.address.trim(),
        description: draft.description.trim(),
        dressCode: draft.dressCode.trim(),
      };
      const response = await fetch(editingId ? `/api/events/${editingId}` : "/api/events", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as ApiResult;
      if (!response.ok || !result.data) throw new Error(result.error?.message || "We couldn’t save this celebration. Please try again.");
      setEvents((current) => [...current.filter((event) => event.id !== result.data!.id), result.data!].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      setFormOpen(false);
      setNotice(editingId ? "Your celebration has been updated." : "Your celebration has been added.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We couldn’t save this celebration. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function archiveEvent() {
    if (!archiveTarget) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${archiveTarget.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message || "We couldn’t archive this celebration. Please try again.");
      setEvents((current) => current.filter((event) => event.id !== archiveTarget.id));
      setNotice(`${archiveTarget.name} has been archived.`);
      setArchiveTarget(null);
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "We couldn’t archive this celebration. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const sameDayEndConflict = Boolean(draft.endTime && draft.startTime && draft.endTime <= draft.startTime);

  return (
    <>
      <section className="events-content">
        <div className="events-heading-row">
          <div>
            <p className="events-eyebrow">{city.toUpperCase()} ITINERARY <span>•</span> {events.length} {events.length === 1 ? "CELEBRATION" : "CELEBRATIONS"} PLANNED</p>
            <h1>Your celebrations</h1>
            <p className="events-subtitle">A calm, sequential itinerary for {coupleName} in {city}.</p>
          </div>
          <button type="button" className="events-add-button" onClick={() => openCreate()}><span aria-hidden="true">＋</span> Add event</button>
        </div>

        {notice && <p className="events-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></p>}

        {events.length === 0 ? (
          <>
            <section className="events-empty-card" aria-labelledby="events-empty-title">
              <div className="empty-arch" aria-hidden="true"><span>✳</span></div>
              <p className="empty-kicker">NO CELEBRATIONS ADDED YET</p>
              <h2 id="events-empty-title">Begin shaping your wedding timeline.</h2>
              <p>Add ceremonies one at a time at your own pace. Your family will share a single, calm schedule.</p>
              <button type="button" className="events-empty-cta" onClick={() => openCreate()}><span aria-hidden="true">＋</span> Add your first event <span aria-hidden="true">→</span></button>
            </section>

            <section className="event-suggestions" aria-labelledby="event-suggestions-title">
              <div className="suggestions-heading"><h2 id="event-suggestions-title"><span aria-hidden="true">●</span> Quick suggestions for Indian weddings</h2><p>Choose one to start a draft</p></div>
              <div className="suggestion-grid">
                {EVENT_OPTIONS.filter((option) => option.type !== "ROKA" && option.type !== "ENGAGEMENT" && option.type !== "COCKTAIL" && option.type !== "CUSTOM").map((option) => (
                  <button type="button" className="suggestion-card" key={option.type} onClick={() => openCreate(option.type)}>
                    <span className={`suggestion-symbol suggestion-${option.type.toLowerCase()}`} aria-hidden="true">{option.type === "MEHENDI" ? "❋" : option.type === "HALDI" ? "✿" : option.type === "SANGEET" ? "♫" : option.type === "WEDDING" ? "⌂" : "♧"}</span>
                    <span className="suggestion-name">{option.label}</span>
                    <span className="suggestion-copy">{option.description}</span>
                    <span className="suggestion-action">+ Add this event <span aria-hidden="true">→</span></span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="events-summary" aria-label="Event summary">
              <span className="summary-pill"><i aria-hidden="true">▣</i> {events.length} Planned {events.length === 1 ? "Celebration" : "Celebrations"}</span>
              {nextEvent ? <span className="summary-pill summary-next"><i aria-hidden="true">⌛</i> Next up: {nextEvent.name} · {formatDate(nextEvent.startsAt)}</span> : <span className="summary-pill summary-next">Your celebrations are ready to review</span>}
              <span className="summary-pill"><i aria-hidden="true">◷</i> Local time: India Standard Time (IST)</span>
            </div>

            <section className="event-timeline" aria-label="Chronological celebration timeline">
              {events.map((event, index) => {
                const currentDate = localDate(event.startsAt);
                const firstIndex = events.findIndex((item) => localDate(item.startsAt) === currentDate);
                const date = dateParts(event.startsAt);
                return (
                  <article className="event-card" key={event.id}>
                    <div className="event-date-block">
                      <small>DAY {String(firstIndex + 1).padStart(2, "0")} · {formatDate(event.startsAt, { weekday: "long" }).toUpperCase()}</small>
                      <strong>{date.day}</strong>
                      <span>{formatDate(event.startsAt, { month: "short", year: "numeric" })}</span>
                      <span className={`event-type-chip type-${event.type.toLowerCase()}`}><i aria-hidden="true">●</i>{eventTypeLabel(event.type)}</span>
                    </div>
                    <div className="event-card-main">
                      <div className="event-card-title-row"><h2>{event.name}</h2><details className="event-action-menu">
                        <summary aria-label={`Actions for ${event.name}`}>⋮</summary>
                        <div className="event-action-popover"><button type="button" onClick={(clickEvent) => { (clickEvent.currentTarget.closest("details") as HTMLDetailsElement).open = false; openEdit(event); }}>Edit celebration</button><button type="button" onClick={(clickEvent) => { (clickEvent.currentTarget.closest("details") as HTMLDetailsElement).open = false; setError(""); setArchiveTarget(event); }}>Archive celebration</button></div>
                      </details></div>
                      <div className="event-meta-row"><span><i aria-hidden="true">◷</i>{formatTime(event.startsAt)}{event.endsAt ? ` – ${formatTime(event.endsAt)}` : ""} IST</span>{event.venueName && <span><i aria-hidden="true">⌖</i>{event.venueName}</span>}</div>
                      {event.address && <p className="event-address">{event.address}</p>}
                      {event.description && <p className="event-description">{event.description}</p>}
                      <div className="event-extra-row">
                        {event.dressCode && <span><i aria-hidden="true">♧</i><b>Dress code:</b> {event.dressCode}</span>}
                      </div>
                    </div>
                    <span className="event-sequence" aria-label={`Celebration ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </section>

      {formOpen && <div className="event-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setFormOpen(false); }}>
        <section className="event-form-panel" role="dialog" aria-modal="true" aria-labelledby="event-form-title">
          <header className="event-panel-header">
            <div><p>TIMELINE MANAGEMENT <span>•</span> {coupleName} · {city} Events</p><h2 id="event-form-title">{editingId ? "Edit celebration" : "Add a celebration"}</h2><small>{editingId ? "Update the details for this part of your wedding." : "Add a ceremony to your shared wedding timeline."}</small></div>
            <button type="button" className="panel-close" onClick={() => setFormOpen(false)} aria-label="Close event form">×</button>
          </header>
          <form className="event-form" onSubmit={saveEvent}>
            {error && <p className="form-alert" role="alert"><span aria-hidden="true">!</span>{error}</p>}
            <div className="event-field-group">
              <div className="event-label-row"><label>Ceremony type <b>*</b></label><span>Select a standard or custom ritual</span></div>
              <div className="event-type-options" role="group" aria-label="Ceremony type">
                {EVENT_OPTIONS.map((option) => <button key={option.type} type="button" className={draft.type === option.type ? "selected" : ""} aria-pressed={draft.type === option.type} onClick={() => changeType(option.type)}>{option.label}</button>)}
              </div>
            </div>
            <label className="event-field"><span>Event name <b>*</b></span><input autoFocus required maxLength={120} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Mehendi & Welcome Sangeet" /><small>Use the name your family will recognize in the schedule.</small></label>
            <label className="event-field"><span>Date <b>*</b></span><input type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label>
            <div className="event-time-fields">
              <label className="event-field"><span>Start time (IST) <b>*</b></span><input type="time" required value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} /></label>
              <label className="event-field"><span>End time <small>(Optional)</small></span><input type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} /></label>
            </div>
            {draft.endTime && <label className="next-day-option"><input type="checkbox" checked={endsNextDay} onChange={(event) => setEndsNextDay(event.target.checked)} /> Ends the next day{sameDayEndConflict && !endsNextDay ? " (required for this end time)" : ""}</label>}
            <p className="event-timezone-note"><span aria-hidden="true">◉</span> All schedules are displayed in India Standard Time (IST).</p>
            <div className="event-time-fields">
              <label className="event-field"><span>Venue name <small>(Optional)</small></span><input maxLength={160} value={draft.venueName} onChange={(event) => setDraft({ ...draft, venueName: event.target.value })} placeholder="e.g. The Courtyard at Rambagh Palace" /></label>
              <label className="event-field"><span>Address <small>(Optional)</small></span><input maxLength={300} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Street, city, and any directions" /></label>
            </div>
            <label className="event-field"><span>Description <small>(Optional)</small></span><textarea maxLength={1000} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add a note about this celebration" /></label>
            <label className="event-field"><span>Dress code <small>(Optional)</small></span><input maxLength={160} value={draft.dressCode} onChange={(event) => setDraft({ ...draft, dressCode: event.target.value })} placeholder="e.g. Festive pastels" /></label>
            <div className="event-form-actions"><button type="button" className="event-cancel-button" disabled={pending} onClick={() => setFormOpen(false)}>Cancel</button><button type="submit" className="event-save-button" disabled={pending}>{pending ? "Saving…" : <>{editingId ? "Save celebration" : "Add celebration"} <span aria-hidden="true">✓</span></>}</button></div>
          </form>
        </section>
      </div>}

      {archiveTarget && <div className="event-modal-backdrop archive-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setArchiveTarget(null); }}>
        <section className="archive-dialog" role="dialog" aria-modal="true" aria-labelledby="archive-title">
          <button type="button" className="panel-close archive-close" onClick={() => setArchiveTarget(null)} aria-label="Close archive confirmation">×</button>
          <span className="archive-icon" aria-hidden="true">▣</span>
          <p className="archive-eyebrow">WORKSPACE CELEBRATION ARCHIVE</p>
          <h2 id="archive-title">Archive “{archiveTarget.name}”?</h2>
          <p>Archiving hides this celebration from your active wedding itinerary while preserving its details.</p>
          <p className="archive-reassurance">This will not permanently delete any information.</p>
          {error && <p className="form-alert" role="alert"><span aria-hidden="true">!</span>{error}</p>}
          <div className="archive-snapshot"><small>CELEBRATION SNAPSHOT</small><b>{archiveTarget.name}</b><span>{formatDate(archiveTarget.startsAt)} · {formatTime(archiveTarget.startsAt)} IST</span>{archiveTarget.venueName && <span>{archiveTarget.venueName}</span>}</div>
          <div className="archive-actions"><button type="button" className="event-cancel-button" disabled={pending} onClick={() => setArchiveTarget(null)}>Keep event</button><button type="button" className="event-save-button" disabled={pending} onClick={archiveEvent}>{pending ? "Archiving…" : "Archive event"}</button></div>
        </section>
      </div>}
    </>
  );
}
