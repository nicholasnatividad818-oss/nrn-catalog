"use client";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import Shell from "@/components/layout/Shell";
import { getStore, healthForTrack } from "@/lib/store";
import { tracksToCsv } from "@/lib/csv";
import { Track } from "@/lib/types";
import { GENRES, DISTRIBUTORS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function CatalogInner() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = searchParams.get("q") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const distributor = searchParams.get("distributor") ?? "";
  const missingOnly = searchParams.get("missingOnly") === "1" || searchParams.get("missingOnly") === "true";
  const sortBy = (searchParams.get("sortBy") as "title" | "artist" | "releaseDate" | "genre") || "title";

  const updateParams = useCallback(
    (updates: Record<string, string | boolean | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "" || value === false) {
          params.delete(key);
        } else if (value === true) {
          params.set(key, "1");
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    setTracks(getStore().tracks);
    const h = () => setTracks([...getStore().tracks]);
    window.addEventListener("nrn_store_update", h);
    return () => window.removeEventListener("nrn_store_update", h);
  }, []);

  const filtered = useMemo(() => {
    let out = [...tracks];
    if (q) {
      const qq = q.toLowerCase();
      out = out.filter((t) => [t.title, t.artist, t.album, t.isrc].some((v) => v?.toLowerCase().includes(qq)));
    }
    if (genre) out = out.filter((t) => t.genre === genre);
    if (distributor) out = out.filter((t) => t.distributor === distributor);
    if (missingOnly) out = out.filter((t) => healthForTrack(t).count > 0);
    out.sort((a, b) => {
      const av = (a as any)[sortBy] || "";
      const bv = (b as any)[sortBy] || "";
      return av.localeCompare(bv);
    });
    return out;
  }, [tracks, q, genre, distributor, missingOnly, sortBy]);

  const exportCsv = () => {
    const csv = tracksToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nrn-catalog.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = !!(q || genre || distributor || missingOnly || sortBy !== "title");

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl">Catalog <span className="font-mono text-xs text-nrn-paper/50">({filtered.length} / {tracks.length})</span></h1>
          <div className="flex gap-2">
            <Link href="/tracks/new"><Button>Add Track</Button></Link>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border border-nrn-border bg-nrn-surface p-4">
          <input value={q} onChange={(e) => updateParams({ q: e.target.value || null })} placeholder="Search title / artist / album / ISRC" className="flex-1 min-w-[180px] bg-nrn-black border border-nrn-border px-3 py-2 text-sm text-nrn-paper placeholder:text-nrn-paper/30 focus:border-nrn-purple focus:outline-none" />
          <select value={genre} onChange={(e) => updateParams({ genre: e.target.value || null })} className="bg-nrn-black border border-nrn-border px-3 py-2 text-sm text-nrn-paper">
            <option value="">All genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={distributor} onChange={(e) => updateParams({ distributor: e.target.value || null })} className="bg-nrn-black border border-nrn-border px-3 py-2 text-sm text-nrn-paper">
            <option value="">All distributors</option>
            {DISTRIBUTORS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => updateParams({ sortBy: e.target.value !== "title" ? e.target.value : null })} className="bg-nrn-black border border-nrn-border px-3 py-2 text-sm text-nrn-paper">
            <option value="title">Sort: Title</option>
            <option value="artist">Sort: Artist</option>
            <option value="releaseDate">Sort: Release Date</option>
            <option value="genre">Sort: Genre</option>
          </select>
          <label className="flex items-center gap-2 text-xs font-mono text-nrn-paper/70">
            <input type="checkbox" checked={missingOnly} onChange={(e) => updateParams({ missingOnly: e.target.checked || null })} /> Missing only
          </label>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>}
        </div>
        {hasFilters && (
          <div className="font-mono text-[11px] text-nrn-paper/40">
            Shareable URL: <span className="text-nrn-paper/60 break-all">{typeof window !== "undefined" ? window.location.href : ""}</span> · Back/forward and refresh preserve filters.
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:block border border-nrn-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-nrn-surface border-b border-nrn-border font-mono text-[11px] tracking-widest text-nrn-paper/60">
              <tr>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">Artist</th>
                <th className="text-left px-3 py-2">Genre</th>
                <th className="text-left px-3 py-2">ISRC</th>
                <th className="text-left px-3 py-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const h = healthForTrack(t);
                return (
                  <tr key={t.id} onClick={() => router.push(`/tracks/${t.id}`)} className="border-b border-nrn-border hover:bg-nrn-surface cursor-pointer">
                    <td className="px-3 py-2">{t.title}{t.version ? <span className="text-nrn-paper/40 text-xs"> ({t.version})</span> : null}</td>
                    <td className="px-3 py-2 text-nrn-paper/70">{t.artist}</td>
                    <td className="px-3 py-2 text-nrn-paper/70">{t.genre || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{t.isrc || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[11px] font-mono px-1.5 py-0.5 border ${h.score === 100 ? "bg-emerald-900/30 border-emerald-800 text-emerald-300" : h.score >= 60 ? "bg-amber-900/30 border-amber-800 text-amber-300" : "bg-red-900/30 border-red-800 text-red-300"}`}>
                        {h.score}% {h.count ? `· ${h.count} missing` : "✓"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-nrn-paper/40 text-sm">No tracks match filters.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((t) => {
            const h = healthForTrack(t);
            return (
              <div key={t.id} onClick={() => router.push(`/tracks/${t.id}`)} className="border border-nrn-border bg-nrn-surface p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-serif text-sm">{t.title}</div>
                    <div className="text-xs text-nrn-paper/60">{t.artist} {t.album ? `· ${t.album}` : ""}</div>
                  </div>
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 border shrink-0 ${h.score === 100 ? "bg-emerald-900/30 border-emerald-800" : "bg-amber-900/30 border-amber-800"}`}>{h.score}%</span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-nrn-paper/40">ISRC: {t.isrc || "—"} · Genre: {t.genre || "—"}</div>
                {h.count > 0 && <div className="mt-1 text-[11px] font-mono text-amber-300">{h.missing.join(", ")}</div>}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-nrn-paper/40 text-center py-6">No tracks match filters.</p>}
        </div>
      </div>
    </Shell>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<Shell><div className="p-6 font-mono text-sm text-nrn-paper/40">Loading catalog…</div></Shell>}>
      <CatalogInner />
    </Suspense>
  );
}
