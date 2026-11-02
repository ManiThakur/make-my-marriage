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

const memberInvitationSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  email: { type: String, required: true, trim: true },
  emailNormalized: { type: String, required: true },
  relationshipNote: { type: String, trim: true, maxlength: 80, default: "" },
  role: { type: String, enum: ["ADMIN", "MANAGER"], required: true },
  tokenHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REVOKED"], required: true, default: "PENDING" },
  invitedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  acceptedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date, default: null },
}, { timestamps: true, collection: "wedding_member_invitations" });
memberInvitationSchema.index({ weddingId:  1, status: 1 });
memberInvitationSchema.index({ emailNormalized: 1 });
memberInvitationSchema.index({ expiresAt: 1 });
memberInvitationSchema.index({ weddingId: 1, emailNormalized: 1 }, { unique: true, partialFilterExpression: { status: "PENDING" } });

export const User = models.User ?? model("User", userSchema);
export const Session = models.Session ?? model("Session", sessionSchema);
export const WeddingMembership = models.WeddingMembership ?? model("WeddingMembership", membershipSchema);
export const WeddingMemberInvitation = models.WeddingMemberInvitation ?? model("WeddingMemberInvitation", memberInvitationSchema);

export type UserRecord = InferSchemaType<typeof userSchema>;
