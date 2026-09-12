import { requireUser, isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAppContext() {
  const user = await requireUser();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id, display_name, role, created_at").eq("id", user.id).single();
  return {
    user,
    profile: profile ?? { id: user.id, display_name: user.email?.split("@")[0] ?? "참여자", role: "user", created_at: user.created_at },
    isAdmin: await isAdminUser(user.id, user.email),
  };
}
