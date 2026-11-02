import { redirect } from "next/navigation";
import { WeddingEditForm } from "@/components/wedding/wedding-edit-form";
import { WeddingEvent } from "@/modules/events/model";
import { getAuthContext } from "@/modules/auth/service";

export default async function EditWeddingPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  if (!context.wedding || !context.membership) redirect("/wedding/setup");
  if (context.membership.role !== "ADMIN") redirect("/dashboard");

  const { wedding, user } = context;
  const activeCelebrationCount = await WeddingEvent.countDocuments({ weddingId: wedding._id, archivedAt: null });
  const coupleName = `${wedding.brideName} & ${wedding.groomName}`;
  const city = wedding.location.city;
  const initial = {
    brideName: wedding.brideName,
    groomName: wedding.groomName,
    weddingDate: wedding.weddingDate ?? null,
    city: wedding.location.city,
    state: wedding.location.state ?? "",
    country: wedding.location.country ?? "",
    venue: wedding.location.venue ?? "",
    title: wedding.title ?? "",
    updatedAt: new Date(wedding.updatedAt ?? Date.now()).toISOString(),
  };

  return (
    <main className="wedding-edit-page">
      <WeddingEditForm
        initial={initial}
        activeCelebrationCount={activeCelebrationCount}
        userName={user.name}
        city={city}
      />
      <footer className="events-footer"><span>Make My Marriage</span><span>Celebrations, thoughtfully in order.</span><span>Your wedding details are shared with your workspace.</span></footer>
    </main>
  );
}
