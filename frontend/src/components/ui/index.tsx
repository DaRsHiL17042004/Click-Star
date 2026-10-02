import {
  forwardRef, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Star, X } from "lucide-react";
import { cn, hueFrom, initials } from "@/lib/utils";
import type { BookingStatus, LeadStatus } from "@/types";

/* ------------------------------------------------------------------ Button */
type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-ink/90",
  secondary: "bg-accent text-accent-ink hover:bg-accent/90",
  outline: "border border-ink/20 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/[0.03]",
  ghost: "bg-transparent text-ink hover:bg-ink/[0.06]",
  danger: "bg-danger text-white hover:bg-danger/90",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-sm gap-2",
  icon: "h-10 w-10 justify-center",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/* ------------------------------------------------------------------ Inputs */
const fieldBase =
  "w-full rounded-md border border-line bg-surface px-3.5 text-base text-ink placeholder:text-faint transition-colors focus:border-ink/60 focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60 aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-11", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[112px] py-3 leading-relaxed", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select
    ref={ref}
    className={cn(
      fieldBase,
      "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10",
      "bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")]",
      className,
    )}
    {...p}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({
  label, error, hint, children, className, htmlFor,
}: { label: string; error?: string; hint?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ Display */
export function Badge({ className, tone = "neutral", ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-ink/[0.06] text-ink",
    accent: "bg-accent-soft text-accent",
    success: "bg-success/[0.12] text-success",
    warning: "bg-warning/[0.12] text-warning",
    danger: "bg-danger/[0.12] text-danger",
  } as const;
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)} {...p} />;
}

const statusTone: Record<BookingStatus | LeadStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  pending: "warning",
  confirmed: "accent",
  assigned: "accent",
  completed: "success",
  cancelled: "danger",
};

export function StatusBadge({ status }: { status: BookingStatus | LeadStatus }) {
  return (
    <Badge tone={statusTone[status]} data-testid={`status-${status}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status[0]!.toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border border-line bg-surface", className)} {...p} />
);

export const Skeleton = ({ className }: { className?: string }) => <div className={cn("skeleton", className)} aria-hidden />;

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-5 text-faint [&_svg]:h-10 [&_svg]:w-10 [&_svg]:stroke-[1.25]"
      >
        {icon}
      </motion.div>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-[38ch] text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const hue = hueFrom(name);
  if (src && !failed)
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-medium", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 30% 85%)`, color: `hsl(${hue} 40% 22%)` }}
    >
      {initials(name)}
    </span>
  );
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-line" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-accent" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Great", "Outstanding"];
  const shown = hover || value;
  return (
    <div className="flex items-center gap-4">
      <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            data-testid={`button-star-${i}`}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: shown >= i ? 1.06 : 1 }}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="grid h-11 w-11 place-items-center rounded-md"
          >
            <Star className={cn("h-8 w-8 transition-colors", shown >= i ? "text-accent" : "text-line")} fill="currentColor" strokeWidth={0} />
          </motion.button>
        ))}
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-muted" aria-live="polite">
        {labels[shown]}
      </span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted", className)} aria-label="Loading" />;
}

/* ------------------------------------------------------------------ Dialog */
export function Dialog({
  open, onClose, title, description, children, className,
}: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; className?: string }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => panel.current?.querySelector<HTMLElement>("input,textarea,select,button")?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            className={cn("relative max-h-[90dvh] w-full overflow-y-auto rounded-t-xl border border-line bg-surface p-6 shadow-lift sm:max-w-lg sm:rounded-xl", className)}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id={id} className="font-display text-lg font-medium">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ Chip */
export function Chip({ active, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors",
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink/40",
        className,
      )}
      {...p}
    />
  );
}
