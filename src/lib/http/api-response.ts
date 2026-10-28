export function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export function internalError() {
  return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
