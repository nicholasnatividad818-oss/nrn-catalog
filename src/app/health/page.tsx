"use client";
import { useEffect, useState, useMemo } from "react";
import Shell from "@/components/layout/Shell";
import { getStore, healthForTrack } from "@/lib/store";
import { Track } from "@/lib/types";
import Link from "next/link";

const FILTERS = ["ISRC", "UPC", "BPM", "Key", "Duration", "Genre", "Lyrics", "Distributor", "Songwriters", "Ownership", "Platform ID"] as const;

export default function HealthPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filterMissing, setFilterMissing] = useState<string>("");

  useEffect(() => {
    setTracks(getStore().tracks);
    const h = () => setTracks([...getStore().tracks]);
    window.addEventListener("nrn_store_update", h);
    return () => window.removeEventListener("nrn_store_update", h);
  }, []);

  const enriched = useMemo(() => {
    let list = tracks.map((t) => ({ track: t, h: healthForTrack(t) }));
    list.sort((a, b) => b.h.count - a.h.count);
    if (filterMissing) list = list.filter((x) => x.h.missing.includes(filterMissing));
    return list;
  }, [tracks, filterMissing]);

  return (
    <Shell>
      <div className="space-y-4">
        <div>
          <h1 className="font-serif text-2xl">Health</h1>
          <p className="font-mono text-xs text-nrn-paper/50 mt-1">Sorted by most missing metadata first — fix the worst offenders.</p>
        </div>

        <div className="flex flex-wrap gap-2 border border-nrn-border bg-nrn-surface p-3">
          <span className="text-[11px] font-mono tracking-widest text-nrn-paper/40 py-1">FILTER:</span>
          <button onClick={() => setFilterMissing("")} className={`px-2 py-1 text-xs font-mono border ${filterMissing === "" ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "border-nrn-border text-nrn-paper/60"}`}>All</button>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilterMissing(f)} className={`px-2 py-1 text-xs font-mono border ${filterMissing === f ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "border-nrn-border text-nrn-paper/60"}`}>missing {f}</button>
          ))}
        </div>

        <div className="space-y-3">
          {enriched.map(({ track, h }) => (
            <div key={track.id} className="border border-nrn-border bg-nrn-charcoal p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-serif text-sm truncate">{track.title} <span className="text-nrn-paper/50">— {track.artist}</span></div>
                <div className="font-mono text-[11px] text-nrn-paper/40 truncate">{track.album || "—"} · ISRC: {track.isrc || "—"}</div>
                {h.count > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {h.missing.map((m) => <span key={m} className="text-[10px] font-mono px-1 py-0.5 bg-red-900/30 border border-red-800 text-red-300">{m}</span>)}
                  </div>
                ) : (
                  <span className="text-[10px] font-mono px-1 py-0.5 bg-emerald-900/30 border border-emerald-800 text-emerald-300">Complete</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24">
                  <div className="h-2 bg-nrn-black border border-nrn-border">
                    <div className={`h-full ${h.score === 100 ? "bg-emerald-500" : h.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${h.score}%` }} />
                  </div>
                  <div className="font-mono text-[11px] text-center text-nrn-paper/60 mt-1">{h.score}%</div>
                </div>
                <Link href={`/tracks/${track.id}`} className="px-3 py-1.5 text-xs font-mono tracking-widest border border-nrn-border hover:border-nrn-paper text-nrn-paper">Edit →</Link>
              </div>
            </div>
          ))}
          {enriched.length === 0 && <p className="text-sm text-nrn-paper/40 text-center py-8">No tracks match filter.</p>}
        </div>
      </div>
    </Shell>
  );
}
