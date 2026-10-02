import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Camera, Eye, EyeOff, Users } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/SiteHeader";
import { Button, Field, Input } from "@/components/ui";
import { isMock } from "@/config/env";
import { useAuth } from "@/context/auth";
import { cn, errorMessage } from "@/lib/utils";
import type { Role } from "@/types";

const img = (n: string) => `${import.meta.env.BASE_URL}img/${n}.webp`;

function AuthShell({ children, image, caption }: { children: ReactNode; image: string; caption: string }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" aria-label="Click-Star home"><Logo /></Link>
          <ThemeToggle />
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 md:px-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
            {children}
          </motion.div>
        </main>
      </div>
      <div className="relative hidden overflow-hidden bg-[#15120e] lg:block">
        <img src={image} alt="" className="grain absolute inset-0 h-full w-full bg-[#15120e] object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <p className="absolute bottom-8 left-8 right-8 font-display text-lg italic text-[#f3eee4]">{caption}</p>
      </div>
    </div>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);
  const { invalid, ...rest } = props;
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} aria-invalid={invalid} className="pr-12" {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ Login */
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const demoAccounts = [
  { label: "Client", email: "client@clickstar.in" },
  { label: "Photographer", email: "photographer@clickstar.in" },
  { label: "Admin", email: "admin@clickstar.in" },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate(from, { replace: true });
    } catch (e) {
      setError(errorMessage(e, "We couldn't sign you in. Check your details and try again."));
    }
  });

  return (
    <AuthShell image={img("pf-wedding")} caption="“Every wedding is a hundred tiny stories. My job is to notice them.” — Rajesh, Mumbai">
      <h1 className="font-display text-xl font-medium">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in to manage bookings, favourites and reviews.</p>

      {isMock && (
        <div className="mt-6 rounded-md border border-dashed border-line p-3">
          <p className="text-xs text-muted">Demo accounts · password <span className="font-mono text-ink">demo1234</span></p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoAccounts.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setValue("email", a.email);
                  setValue("password", "demo1234");
                }}
                className="rounded-sm border border-line px-2 py-1 text-xs hover:border-ink/40"
                data-testid={`button-demo-${a.label.toLowerCase()}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} data-testid="input-email" />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" {...register("password")} invalid={!!errors.password} data-testid="input-password" />
        </Field>
        {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger" data-testid="text-login-error">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} data-testid="button-login">Sign in</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New to Click-Star? <Link to="/register" className="font-medium text-ink underline underline-offset-4 hover:text-accent">Create an account</Link>
      </p>
    </AuthShell>
  );
}

/* --------------------------------------------------------------- Register */
const registerSchema = z
  .object({
    role: z.enum(["client", "photographer"]),
    name: z.string().trim().min(2, "Tell us your name"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

export function Register() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const initialRole: Role = params.get("role") === "photographer" ? "photographer" : "client";
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole as "client" | "photographer", name: "", email: "", password: "", confirm: "" },
  });
  const role = watch("role");

  const onSubmit = handleSubmit(async ({ name, email, password, role }) => {
    setError(null);
    try {
      await signUp({ name, email, password, role });
      toast.success("Account created");
      navigate(role === "photographer" ? "/dashboard/profile" : "/photographers", { replace: true });
    } catch (e) {
      setError(errorMessage(e, "We couldn't create your account. Please try again."));
    }
  });

  const roles = [
    { key: "client" as const, icon: Users, title: "I'm hiring", body: "Find & book photographers" },
    { key: "photographer" as const, icon: Camera, title: "I'm a photographer", body: "Get discovered & booked" },
  ];

  return (
    <AuthShell
      image={img(role === "photographer" ? "about-photographer" : "pf-maternity")}
      caption={role === "photographer" ? "Your portfolio, your prices, your calendar — in one place." : "Find someone who sees your story the way you do."}
    >
      <h1 className="font-display text-xl font-medium">Create your account</h1>
      <p className="mt-2 text-sm text-muted">It takes less than a minute.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <fieldset>
          <legend className="sr-only">Account type</legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setValue("role", r.key)}
                aria-pressed={role === r.key}
                className={cn("rounded-md border p-3 text-left transition-colors", role === r.key ? "border-ink bg-surface shadow-soft" : "border-line hover:border-ink/40")}
                data-testid={`button-role-${r.key}`}
              >
                <r.icon className={cn("h-4 w-4", role === r.key ? "text-accent" : "text-muted")} />
                <span className="mt-2 block text-sm font-medium">{r.title}</span>
                <span className="block text-xs text-muted">{r.body}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} data-testid="input-name" />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} data-testid="input-email" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput id="password" autoComplete="new-password" {...register("password")} invalid={!!errors.password} data-testid="input-password" />
          </Field>
          <Field label="Confirm" htmlFor="confirm" error={errors.confirm?.message}>
            <PasswordInput id="confirm" autoComplete="new-password" {...register("confirm")} invalid={!!errors.confirm} data-testid="input-confirm" />
          </Field>
        </div>
        {error && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} data-testid="button-register">
          {role === "photographer" ? "Create studio account" : "Create account"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">Sign in</Link>
      </p>
    </AuthShell>
  );
}
