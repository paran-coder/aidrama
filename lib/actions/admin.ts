"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  const bytes = randomBytes(10);
  let body = "";
  for (let i = 0; i < 10; i += 1) body += ALPHABET[bytes[i] % ALPHABET.length];
  return `OWL-${body.slice(0, 5)}-${body.slice(5)}`;
}

export async function createInviteCodeAction() {
  const user = await requireAdmin();
  const admin = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeCode();
    const { error } = await admin.from("invite_codes").insert({ code, created_by: user.id });
    if (!error) {
      revalidatePath("/admin");
      redirect(`/admin?created=${encodeURIComponent(code)}`);
    }
  }
  redirect(`/admin?error=${encodeURIComponent("초대 코드를 발급하지 못했습니다.")}`);
}
