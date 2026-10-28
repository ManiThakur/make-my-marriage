import { apiError, internalError } from "@/lib/http/api-response";
import { getAuthContext } from "@/modules/auth/service";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return apiError(401, "UNAUTHORIZED", "Please sign in to continue.");
    return Response.json({ data: {
      user: { id: String(context.user._id), name: context.user.name, email: context.user.email },
      membership: context.membership ? { role: context.membership.role } : null,
      wedding: context.wedding ? {
        id: String(context.wedding._id),
        brideName: context.wedding.brideName,
        groomName: context.wedding.groomName,
        weddingDate: context.wedding.weddingDate,
        location: context.wedding.location,
      } : null,
    } });
  } catch (error) {
    console.error("Current user lookup failed", error);
    return internalError();
  }
}
