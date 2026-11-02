import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SignupForm } from "@/components/auth/auth-forms";
import { getAuthContext } from "@/modules/auth/service";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const query = await searchParams;
  const candidate = typeof query.returnTo === "string" ? query.returnTo : "";
  const returnTo = /^\/member-invitations\/[A-Za-z0-9_-]{40,50}$/.test(candidate) ? candidate : undefined;
  const context = await getAuthContext();
  if (context) redirect(returnTo || (context.wedding ? "/dashboard" : "/wedding/setup"));
  return <AuthFrame><SignupForm returnTo={returnTo} /></AuthFrame>;
}
