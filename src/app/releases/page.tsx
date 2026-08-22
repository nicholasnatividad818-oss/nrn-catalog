"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { getStore, setStore } from "@/lib/store";
import { Release, Track } from "@/lib/types";
import { DISTRIBUTORS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Link from "next/link";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Release["releaseType"]>("single");
  const [upc, setUpc] = useState("");
  const [distributor, setDistributor] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const load = () => {
    const s = getStore();
    setReleases(s.releases);
    setTracks(s.tracks);
  };
  useEffect(() => {
    load();
    window.addEventListener("nrn_store_update", load);
    return () => window.removeEventListener("nrn_store_update", load);
  }, []);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title required");
    const rel: Release = {
      id: crypto.randomUUID(),
      title,
      releaseType: type,
      upc: upc || undefined,
      distributor: distributor || undefined,
      releaseDate: releaseDate || undefined,
      trackIds: selected,
      createdAt: new Date().toISOString(),
    };
    setStore((s) => ({ ...s, releases: [...s.releases, rel] }));
    setTitle(""); setUpc(""); setDistributor(""); setReleaseDate(""); setSelected([]);
    setType("single");
  };

  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Releases <span className="font-mono text-xs text-nrn-paper/50">({releases.length})</span></h1>

        <div className="border border-nrn-border bg-nrn-surface p-5 space-y-3">
          {releases.length === 0 ? <p className="text-sm text-nrn-paper/40">No releases yet.</p> : releases.map((r) => (
            <Link key={r.id} href={`/releases/${r.id}`} className="flex justify-between items-center border border-nrn-border bg-nrn-black px-4 py-3 hover:border-nrn-purple">
              <div>
                <div className="font-serif text-sm">{r.title} <span className="font-mono text-[11px] text-nrn-paper/40">({r.releaseType})</span></div>
                <div className="font-mono text-[11px] text-nrn-paper/40">{r.distributor || "—"} {r.releaseDate ? `· ${r.releaseDate}` : ""}</div>
              </div>
              <span className="text-xs font-mono bg-nrn-purple text-white px-2 py-1">{r.trackIds.length} tracks</span>
            </Link>
          ))}
        </div>

        <form onSubmit={create} className="border border-nrn-border bg-nrn-charcoal p-5 space-y-4">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60">CREATE RELEASE</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Release title" />
            <div className="space-y-1">
              <label className="text-[11px] font-mono tracking-widest text-nrn-paper/60 uppercase">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-nrn-surface border border-nrn-border px-3 py-2 text-sm text-nrn-paper">
                <option value="single">single</option>
                <option value="ep">ep</option>
                <option value="album">album</option>
                <option value="compilation">compilation</option>
              </select>
            </div>
            <Input label="UPC" value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="12-13 digits" />
            <Select label="Distributor" options={DISTRIBUTORS} value={distributor} onChange={(e: any) => setDistributor(e.target.value)} />
            <Input label="Release Date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-nrn-paper/60 uppercase mb-2">Tracks (multiselect)</div>
            <div className="max-h-48 overflow-auto border border-nrn-border bg-nrn-black p-2 space-y-1">
              {tracks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-nrn-surface cursor-pointer">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />
                  <span className="truncate">{t.title} — {t.artist}</span>
                  <span className="ml-auto font-mono text-[11px] text-nrn-paper/40">{t.isrc || "no ISRC"}</span>
                </label>
              ))}
              {tracks.length === 0 && <p className="text-xs text-nrn-paper/40 p-2">No tracks available</p>}
            </div>
            {selected.length > 0 && <p className="font-mono text-[11px] text-nrn-paper/40 mt-1">{selected.length} selected</p>}
          </div>
          <Button type="submit">Create Release</Button>
        </form>
      </div>
    </Shell>
  );
}
