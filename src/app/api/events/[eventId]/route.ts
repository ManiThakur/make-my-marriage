import { Types } from "mongoose";
import { internalError, apiError } from "@/lib/http/api-response";
import { connectToDatabase } from "@/lib/db/connect";
import { requireWeddingContext, serializeEvent } from "@/modules/events/api";
import { WeddingEvent } from "@/modules/events/model";
import { hasValidEventRange, updateEventSchema } from "@/modules/events/validation";

type RouteContext = { params: Promise<{ eventId: string }> };

async function readEventId(context: RouteContext) {
  const { eventId } = await context.params;
  return Types.ObjectId.isValid(eventId) ? eventId : null;
}

export async function GET(_request: Request, routeContext: RouteContext) {
  try {
    const access = await requireWeddingContext();
    if ("response" in access) return access.response;
    const eventId = await readEventId(routeContext);
    if (!eventId) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");

    await connectToDatabase();
    const event = await WeddingEvent.findOne({ _id: eventId, weddingId: access.context.wedding._id, archivedAt: null }).lean();
    if (!event) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");
    return Response.json({ data: serializeEvent(event) });
  } catch (error) {
    console.error("Wedding event could not be loaded", error);
    return internalError();
  }
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  try {
    const access = await requireWeddingContext();
    if ("response" in access) return access.response;
    const eventId = await readEventId(routeContext);
    if (!eventId) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");

    let body: unknown;
    try { body = await request.json(); }
    catch { return apiError(400, "VALIDATION_ERROR", "Send valid event details."); }

    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return apiError(400, "VALIDATION_ERROR", "Provide valid event details to update.");
    }

    await connectToDatabase();
    const current = await WeddingEvent.findOne({ _id: eventId, weddingId: access.context.wedding._id }).lean();
    if (!current) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");
    if (current.archivedAt) return apiError(409, "EVENT_ARCHIVED", "Archived events can’t be edited.");

    const nextStart = parsed.data.startsAt ?? current.startsAt.toISOString();
    const nextEnd = parsed.data.endsAt === undefined ? current.endsAt?.toISOString() ?? null : parsed.data.endsAt;
    if (!hasValidEventRange(nextStart, nextEnd)) {
      return apiError(400, "VALIDATION_ERROR", "The end time must be after the start time.");
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startsAt) updates.startsAt = new Date(parsed.data.startsAt);
    if (parsed.data.endsAt !== undefined) updates.endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;
    const event = await WeddingEvent.findOneAndUpdate(
      { _id: eventId, weddingId: access.context.wedding._id, archivedAt: null, updatedAt: current.updatedAt },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();
    if (!event) return apiError(409, "EVENT_CHANGED", "This event changed while you were editing. Reload it and try again.");
    return Response.json({ data: serializeEvent(event) });
  } catch (error) {
    console.error("Wedding event could not be updated", error);
    return internalError();
  }
}

export async function DELETE(_request: Request, routeContext: RouteContext) {
  try {
    const access = await requireWeddingContext();
    if ("response" in access) return access.response;
    const eventId = await readEventId(routeContext);
    if (!eventId) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");

    await connectToDatabase();
    const event = await WeddingEvent.findOneAndUpdate(
      { _id: eventId, weddingId: access.context.wedding._id, archivedAt: null },
      { $set: { archivedAt: new Date() } },
      { new: true },
    ).lean();
    if (!event) return apiError(404, "EVENT_NOT_FOUND", "This event could not be found.");
    return Response.json({ success: true });
  } catch (error) {
    console.error("Wedding event could not be archived", error);
    return internalError();
  }
}
