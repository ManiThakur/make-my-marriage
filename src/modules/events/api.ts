import { apiError } from "@/lib/http/api-response";
import { getAuthContext } from "@/modules/auth/service";
import { parseOffsetDateTime } from "./datetime";

type AuthContext = NonNullable<Awaited<ReturnType<typeof getAuthContext>>>;
type EventDate = Date | string;

export type EventLike = {
  _id: unknown;
  name: string;
  type?: string;
  startsAt: EventDate;
  endsAt?: EventDate | null;
  venueName?: string;
  address?: string;
  description?: string;
  dressCode?: string;
  archivedAt?: EventDate | null;
  createdAt?: EventDate;
  updatedAt?: EventDate;
};

export async function requireWeddingContext(): Promise<{ context: AuthContext } | { response: Response }> {
  const context = await getAuthContext();
  if (!context) return { response: apiError(401, "UNAUTHORIZED", "Please sign in to manage wedding events.") };
  if (!context.membership || !context.wedding) {
    return { response: apiError(403, "WEDDING_REQUIRED", "Create or join a wedding before managing events.") };
  }
  return { context };
}

export function serializeEvent(event: EventLike) {
  return {
    id: String(event._id),
    name: event.name,
    type: event.type ?? "CUSTOM",
    startsAt: new Date(event.startsAt).toISOString(),
    endsAt: event.endsAt ? new Date(event.endsAt).toISOString() : null,
    venueName: event.venueName ?? "",
    address: event.address ?? "",
    description: event.description ?? "",
    dressCode: event.dressCode ?? "",
    archivedAt: event.archivedAt ? new Date(event.archivedAt).toISOString() : null,
    createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : null,
    updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : null,
  };
}

export { parseOffsetDateTime } from "./datetime";
