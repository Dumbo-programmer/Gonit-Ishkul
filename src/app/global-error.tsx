"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#222222",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
            কিছু একটা ভুল হয়েছে
          </h1>
          <p style={{ fontSize: 14, color: "rgba(34,34,34,0.6)", margin: "0 0 20px" }}>
            অ্যাপ্লিকেশনটি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
          </p>
          {error.digest ? (
            <p style={{ fontSize: 11, color: "rgba(34,34,34,0.35)", margin: "0 0 20px" }}>
              Ref: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 12,
              background: "#1B4594",
              color: "#ffffff",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
