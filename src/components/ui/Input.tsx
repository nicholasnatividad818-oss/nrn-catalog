import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input(
  props: InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
  }
) {
  const { label, hint, className = "", ...rest } = props;
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[11px] font-mono tracking-widest text-nrn-paper/60 uppercase">
          {label}
        </label>
      )}
      <input
        {...rest}
        className={`w-full bg-nrn-surface border border-nrn-border px-3 py-2 text-sm text-nrn-paper placeholder:text-nrn-paper/30 focus:border-nrn-purple focus:outline-none ${className}`}
      />
      {hint && <p className="text-[11px] font-mono text-nrn-paper/40">{hint}</p>}
    </div>
  );
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
) {
  const { label, className = "", ...rest } = props;
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[11px] font-mono tracking-widest text-nrn-paper/60 uppercase">
          {label}
        </label>
      )}
      <textarea
        {...rest}
        className={`w-full bg-nrn-surface border border-nrn-border px-3 py-2 text-sm text-nrn-paper placeholder:text-nrn-paper/30 focus:border-nrn-purple focus:outline-none min-h-[80px] ${className}`}
      />
    </div>
  );
}

export function Select(
  props: InputHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options: string[];
  }
) {
  const { label, options, className = "", ...rest } = props as any;
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[11px] font-mono tracking-widest text-nrn-paper/60 uppercase">
          {label}
        </label>
      )}
      <select
        {...rest}
        className={`w-full bg-nrn-surface border border-nrn-border px-3 py-2 text-sm text-nrn-paper focus:border-nrn-purple focus:outline-none ${className}`}
      >
        <option value="">—</option>
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
