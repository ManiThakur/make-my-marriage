import { Schema, model, models } from "mongoose";
import { EVENT_TYPES } from "./types";

const eventSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: EVENT_TYPES, default: "CUSTOM" },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, default: null },
  venueName: { type: String, trim: true, maxlength: 160, default: "" },
  address: { type: String, trim: true, maxlength: 300, default: "" },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  dressCode: { type: String, trim: true, maxlength: 160, default: "" },
  coverImageObjectKey: { type: String, default: "" },
  archivedAt: { type: Date, default: null },
}, { timestamps: true, collection: "events" });

eventSchema.index({ weddingId: 1, startsAt: 1 });
eventSchema.index({ weddingId: 1, archivedAt: 1 });

export const WeddingEvent = models.WeddingEvent ?? model("WeddingEvent", eventSchema);
