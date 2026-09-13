"use client";
import Shell from "@/components/layout/Shell";
import TrackForm from "@/components/catalog/TrackForm";
import { TrackInput } from "@/lib/validators/track";
import { setStore } from "@/lib/store";
import { Track } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NewTrackPage() {
  const router = useRouter();
  const onSave = (data: TrackInput) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const track: Track = { id, createdAt: now, updatedAt: now, ...data };
    setStore((s) => ({
      ...s,
      tracks: [...s.tracks, track],
    }));
    router.push("/catalog");
  };
  return (
    <Shell>
      <div className="max-w-3xl">
        <h1 className="font-serif text-2xl mb-1">New Track</h1>
        <p className="font-mono text-xs text-nrn-paper/50 mb-6">Add a new track to your catalog — all fields optional except title & artist.</p>
        <TrackForm onSave={onSave} onCancel={() => router.push("/catalog")} />
      </div>
    </Shell>
  );
}
