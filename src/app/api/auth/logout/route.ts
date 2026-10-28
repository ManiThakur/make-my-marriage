import { apiError, internalError } from "@/lib/http/api-response";
import { clearSession } from "@/modules/auth/service";

export async function POST() {
  try {
    await clearSession();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout failed", error);
    return internalError();
  }
}
