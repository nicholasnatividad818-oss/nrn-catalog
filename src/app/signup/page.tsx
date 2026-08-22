"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpSchema, SignUpInput } from "@/lib/validators/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignUpInput) => {
    setServerError(null);
    setSuccess(null);
    if (!configured) {
      setServerError("Supabase not configured — running in local mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      setSuccess("Account created. Check your email to confirm, then sign in.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e: any) {
      setServerError(e?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nrn-black text-nrn-paper flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px] border border-nrn-border bg-nrn-surface">
        <div className="border-b border-nrn-border px-6 py-4 bg-nrn-charcoal flex justify-between items-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-nrn-paper/60">NRN — SIGN UP</span>
          <Link href="/" className="font-mono text-[11px] text-nrn-paper/40 hover:text-nrn-paper">← Home</Link>
        </div>
        <div className="px-6 py-6">
          {!configured && (
            <div className="border border-amber-800 bg-amber-900/20 px-3 py-2 mb-4">
              <p className="font-mono text-[11px] text-amber-300">Local mode: Supabase not configured. See .env.example</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input label="Email *" {...register("email")} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-[11px] font-mono text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input label="Password *" type="password" {...register("password")} placeholder="•••••••• (min 8)" autoComplete="new-password" />
              {errors.password && <p className="text-[11px] font-mono text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Input label="Confirm Password *" type="password" {...register("confirmPassword")} placeholder="••••••••" autoComplete="new-password" />
              {errors.confirmPassword && <p className="text-[11px] font-mono text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>
            {serverError && <p className="text-[11px] font-mono text-red-400 border border-red-900 bg-red-900/20 px-3 py-2">{serverError}</p>}
            {success && <p className="text-[11px] font-mono text-emerald-400 border border-emerald-800 bg-emerald-900/20 px-3 py-2">{success}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating…" : "Create Account →"}
            </Button>
          </form>
          <p className="font-mono text-xs text-nrn-paper/50 mt-4 text-center">
            Already have an account? <Link href="/login" className="text-nrn-purpleLight underline">Sign in</Link>
          </p>
          <p className="font-mono text-[11px] text-nrn-paper/30 mt-3 text-center">
            Email + password validated with Zod server-side. Supabase generates user_id; client never supplies owner ID.
          </p>
        </div>
      </div>
    </div>
  );
}
