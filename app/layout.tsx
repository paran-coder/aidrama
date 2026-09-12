import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "OWL 1000 — AI Drama Challenge", template: "%s · OWL 1000" },
  description: "1000일 동안 매주 한 편. AI드라마 크리에이터를 위한 초대형 꾸준함 챌린지.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
