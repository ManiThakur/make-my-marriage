import argon2 from "argon2";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connect";
import { apiError, internalError } from "@/lib/http/api-response";
import { createSession } from "@/modules/auth/service";
import { User, WeddingMembership } from "@/modules/auth/models";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Enter a valid email address and password.");
    await connectToDatabase();
    const user = await User.findOne({ emailNormalized: parsed.data.email.toLowerCase() }).select("name email passwordHash");
    if (!user || !(await argon2.verify(user.passwordHash, parsed.data.password))) {
      return apiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }
    await createSession(user.id, parsed.data.rememberMe ? 30 : 1);
    const hasWedding = Boolean(await WeddingMembership.exists({ userId: user._id }));
    return Response.json({ data: { user: { id: user.id, name: user.name, email: user.email }, hasWedding } });
  } catch (error) {
    console.error("Login failed", error);
    return internalError();
  }
}
