import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true },
  emailNormalized: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true, collection: "users" });

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastUsedAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: "sessions" });

const membershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  role: { type: String, enum: ["ADMIN", "MANAGER"], required: true },
  joinedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true, collection: "wedding_memberships" });
membershipSchema.index({ weddingId: 1, userId: 1 }, { unique: true });

export const User = models.User ?? model("User", userSchema);
export const Session = models.Session ?? model("Session", sessionSchema);
export const WeddingMembership = models.WeddingMembership ?? model("WeddingMembership", membershipSchema);

export type UserRecord = InferSchemaType<typeof userSchema>;
