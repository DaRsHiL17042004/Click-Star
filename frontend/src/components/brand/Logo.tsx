import { cn } from "@/lib/utils";

/** Click-Star mark: a lens ring with a four-point "shutter flash" at its centre. */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4.8" opacity="0.35" transform="rotate(8 16 16)" />
      <path d="M16 6.5C16.9 12.4 18.6 14.1 25.5 16C18.6 17.9 16.9 19.6 16 25.5C15.1 19.6 13.4 17.9 6.5 16C13.4 14.1 15.1 12.4 16 6.5Z" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)} aria-label="Click-Star">
      <LogoMark />
      <span className="font-display text-[1.375rem] font-medium leading-none tracking-tight">
        Click<span className="text-accent">·</span>Star
      </span>
    </span>
  );
}
