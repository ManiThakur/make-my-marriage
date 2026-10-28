import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { LoginForm } from "@/components/auth/auth-forms";
import { getAuthContext } from "@/modules/auth/service";

export default async function LoginPage() {
  const context = await getAuthContext();
  if (context) redirect(context.wedding ? "/dashboard" : "/wedding/setup");
  return <AuthFrame><LoginForm /></AuthFrame>;
}
