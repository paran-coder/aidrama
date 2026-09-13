import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "OWL 1000 — AI Drama Challenge", template: "%s · OWL 1000" },
  description: "당신은 이미 창작자입니다. 먼저 100일, 그리고 OWL1000까지 매주 한 편을 이어가는 AI드라마 크리에이터 챌린지.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
