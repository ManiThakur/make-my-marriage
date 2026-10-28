import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/auth-frame";
import { WeddingSetupForm } from "@/components/auth/wedding-setup-form";
import { getAuthContext } from "@/modules/auth/service";

export default async function WeddingSetupPage() {
  const context = await getAuthContext();
  if (!context) redirect("/signup");
  if (context.wedding) redirect("/dashboard");
  return <AuthFrame><WeddingSetupForm /></AuthFrame>;
}
