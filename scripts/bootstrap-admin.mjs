import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const displayName = process.env.BOOTSTRAP_ADMIN_NAME || "관리자";

if (!url || !serviceRole || !email || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_ADMIN_EMAIL/ADMIN_EMAIL, or BOOTSTRAP_ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
let user;
const { data: created, error: createError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (createError) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  user = list.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw createError;
} else {
  user = created.user;
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  display_name: displayName,
  email: email.toLowerCase(),
  role: "admin",
  status: "active",
  suspended_at: null,
  suspended_by: null,
  suspension_reason: null,
}, { onConflict: "id" });
if (profileError) throw profileError;
console.log(`Admin ready: ${email}`);
