import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-nrn-black text-nrn-paper">
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="border border-nrn-border">
          <div className="border-b border-nrn-border px-6 py-3 flex items-center justify-between bg-nrn-surface">
            <span className="font-mono text-[11px] tracking-[0.2em] text-nrn-paper/60">NRN — STUDIO EDITION</span>
            <span className="font-mono text-[11px] text-nrn-paper/40">v0.1 • LOCAL MODE</span>
          </div>
          <div className="px-6 md:px-10 py-10 md:py-14">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl md:text-5xl leading-[0.95] tracking-tight">
                Your catalog.<br />
                <span className="text-nrn-purpleLight">Mastered.</span>
              </h1>
              <p className="mt-4 text-sm leading-6 text-nrn-paper/70 max-w-xl">
                Centralize songs, releases, ISRCs, UPCs, credits, splits, lyrics and platform IDs. Built for independent
                artists who need label-grade metadata without the label.
              </p>
              <div className="mt-8 flex gap-3">
                <Link href="/dashboard" className="bg-nrn-purple px-6 py-2.5 text-xs font-mono tracking-widest text-white border border-nrn-purple">
                  OPEN CATALOG →
                </Link>
                <Link href="/catalog" className="px-6 py-2.5 text-xs font-mono tracking-widest border border-nrn-border text-nrn-paper">
                  BROWSE TRACKS
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-nrn-border pt-6">
                {[
                  ["21", "fields per track"],
                  ["100%", "RLS isolated"],
                  ["CSV", "import / export"],
                ].map(([k, v]) => (
                  <div key={k} className="border border-nrn-border bg-nrn-surface px-4 py-3">
                    <div className="font-serif text-xl">{k}</div>
                    <div className="font-mono text-[11px] tracking-wide text-nrn-paper/50">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 border-t border-nrn-border text-sm">
            <div className="border-r border-nrn-border p-6">
              <div className="font-mono text-[11px] tracking-widest text-nrn-purpleLight">CATALOG</div>
              <div className="font-serif text-base mt-1">Every field a label demands</div>
              <p className="text-nrn-paper/60 text-xs mt-2 leading-relaxed">ISRC, UPC, BPM, key, distributor, splits, credits, lyrics, platform IDs — all validated.</p>
            </div>
            <div className="border-r border-nrn-border p-6">
              <div className="font-mono text-[11px] tracking-widest text-nrn-purpleLight">HEALTH</div>
              <div className="font-serif text-base mt-1">Know what&apos;s missing</div>
              <p className="text-nrn-paper/60 text-xs mt-2 leading-relaxed">Completeness scores and missing-metadata tracking for every track.</p>
            </div>
            <div className="p-6">
              <div className="font-mono text-[11px] tracking-widest text-nrn-purpleLight">PORTABLE</div>
              <div className="font-serif text-base mt-1">CSV in · CSV out</div>
              <p className="text-nrn-paper/60 text-xs mt-2 leading-relaxed">Import from any distributor export. Export for any platform.</p>
            </div>
          </div>
        </div>
        <p className="text-center font-mono text-[11px] text-nrn-paper/30 mt-6">
          Supabase not configured — running in local mode. See .env.example
        </p>
      </div>
    </div>
  );
}
