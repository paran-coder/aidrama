import { requireAppContext } from "@/lib/auth";

export async function getAppContext() {
  return requireAppContext();
}
