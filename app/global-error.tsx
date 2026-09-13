"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "sans-serif", background: "#f4f0e8" }}>
          <div style={{ maxWidth: 520, textAlign: "center", background: "#fffdf8", border: "1px solid #ddd4c5", borderRadius: 28, padding: 32 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>잠시 연결이 불안정합니다.</h1>
            <p style={{ lineHeight: 1.7, color: "#68645c" }}>새로고침하거나 아래 버튼으로 다시 시도해 주세요.</p>
            <button onClick={() => reset()} style={{ border: 0, borderRadius: 999, padding: "12px 20px", fontWeight: 800, cursor: "pointer" }}>다시 시도</button>
          </div>
        </main>
      </body>
    </html>
  );
}
