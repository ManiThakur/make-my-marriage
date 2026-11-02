import { redirect } from "next/navigation";
import { WorkspaceHeader } from "@/components/wedding/workspace-header";
import { EventManager } from "@/components/events/event-manager";
import { serializeEvent } from "@/modules/events/api";
import { WeddingEvent } from "@/modules/events/model";
import type { WeddingEventData } from "@/modules/events/types";
import { getAuthContext } from "@/modules/auth/service";

export default async function EventsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  if (!context.wedding || !context.membership) redirect("/wedding/setup");

  const records = await WeddingEvent.find({ weddingId: context.wedding._id, archivedAt: null })
    .sort({ startsAt: 1 })
    .lean();
  const events = records.map(serializeEvent) as WeddingEventData[];
  const coupleName = `${context.wedding.brideName} & ${context.wedding.groomName}`;
  const city = context.wedding.location.city;

  return (
    <main className="events-page">
      <WorkspaceHeader active="events" coupleName={coupleName} city={city} title={context.wedding.title ?? ""} userName={context.user.name} />
      <EventManager initialEvents={events} coupleName={coupleName} city={city} weddingDate={context.wedding.weddingDate ?? ""} />
      <footer className="events-footer"><span>Make My Marriage</span><span>Celebrations, thoughtfully in order.</span><span>All event times shown in India Standard Time (IST).</span></footer>
    </main>
  );
}
