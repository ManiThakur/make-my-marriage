import { internalError, apiError } from "@/lib/http/api-response";
import { connectToDatabase } from "@/lib/db/connect";
import { requireWeddingContext, serializeEvent, parseOffsetDateTime } from "@/modules/events/api";
import { WeddingEvent } from "@/modules/events/model";
import { createEventSchema, hasValidEventRange } from "@/modules/events/validation";

export async function GET(request: Request) {
  try {
    const access = await requireWeddingContext();
    if ("response" in access) return access.response;

    const url = new URL(request.url);
    const includeArchivedValue = url.searchParams.get("includeArchived");
    if (includeArchivedValue !== null && includeArchivedValue !== "true" && includeArchivedValue !== "false") {
      return apiError(400, "VALIDATION_ERROR", "includeArchived must be true or false.");
    }

    const query: Record<string, unknown> = { weddingId: access.context.wedding._id };
    if (includeArchivedValue !== "true") query.archivedAt = null;
    const startsAt: { $gte?: Date; $lt?: Date } = {};
    for (const [parameter, operator] of [["from", "$gte"], ["to", "$lt"]] as const) {
      const value = url.searchParams.get(parameter);
      if (value) {
        const parsed = parseOffsetDateTime(value);
        if (!parsed) return apiError(400, "VALIDATION_ERROR", `${parameter} must be an ISO date-time with an offset.`);
        startsAt[operator] = parsed;
      }
    }
    if (Object.keys(startsAt).length) query.startsAt = startsAt;

    await connectToDatabase();
    const events = await WeddingEvent.find(query).sort({ startsAt: 1 }).lean();
    return Response.json({ data: events.map(serializeEvent) });
  } catch (error) {
    console.error("Wedding events could not be loaded", error);
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireWeddingContext();
    if ("response" in access) return access.response;

    let body: unknown;
    try { body = await request.json(); }
    catch { return apiError(400, "VALIDATION_ERROR", "Send valid event details."); }

    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Add an event name and a valid start date and time.");
    if (!hasValidEventRange(parsed.data.startsAt, parsed.data.endsAt)) {
      return apiError(400, "VALIDATION_ERROR", "The end time must be after the start time.");
    }

    await connectToDatabase();
    const event = await WeddingEvent.create({
      weddingId: access.context.wedding._id,
      ...parsed.data,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    });
    return Response.json({ data: serializeEvent(event.toObject()) }, { status: 201 });
  } catch (error) {
    console.error("Wedding event could not be created", error);
    return internalError();
  }
}
