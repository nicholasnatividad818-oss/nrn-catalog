import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline"; size?: "sm" | "md" };

export function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
  const base = "font-mono text-xs tracking-widest uppercase border transition-colors disabled:opacity-40";
  const sizes = size === "sm" ? "px-3 py-1.5" : "px-4 py-2";
  const variants =
    variant === "primary"
      ? "bg-nrn-purple text-white border-nrn-purple hover:bg-nrn-purpleMuted"
      : variant === "outline"
      ? "bg-transparent text-nrn-paper border-nrn-border hover:border-nrn-paper"
      : "bg-transparent text-nrn-paper/70 border-transparent hover:text-nrn-paper";
  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props} />;
}
