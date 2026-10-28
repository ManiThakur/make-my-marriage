import { Schema, model, models } from "mongoose";

const weddingSchema = new Schema({
  brideName: { type: String, required: true, trim: true, maxlength: 80 },
  groomName: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  weddingDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  timeZone: { type: String, required: true, default: "Asia/Kolkata" },
  location: {
    formattedAddress: { type: String, trim: true },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    state: { type: String, trim: true, maxlength: 120 },
    country: { type: String, trim: true, maxlength: 120 },
  },
  website: {
    slug: { type: String, required: true, unique: true },
    theme: { type: String, default: "botanical" },
    isPublished: { type: Boolean, default: false },
    welcomeMessage: { type: String },
  },
  gallery: {
    tokenHash: { type: String, required: true, unique: true },
    isEnabled: { type: Boolean, default: false },
    guestUploadsEnabled: { type: Boolean, default: false },
  },
  livestream: { youtubeUrl: { type: String }, isEnabled: { type: Boolean, default: false } },
  createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, collection: "weddings" });

export const Wedding = models.Wedding ?? model("Wedding", weddingSchema);
