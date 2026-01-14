import Script from "next/script";

export default function ChatWidgetTestPage() {
  return (
    <main className="min-h-screen px-6 pb-20 pt-12 sm:px-10">
      <section className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Widget Sandbox
          </p>
          <h1 className="font-display text-3xl font-semibold text-[color:var(--nexus-blue)] sm:text-4xl">
            Chat Widget Test Page
          </h1>
          <p className="text-base text-slate-600">
            Use this page to verify the embedded chat container works in inline
            mode and still supports the floating variant via the global embed.
          </p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Inline container
          </p>
          <div className="mt-4">
            <nexus-chat-widget
              data-api-key={process.env.NEXT_PUBLIC_CHAT_API_KEY}
              data-api-url="/api/chat"
              data-mode="inline"
              data-header="Ask SON AI"
              data-placeholder="Ask about anything UAB SoN..."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
          The floating widget loads globally via the embed script. Use the
          inline container above to test layout inside a page section.
        </div>
      </section>

      <Script src="/embed.js" strategy="afterInteractive" />
    </main>
  );
}
