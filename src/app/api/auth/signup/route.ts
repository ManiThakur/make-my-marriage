import argon2 from "argon2";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connect";
import { apiError, internalError } from "@/lib/http/api-response";
import { createSession } from "@/modules/auth/service";
import { Session, User } from "@/modules/auth/models";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  let createdUserId: string | undefined;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Enter your name, a valid email, and a password with at least 8 characters.");
    await connectToDatabase();
    const emailNormalized = parsed.data.email.toLowerCase();
    if (await User.exists({ emailNormalized })) return apiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists. Try signing in.");

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.trim(),
      emailNormalized,
      passwordHash: await argon2.hash(parsed.data.password),
    });
    createdUserId = user.id;
    await createSession(user.id);
    return Response.json({ data: { user: { id: user.id, name: user.name, email: user.email }, hasWedding: false } }, { status: 201 });
  } catch (error) {
    if (createdUserId) {
      await Promise.allSettled([Session.deleteMany({ userId: createdUserId }), User.deleteOne({ _id: createdUserId })]);
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return apiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists. Try signing in.");
    }
    console.error("Signup failed", error);
    return internalError();
  }
}
