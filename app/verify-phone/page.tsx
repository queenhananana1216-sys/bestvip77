import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy URL: phone OTP is no longer used; send users home. */
export default function VerifyPhonePage() {
  redirect("/");
}
