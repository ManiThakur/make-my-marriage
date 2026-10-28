import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SignupForm } from "@/components/auth/auth-forms";
import { getAuthContext } from "@/modules/auth/service";

export default async function SignupPage() {
  const context = await getAuthContext();
  if (context) redirect(context.wedding ? "/dashboard" : "/wedding/setup");
  return <AuthFrame><SignupForm /></AuthFrame>;
}
