"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { getStore, setStore } from "@/lib/store";
import { Release, Track } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ReleaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [release, setRelease] = useState<Release | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [picker, setPicker] = useState<string>("");

  const load = () => {
    const s = getStore();
    setRelease(s.releases.find((r) => r.id === id) || null);
    setTracks(s.tracks);
  };
  useEffect(() => {
    load();
    window.addEventListener("nrn_store_update", load);
    return () => window.removeEventListener("nrn_store_update", load);
  }, [id]);

  if (!release) {
    return (
      <Shell>
        <div className="py-10 text-center">
          <p className="text-nrn-paper/60">Release not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/releases")}>Back</Button>
        </div>
      </Shell>
    );
  }

  const releaseTracks = release.trackIds.map((tid) => tracks.find((t) => t.id === tid)).filter(Boolean) as Track[];
  const available = tracks.filter((t) => !release.trackIds.includes(t.id));

  const addTrack = () => {
    if (!picker) return;
    setStore((s) => ({ ...s, releases: s.releases.map((r) => r.id === id ? { ...r, trackIds: [...r.trackIds, picker] } : r) }));
    setPicker("");
  };
  const removeTrack = (tid: string) => {
    setStore((s) => ({ ...s, releases: s.releases.map((r) => r.id === id ? { ...r, trackIds: r.trackIds.filter((x) => x !== tid) } : r) }));
  };
  const delRelease = () => {
    if (!confirm(`Delete release "${release.title}"?`)) return;
    setStore((s) => ({ ...s, releases: s.releases.filter((r) => r.id !== id) }));
    router.push("/releases");
  };

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl">{release.title}</h1>
            <p className="font-mono text-xs text-nrn-paper/60 mt-1">{release.releaseType} {release.distributor ? `· ${release.distributor}` : ""} {release.upc ? `· UPC ${release.upc}` : ""} {release.releaseDate ? `· ${release.releaseDate}` : ""}</p>
            <p className="font-mono text-[11px] text-nrn-paper/40 mt-1">{release.trackIds.length} tracks • Created {new Date(release.createdAt).toLocaleDateString()}</p>
          </div>
          <Button variant="outline" onClick={delRelease}>Delete</Button>
        </div>

        <div className="border border-nrn-border bg-nrn-surface p-5">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-3">TRACKS</h2>
          {releaseTracks.length === 0 ? <p className="text-sm text-nrn-paper/40">No tracks in this release.</p> : (
            <div className="space-y-2">
              {releaseTracks.map((t) => (
                <div key={t.id} className="flex justify-between items-center border border-nrn-border bg-nrn-black px-3 py-2">
                  <Link href={`/tracks/${t.id}`} className="text-sm hover:underline">{t.title} — <span className="text-nrn-paper/60">{t.artist}</span></Link>
                  <Button size="sm" variant="ghost" onClick={() => removeTrack(t.id)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <select value={picker} onChange={(e) => setPicker(e.target.value)} className="flex-1 bg-nrn-black border border-nrn-border px-3 py-2 text-sm text-nrn-paper">
              <option value="">Select track to add…</option>
              {available.map((t) => <option key={t.id} value={t.id}>{t.title} — {t.artist}</option>)}
            </select>
            <Button variant="outline" onClick={addTrack}>Add</Button>
          </div>
        </div>

        <Button variant="ghost" onClick={() => router.push("/releases")}>← Back to releases</Button>
      </div>
    </Shell>
  );
}
