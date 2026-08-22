"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import TrackForm from "@/components/catalog/TrackForm";
import { getStore, setStore, healthForTrack } from "@/lib/store";
import { Track } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TrackInput } from "@/lib/validators/track";

const tabs = ["Overview", "Lyrics", "Splits/Credits", "Audio", "Platform IDs"] as const;

export default function TrackDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [track, setTrack] = useState<Track | null>(null);
  const [active, setActive] = useState<typeof tabs[number]>("Overview");
  const [editing, setEditing] = useState(false);

  const load = () => {
    const t = getStore().tracks.find((x) => x.id === id) || null;
    setTrack(t);
  };
  useEffect(() => {
    load();
    window.addEventListener("nrn_store_update", load);
    return () => window.removeEventListener("nrn_store_update", load);
  }, [id]);

  if (!track) {
    return (
      <Shell>
        <div className="py-10 text-center">
          <p className="text-nrn-paper/60">Track not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/catalog")}>Back to Catalog</Button>
        </div>
      </Shell>
    );
  }

  const h = healthForTrack(track);

  const handleSave = (data: TrackInput) => {
    setStore((s) => ({
      ...s,
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } as Track : t)),
    }));
    setEditing(false);
    load();
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${track.title}"?`)) return;
    setStore((s) => ({
      tracks: s.tracks.filter((t) => t.id !== id),
      releases: s.releases.map((r) => ({ ...r, trackIds: r.trackIds.filter((tid) => tid !== id) })),
    }));
    router.push("/catalog");
  };

  if (editing) {
    return (
      <Shell>
        <div className="max-w-3xl">
          <h1 className="font-serif text-xl mb-4">Edit: {track.title}</h1>
          <TrackForm initialValues={track as any} onSave={handleSave} onCancel={() => setEditing(false)} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl">{track.title} {track.version ? <span className="text-nrn-paper/50 text-lg">({track.version})</span> : null}</h1>
            <p className="font-mono text-xs text-nrn-paper/60 mt-1">{track.artist} {track.featuredArtists ? `feat. ${track.featuredArtists}` : ""} {track.album ? `· ${track.album}` : ""}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] font-mono px-2 py-0.5 border ${h.score === 100 ? "bg-emerald-900/30 border-emerald-800" : "bg-amber-900/30 border-amber-800"}`}>{h.score}% · {h.count ? `${h.missing.join(", ")}` : "Complete"}</span>
              <span className="text-[11px] font-mono text-nrn-paper/40">ID: {track.id}</span>
            </div>
          </div>
          <div className="flex gap-2 self-start">
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="outline" onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-nrn-border pb-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActive(t)} className={`px-3 py-1.5 text-xs font-mono tracking-widest border whitespace-nowrap ${active === t ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "border-nrn-border text-nrn-paper/60 hover:text-nrn-paper"}`}>{t}</button>
          ))}
        </div>

        <div className="border border-nrn-border bg-nrn-surface p-5">
          {active === "Overview" && <Overview track={track} />}
          {active === "Lyrics" && <div><h3 className="font-mono text-[11px] tracking-widest text-nrn-paper/60 mb-2">LYRICS</h3><pre className="whitespace-pre-wrap text-sm leading-6 text-nrn-paper/90">{track.lyrics || "— No lyrics"}</pre></div>}
          {active === "Splits/Credits" && <Splits track={track} />}
          {active === "Audio" && <Audio track={track} />}
          {active === "Platform IDs" && <Platform track={track} />}
        </div>

        <Button variant="ghost" onClick={() => router.push("/catalog")}>← Back to catalog</Button>
      </div>
    </Shell>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-nrn-border bg-nrn-black px-3 py-2">
      <div className="font-mono text-[10px] tracking-widest text-nrn-paper/40">{label}</div>
      <div className="text-sm mt-1 break-all">{value || "—"}</div>
    </div>
  );
}

function Overview({ track }: { track: Track }) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Field label="Title" value={track.title} />
      <Field label="Version" value={track.version} />
      <Field label="Artist" value={track.artist} />
      <Field label="Featured Artists" value={track.featuredArtists} />
      <Field label="Album" value={track.album} />
      <Field label="Release Date" value={track.releaseDate} />
      <Field label="ISRC" value={track.isrc} />
      <Field label="UPC" value={track.upc} />
      <Field label="Distributor" value={track.distributor} />
      <Field label="Created" value={new Date(track.createdAt).toLocaleString()} />
      <Field label="Updated" value={track.updatedAt ? new Date(track.updatedAt).toLocaleString() : "—"} />
    </div>
  );
}
function Splits({ track }: { track: Track }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Songwriters" value={track.songwriters} />
        <Field label="Producers" value={track.producers} />
        <Field label="Engineers" value={track.engineers} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Ownership %" value={track.ownershipPct} />
        <Field label="Publishing %" value={track.publishingPct} />
        <Field label="Master %" value={track.masterPct} />
      </div>
    </div>
  );
}
function Audio({ track }: { track: Track }) {
  return (
    <div className="grid md:grid-cols-4 gap-3">
      <Field label="BPM" value={track.bpm} />
      <Field label="Key" value={track.key} />
      <Field label="Duration" value={track.duration} />
      <Field label="Genre" value={track.genre} />
    </div>
  );
}
function Platform({ track }: { track: Track }) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Field label="Spotify ID" value={track.spotifyId} />
      <Field label="Apple Music ID" value={track.appleMusicId} />
      <Field label="SoundCloud ID" value={track.soundcloudId} />
    </div>
  );
}
