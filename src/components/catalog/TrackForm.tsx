"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackSchema, TrackInput, isrcExists } from "@/lib/validators/track";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { GENRES, KEYS, DISTRIBUTORS, Track } from "@/lib/types";
import { getStore } from "@/lib/store";

type Props = {
  initialValues?: Partial<Track & TrackInput>;
  onSave: (data: TrackInput) => void;
  onCancel?: () => void;
};

export default function TrackForm({ initialValues, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<TrackInput>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      title: initialValues?.title || "",
      version: initialValues?.version || "",
      artist: initialValues?.artist || "",
      featuredArtists: initialValues?.featuredArtists || "",
      album: initialValues?.album || "",
      releaseDate: initialValues?.releaseDate || "",
      isrc: initialValues?.isrc || "",
      upc: initialValues?.upc || "",
      distributor: initialValues?.distributor || "",
      bpm: initialValues?.bpm || "",
      key: initialValues?.key || "",
      duration: initialValues?.duration || "",
      genre: initialValues?.genre || "",
      lyrics: initialValues?.lyrics || "",
      songwriters: initialValues?.songwriters || "",
      producers: initialValues?.producers || "",
      engineers: initialValues?.engineers || "",
      ownershipPct: initialValues?.ownershipPct || "",
      publishingPct: initialValues?.publishingPct || "",
      masterPct: initialValues?.masterPct || "",
      spotifyId: initialValues?.spotifyId || "",
      appleMusicId: initialValues?.appleMusicId || "",
      soundcloudId: initialValues?.soundcloudId || "",
    },
  });

  const submit = (data: TrackInput) => {
    if (data.isrc && isrcExists(getStore().tracks, data.isrc, (initialValues as any)?.id)) {
      setError("isrc", { message: "ISRC already exists in catalog" });
      return;
    }
    onSave(data);
  };

  const err = (name: keyof TrackInput) => errors[name]?.message as string | undefined;
  const FieldErr = ({ msg }: { msg?: string }) => (msg ? <p className="text-[11px] font-mono text-red-400 mt-1">{msg}</p> : null);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* Identity */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">IDENTITY</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input label="Title *" {...register("title")} placeholder="Track title" />
            <FieldErr msg={err("title")} />
          </div>
          <div>
            <Input label="Version" {...register("version")} placeholder="e.g. Remastered, Acoustic" />
            <FieldErr msg={err("version")} />
          </div>
          <div>
            <Input label="Artist *" {...register("artist")} placeholder="Primary artist" />
            <FieldErr msg={err("artist")} />
          </div>
          <div>
            <Input label="Featured Artists" {...register("featuredArtists")} placeholder="Comma separated" />
            <FieldErr msg={err("featuredArtists")} />
          </div>
          <div>
            <Input label="Album" {...register("album")} placeholder="Album / EP name" />
            <FieldErr msg={err("album")} />
          </div>
          <div>
            <Input label="Release Date" type="date" {...register("releaseDate")} />
            <FieldErr msg={err("releaseDate")} />
          </div>
        </div>
      </section>

      {/* Codes */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">CODES</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Input label="ISRC" {...register("isrc")} placeholder="USABC2400001" />
            <FieldErr msg={err("isrc")} />
          </div>
          <div>
            <Input label="UPC" {...register("upc")} placeholder="12-13 digits" />
            <FieldErr msg={err("upc")} />
          </div>
          <div>
            <Select label="Distributor" options={DISTRIBUTORS} {...register("distributor")} />
            <FieldErr msg={err("distributor")} />
          </div>
        </div>
      </section>

      {/* Audio */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">AUDIO</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Input label="BPM" {...register("bpm")} placeholder="96" />
            <FieldErr msg={err("bpm")} />
          </div>
          <div>
            <Select label="Key" options={KEYS} {...register("key")} />
            <FieldErr msg={err("key")} />
          </div>
          <div>
            <Input label="Duration" {...register("duration")} placeholder="3:42" />
            <FieldErr msg={err("duration")} />
          </div>
          <div>
            <Select label="Genre" options={GENRES} {...register("genre")} />
            <FieldErr msg={err("genre")} />
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">CREDITS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Input label="Songwriters" {...register("songwriters")} placeholder="Names comma separated" />
            <FieldErr msg={err("songwriters")} />
          </div>
          <div>
            <Input label="Producers" {...register("producers")} placeholder="Names comma separated" />
            <FieldErr msg={err("producers")} />
          </div>
          <div>
            <Input label="Engineers" {...register("engineers")} placeholder="Names comma separated" />
            <FieldErr msg={err("engineers")} />
          </div>
        </div>
      </section>

      {/* Splits */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">SPLITS (%)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Input label="Ownership %" {...register("ownershipPct")} placeholder="60" />
            <FieldErr msg={err("ownershipPct")} />
          </div>
          <div>
            <Input label="Publishing %" {...register("publishingPct")} placeholder="50" />
            <FieldErr msg={err("publishingPct")} />
          </div>
          <div>
            <Input label="Master %" {...register("masterPct")} placeholder="70" />
            <FieldErr msg={err("masterPct")} />
          </div>
        </div>
      </section>

      {/* Lyrics */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">LYRICS</h3>
        <Textarea label="Lyrics" {...register("lyrics")} placeholder="Paste lyrics..." rows={6} />
        <FieldErr msg={err("lyrics")} />
      </section>

      {/* Platform IDs */}
      <section className="border border-nrn-border bg-nrn-surface p-5">
        <h3 className="font-mono text-[11px] tracking-[0.18em] text-nrn-paper/60 mb-4">PLATFORM IDS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Input label="Spotify ID" {...register("spotifyId")} placeholder="3z8h0TU" />
            <FieldErr msg={err("spotifyId")} />
          </div>
          <div>
            <Input label="Apple Music ID" {...register("appleMusicId")} placeholder="123456789" />
            <FieldErr msg={err("appleMusicId")} />
          </div>
          <div>
            <Input label="SoundCloud ID" {...register("soundcloudId")} placeholder="nrn-midnight-signals" />
            <FieldErr msg={err("soundcloudId")} />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit">{initialValues?.title ? "Save Changes" : "Create Track"}</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
