import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { User, Session, WeddingMembership } from "@/modules/auth/models";
import { Wedding } from "@/modules/weddings/model";
import { connectToDatabase } from "@/lib/db/connect";

export const SESSION_COOKIE = "mmm_session";
const DEFAULT_SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, days = DEFAULT_SESSION_DAYS) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await Session.create({ userId, tokenHash: hashToken(token), expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  try {
    if (token) {
      await connectToDatabase();
      await Session.deleteOne({ tokenHash: hashToken(token) });
    }
  } finally {
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getAuthContext() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await connectToDatabase();
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;

  const user = await User.findById(session.userId).select("name email").lean();
  if (!user) return null;
  const membership = await WeddingMembership.findOne({ userId: user._id }).lean();
  const wedding = membership ? await Wedding.findOne({ _id: membership.weddingId, deletedAt: null }).lean() : null;
  return { user, membership, wedding };
}

export function hashOpaqueToken(token: string) {
  return hashToken(token);
}
