import { apiError, internalError } from "@/lib/http/api-response";
import { clearSession, getAuthContext } from "@/modules/auth/service";

export async function POST() {
  try {
    if (!(await getAuthContext())) {
      await clearSession();
      return apiError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
    }
    await clearSession();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout failed", error);
    return internalError();
  }
}
