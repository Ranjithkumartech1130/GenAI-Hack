import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";

export default async function Page() {
  const authenticated = await isAuthenticated();
  redirect(authenticated ? "/root" : "/auth/sign-in");
}
