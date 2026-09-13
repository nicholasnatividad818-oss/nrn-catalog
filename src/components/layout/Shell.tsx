"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { hydrateCatalog } from "@/lib/store";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/catalog", label: "Catalog", icon: "≡" },
  { href: "/releases", label: "Releases", icon: "◎" },
  { href: "/health", label: "Health", icon: "◐" },
  { href: "/import", label: "Import / Export", icon: "↕" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      if (data.user) void hydrateCatalog();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) void hydrateCatalog();
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const handleSignOut = async () => {
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-nrn-black">
      <header className="sticky top-0 z-30 border-b border-nrn-border bg-nrn-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} className="md:hidden border border-nrn-border px-2 py-1 text-xs">
              MENU
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-7 w-7 bg-nrn-purple flex items-center justify-center text-[10px] font-mono font-bold">NRN</div>
              <span className="font-serif text-[17px] tracking-wide">NRN CATALOG</span>
              <span className="hidden md:inline text-[10px] font-mono tracking-[0.2em] text-nrn-paper/60 border border-nrn-border px-1.5 py-0.5">STUDIO EDITION</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {configured ? (
              userEmail ? (
                <>
                  <span className="hidden md:inline font-mono text-[11px] text-nrn-paper/60 truncate max-w-[160px]">{userEmail}</span>
                  <button onClick={handleSignOut} className="border border-nrn-border px-3 py-1.5 text-[11px] font-mono tracking-widest hover:border-nrn-paper text-nrn-paper/70 hover:text-nrn-paper">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="border border-nrn-border px-3 py-1.5 text-[11px] font-mono tracking-widest hover:border-nrn-paper text-nrn-paper/70">Sign In</Link>
                  <Link href="/signup" className="bg-nrn-purple border border-nrn-purple px-3 py-1.5 text-[11px] font-mono tracking-widest text-white">Sign Up</Link>
                </>
              )
            ) : (
              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-nrn-paper/50">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> LOCAL MODE
              </div>
            )}
            <div className="h-7 w-7 rounded-none bg-nrn-surface border border-nrn-border hidden md:block" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] flex">
        <aside className="hidden md:block w-[220px] shrink-0 border-r border-nrn-border min-h-[calc(100vh-49px)]">
          <nav className="p-4 space-y-1">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 px-3 py-2 text-[13px] font-mono tracking-wide border ${
                    active ? "bg-nrn-paper text-nrn-black border-nrn-paper" : "text-nrn-paper/70 border-transparent hover:border-nrn-border hover:text-nrn-paper"
                  }`}
                >
                  <span className="text-[12px]">{n.icon}</span> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 mt-6 border-t border-nrn-border">
            <div className="text-[10px] font-mono tracking-widest text-nrn-paper/40 mb-2">SYSTEM</div>
            {configured ? (
              userEmail ? (
                <div className="text-xs font-mono text-nrn-paper/60 leading-relaxed">
                  Signed in as<br />
                  <span className="text-nrn-paper break-all">{userEmail}</span>
                  <br />
                  <button onClick={handleSignOut} className="mt-2 border border-nrn-border px-2 py-1 text-[11px] tracking-widest hover:border-nrn-paper">Sign Out</button>
                </div>
              ) : (
                <div className="text-xs font-mono text-nrn-paper/60 leading-relaxed">
                  <Link href="/login" className="underline decoration-nrn-purple">Sign in</Link> to secure your catalog with RLS.<br />
                  <Link href="/signup" className="underline">Create account →</Link>
                </div>
              )
            ) : (
              <div className="text-xs font-mono text-nrn-paper/60 leading-relaxed">
                Supabase not configured.<br />
                Running in local mode.<br />
                <a href="https://supabase.com" target="_blank" className="underline decoration-nrn-purple">Docs → env setup</a>
              </div>
            )}
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 w-[260px] h-full bg-nrn-black border-r border-nrn-border p-4">
              <nav className="space-y-1 mt-12">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex gap-3 px-3 py-2 text-sm font-mono border border-nrn-border">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 bg-nrn-black">
          <div className="px-4 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
