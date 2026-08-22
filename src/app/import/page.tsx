"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import { parseCsv, tracksToCsv } from "@/lib/csv";
import { getStore, setStore } from "@/lib/store";
import { Track } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export default function ImportPage() {
  const [tab, setTab] = useState<"import" | "export">("import");
  const [raw, setRaw] = useState("");
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMsg, setImportMsg] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    setTracks(getStore().tracks);
    const h = () => setTracks([...getStore().tracks]);
    window.addEventListener("nrn_store_update", h);
    return () => window.removeEventListener("nrn_store_update", h);
  }, []);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    setRaw(text);
    const res = parseCsv(text);
    setData(res.data);
    setErrors(res.errors);
    setImportMsg("");
  };

  const doImport = () => {
    if (!data.length) return;
    const store = getStore();
    const existingIsrcs = new Set(store.tracks.map((t) => (t.isrc || "").replace(/-/g, "").toUpperCase()).filter(Boolean));
    let blocked = 0;
    let added = 0;
    const newTracks: Track[] = [];
    for (const row of data) {
      if (!row.title || !row.artist) continue;
      const isrcNorm = (row.isrc || "").replace(/-/g, "").toUpperCase();
      if (isrcNorm && existingIsrcs.has(isrcNorm)) {
        blocked++;
        continue;
      }
      if (isrcNorm) existingIsrcs.add(isrcNorm);
      newTracks.push({
        id: crypto.randomUUID(),
        title: row.title,
        version: row.version || undefined,
        artist: row.artist,
        featuredArtists: row.featuredArtists || undefined,
        album: row.album || undefined,
        releaseDate: row.releaseDate || undefined,
        isrc: row.isrc || undefined,
        upc: row.upc || undefined,
        distributor: row.distributor || undefined,
        bpm: row.bpm || undefined,
        key: row.key || undefined,
        duration: row.duration || undefined,
        genre: row.genre || undefined,
        lyrics: row.lyrics || undefined,
        songwriters: row.songwriters || undefined,
        producers: row.producers || undefined,
        engineers: row.engineers || undefined,
        ownershipPct: row.ownershipPct || undefined,
        publishingPct: row.publishingPct || undefined,
        masterPct: row.masterPct || undefined,
        spotifyId: row.spotifyId || undefined,
        appleMusicId: row.appleMusicId || undefined,
        soundcloudId: row.soundcloudId || undefined,
        createdAt: new Date().toISOString(),
      } as Track);
      added++;
    }
    if (newTracks.length) {
      setStore((s) => ({ ...s, tracks: [...s.tracks, ...newTracks] }));
    }
    setImportMsg(`Imported ${added} tracks. ${blocked ? `Blocked ${blocked} duplicate ISRC(s).` : ""}`);
  };

  const download = (filtered?: Track[]) => {
    const list = filtered || tracks;
    const csv = tracksToCsv(list);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nrn-catalog-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="font-serif text-2xl">Import / Export</h1>
        <div className="flex gap-2 border-b border-nrn-border pb-2">
          <button onClick={() => setTab("import")} className={`px-4 py-1.5 text-xs font-mono tracking-widest border ${tab === "import" ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "border-nrn-border text-nrn-paper/60"}`}>Import</button>
          <button onClick={() => setTab("export")} className={`px-4 py-1.5 text-xs font-mono tracking-widest border ${tab === "export" ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "border-nrn-border text-nrn-paper/60"}`}>Export</button>
        </div>

        {tab === "import" && (
          <div className="space-y-4">
            <div className="border border-nrn-border bg-nrn-surface p-5">
              <p className="text-sm text-nrn-paper/60 mb-3">Upload a CSV exported from any distributor. Headers are auto-mapped (aliases supported). Duplicate ISRCs are blocked.</p>
              <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:bg-nrn-purple file:text-white file:border file:border-nrn-purple file:px-3 file:py-1.5 file:font-mono file:text-xs file:tracking-widest" />
              {raw && <p className="font-mono text-[11px] text-nrn-paper/40 mt-2">{raw.split("\n").length} lines • {data.length} rows parsed</p>}
            </div>

            {errors.length > 0 && (
              <div className="border border-amber-800 bg-amber-900/20 p-3">
                <div className="font-mono text-[11px] text-amber-300 mb-1">Parse warnings</div>
                {errors.map((e, i) => <div key={i} className="text-xs font-mono text-amber-200/80">{e}</div>)}
              </div>
            )}

            {data.length > 0 && (
              <div className="space-y-3">
                <div className="border border-nrn-border overflow-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="bg-nrn-charcoal font-mono text-[10px] tracking-widest text-nrn-paper/60 sticky top-0">
                      <tr>
                        {Object.keys(data[0] || {}).slice(0, 8).map((k) => <th key={k} className="text-left px-2 py-1 border-b border-nrn-border">{k}</th>)}
                        <th className="px-2 py-1">…</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-nrn-border">
                          {Object.values(row).slice(0, 8).map((v, j) => <td key={j} className="px-2 py-1 truncate max-w-[120px]">{String(v).slice(0, 40)}</td>)}
                          <td className="px-2 py-1 text-nrn-paper/30">…</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length > 20 && <div className="text-center font-mono text-[11px] text-nrn-paper/40 py-2">+{data.length - 20} more rows</div>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={doImport}>Import {data.length} rows</Button>
                  <Button variant="outline" onClick={() => { setData([]); setRaw(""); setErrors([]); setImportMsg(""); }}>Clear</Button>
                </div>
                {importMsg && <p className="text-sm font-mono text-emerald-300">{importMsg}</p>}
              </div>
            )}
          </div>
        )}

        {tab === "export" && (
          <div className="space-y-4">
            <div className="border border-nrn-border bg-nrn-surface p-5">
              <p className="text-sm text-nrn-paper/60 mb-3">Download your entire catalog or a filtered slice as CSV.</p>
              <Button onClick={() => download()}>Download All ({tracks.length} tracks)</Button>
            </div>
            <div className="border border-nrn-border bg-nrn-charcoal p-5">
              <h3 className="font-mono text-[11px] tracking-widest text-nrn-paper/60 mb-2">PER-FILTER EXPORT</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => download(tracks.filter((t) => !!t.genre))}>With genre ({tracks.filter((t) => !!t.genre).length})</Button>
                <Button size="sm" variant="outline" onClick={() => download(tracks.filter((t) => !!t.isrc))}>With ISRC ({tracks.filter((t) => !!t.isrc).length})</Button>
                <Button size="sm" variant="outline" onClick={() => download(tracks.filter((t) => !t.isrc))}>Missing ISRC ({tracks.filter((t) => !t.isrc).length})</Button>
                <Button size="sm" variant="outline" onClick={() => download(tracks.filter((t) => !t.lyrics))}>Missing Lyrics ({tracks.filter((t) => !t.lyrics).length})</Button>
              </div>
            </div>
            <pre className="border border-nrn-border bg-nrn-black p-3 text-[11px] font-mono text-nrn-paper/30 overflow-auto max-h-40">{tracksToCsv(tracks).slice(0, 600) || "—"}</pre>
          </div>
        )}
      </div>
    </Shell>
  );
}
