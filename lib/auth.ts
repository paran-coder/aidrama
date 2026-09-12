import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function isAdminUser(userId: string, email?: string | null) {
  if (email && process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) return true;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdminUser(user.id, user.email))) redirect("/dashboard");
  return user;
}
