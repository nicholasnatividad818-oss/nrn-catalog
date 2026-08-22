"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { getStore, healthForTrack } from "@/lib/store";
import { Track, Release } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    const s = getStore();
    setTracks(s.tracks);
    setReleases(s.releases);
    const h = () => {
      const ns = getStore();
      setTracks([...ns.tracks]);
      setReleases([...ns.releases]);
    };
    window.addEventListener("nrn_store_update", h);
    return () => window.removeEventListener("nrn_store_update", h);
  }, []);

  const missingCount = tracks.filter((t) => healthForTrack(t).count > 0).length;
  const avg = tracks.length ? Math.round(tracks.reduce((a, t) => a + healthForTrack(t).score, 0) / tracks.length) : 0;
  const recentTracks = [...tracks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);
  const recentReleases = [...releases].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 2);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl">Dashboard</h1>
          <p className="font-mono text-xs text-nrn-paper/50 mt-1">Local mode • {tracks.length} tracks in catalog</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total Tracks" value={String(tracks.length)} />
          <Stat label="Releases" value={String(releases.length)} />
          <Stat label="Needs Metadata" value={String(missingCount)} sub={`${tracks.length - missingCount} complete`} />
          <Stat label="Completeness Avg" value={`${avg}%`} />
        </div>

        <div className="border border-nrn-border bg-nrn-surface p-5">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-3">HEALTH SUMMARY</h2>
          {tracks.length === 0 ? (
            <p className="text-sm text-nrn-paper/50">No tracks yet.</p>
          ) : (
            <div className="space-y-3">
              {tracks.slice(0, 5).map((t) => {
                const h = healthForTrack(t);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-40 truncate">{t.title}</span>
                    <div className="flex-1 h-2 bg-nrn-black border border-nrn-border">
                      <div className="h-full bg-nrn-purple" style={{ width: `${h.score}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-nrn-paper/60 w-10 text-right">{h.score}%</span>
                    {h.count > 0 && <span className="text-[10px] font-mono bg-amber-900/40 border border-amber-800 px-1.5 py-0.5">{h.count} missing</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-nrn-border bg-nrn-charcoal p-5">
            <h2 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-3">RECENT TRACKS</h2>
            <div className="space-y-2">
              {recentTracks.map((t) => (
                <Link key={t.id} href={`/tracks/${t.id}`} className="flex justify-between items-center border border-nrn-border bg-nrn-surface px-3 py-2 hover:border-nrn-purple">
                  <span className="text-sm truncate">{t.title} — <span className="text-nrn-paper/60">{t.artist}</span></span>
                  <span className="text-[11px] font-mono text-nrn-paper/40">{new Date(t.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
              {recentTracks.length === 0 && <p className="text-xs text-nrn-paper/40">No tracks</p>}
            </div>
            <Link href="/catalog" className="inline-block mt-3 text-[11px] font-mono text-nrn-purpleLight underline">View all →</Link>
          </div>
          <div className="border border-nrn-border bg-nrn-charcoal p-5">
            <h2 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-3">RECENT RELEASES</h2>
            <div className="space-y-2">
              {recentReleases.map((r) => (
                <Link key={r.id} href={`/releases/${r.id}`} className="flex justify-between items-center border border-nrn-border bg-nrn-surface px-3 py-2 hover:border-nrn-purple">
                  <span className="text-sm">{r.title} <span className="text-[11px] font-mono text-nrn-paper/40">({r.releaseType})</span></span>
                  <span className="text-[11px] font-mono text-nrn-paper/40">{r.trackIds.length} tracks</span>
                </Link>
              ))}
              {recentReleases.length === 0 && <p className="text-xs text-nrn-paper/40">No releases</p>}
            </div>
            <Link href="/releases" className="inline-block mt-3 text-[11px] font-mono text-nrn-purpleLight underline">View all →</Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-nrn-border bg-nrn-surface p-4">
      <div className="font-mono text-[10px] tracking-[0.15em] text-nrn-paper/50">{label}</div>
      <div className="font-serif text-2xl mt-1">{value}</div>
      {sub && <div className="font-mono text-[11px] text-nrn-paper/40 mt-1">{sub}</div>}
    </div>
  );
}
