import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { format, isAfter } from "date-fns";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LogoMark } from "@/components/brand/Logo";
import { Avatar, Button, Card, Field, Input, Select, Skeleton, Textarea, buttonClass } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useCreateBooking, usePhotographer } from "@/hooks/queries";
import { PACKAGES, SPECIALTIES, type PackageKey } from "@/lib/constants";
import { cn, errorMessage, formatINR } from "@/lib/utils";

const today = () => format(new Date(), "yyyy-MM-dd");

const schema = z.object({
  pkg: z.enum(["hourly", "event", "package"]),
  hours: z.coerce.number().int().min(1, "At least 1 hour").max(12, "Max 12 hours"),
  shootType: z.string().min(1, "Choose the kind of shoot"),
  shootDate: z.string().min(1, "Pick a date").refine((d) => d >= today(), "Date must be today or later"),
  location: z.string().trim().min(3, "Where is the shoot? e.g. “Bhiwandi, Kalyan Road”"),
  notes: z.string().max(500, "Keep notes under 500 characters").optional(),
});
type Form = z.infer<typeof schema>;

const steps = ["Package", "Date & place", "Confirm"] as const;
const stepFields: (keyof Form)[][] = [["pkg", "hours", "shootType"], ["shootDate", "location", "notes"], []];

function ShutterSuccess() {
  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="relative mx-auto grid h-24 w-24 place-items-center">
      <motion.span className="absolute inset-0 rounded-full border-2 border-accent" initial={{ scale: 0.8, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.2, repeat: 2 }} />
      <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <LogoMark size={96} />
      </motion.div>
    </motion.div>
  );
}

export default function Booking() {
  const { photographerId = "" } = useParams();
  const { user } = useAuth();
  const { data: p, isLoading } = usePhotographer(photographerId);
  const create = useCreateBooking();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema) as never,
    defaultValues: { pkg: "event", hours: 2, shootType: "", shootDate: "", location: "", notes: "" },
  });

  useEffect(() => {
    if (p?.specialties[0]) setValue("shootType", p.specialties[0]);
  }, [p, setValue]);

  const v = watch();
  const unit = p?.pricing?.[v.pkg as PackageKey] ?? 0;
  const total = v.pkg === "hourly" ? unit * (Number(v.hours) || 0) : unit;
  const upcoming = (p?.availability ?? []).map((d) => new Date(d)).filter((d) => isAfter(d, new Date())).sort((a, b) => +a - +b).slice(0, 5);

  const next = async () => {
    if (await trigger(stepFields[step] as never)) {
      setDir(1);
      setStep((s) => s + 1);
    }
  };
  const back = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  const onSubmit = (f: Form) =>
    create.mutate({
      clientId: user!.id,
      photographerId,
      shootDate: new Date(f.shootDate).toISOString(),
      shootType: f.shootType,
      location: f.location,
      price: total,
      notes: [f.pkg === "hourly" ? `${f.hours} hour session` : PACKAGES.find((x) => x.key === f.pkg)?.label, f.notes].filter(Boolean).join(" — "),
    });

  if (create.isSuccess)
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="container grid flex-1 place-items-center py-16">
          <div className="max-w-md text-center">
            <ShutterSuccess />
            <h1 className="mt-8 font-display text-xl font-medium">Request sent to {p?.name.split(" ")[0]}</h1>
            <p className="mt-3 text-muted">
              Your {v.shootType.toLowerCase()} shoot on <strong className="text-ink">{format(new Date(v.shootDate), "EEEE, d MMMM")}</strong> is pending confirmation. You'll see it update in your dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/dashboard/bookings" className={buttonClass("primary")} data-testid="link-my-bookings">View my bookings</Link>
              <Link to="/photographers" className={buttonClass("outline")}>Keep browsing</Link>
            </div>
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="container flex-1 py-10 md:py-14">
        <Link to={`/photographers/${photographerId}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h1 className="font-display text-xl font-medium">Book a shoot</h1>

            {/* progress */}
            <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Booking progress">
              {steps.map((s, i) => (
                <li key={s} aria-current={i === step ? "step" : undefined}>
                  <div className="h-1 overflow-hidden rounded-full bg-ink/[0.08]">
                    <motion.div className="h-full bg-accent" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.4 }} />
                  </div>
                  <p className={cn("mt-2 font-mono text-xs uppercase tracking-wider", i <= step ? "text-ink" : "text-faint")}>
                    0{i + 1} · {s}
                  </p>
                </li>
              ))}
            </ol>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10" noValidate>
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <>
                      <fieldset>
                        <legend className="mb-3 text-sm font-medium">Choose a package</legend>
                        <div className="grid gap-3">
                          {PACKAGES.map((pk) => {
                            const price = p?.pricing?.[pk.key];
                            const active = v.pkg === pk.key;
                            return (
                              <label
                                key={pk.key}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between gap-4 rounded-md border p-4 transition-colors",
                                  active ? "border-ink bg-surface shadow-soft" : "border-line hover:border-ink/40",
                                  !price && "pointer-events-none opacity-50",
                                )}
                              >
                                <span className="flex items-center gap-3">
                                  <input type="radio" value={pk.key} disabled={!price} {...register("pkg")} className="sr-only" data-testid={`radio-package-${pk.key}`} />
                                  <span className={cn("grid h-5 w-5 place-items-center rounded-full border", active ? "border-accent bg-accent text-accent-ink" : "border-line")}>
                                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                                  </span>
                                  <span>
                                    <span className="block text-sm font-medium">{pk.label}</span>
                                    <span className="block text-xs text-muted">{pk.blurb}</span>
                                  </span>
                                </span>
                                <span className="text-right">
                                  <span className="block font-medium tabular-nums">{price ? formatINR(price) : "Not offered"}</span>
                                  <span className="block text-xs text-muted">{pk.unit}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Type of shoot" htmlFor="shootType" error={errors.shootType?.message}>
                          <Select id="shootType" {...register("shootType")} aria-invalid={!!errors.shootType} data-testid="select-shoot-type">
                            <option value="">Select…</option>
                            {[...new Set([...(p?.specialties ?? []), ...SPECIALTIES])].map((s) => <option key={s}>{s}</option>)}
                          </Select>
                        </Field>
                        {v.pkg === "hourly" && (
                          <Field label="Hours" htmlFor="hours" error={errors.hours?.message}>
                            <Input id="hours" type="number" min={1} max={12} {...register("hours")} aria-invalid={!!errors.hours} data-testid="input-hours" />
                          </Field>
                        )}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Field label="Shoot date" htmlFor="shootDate" error={errors.shootDate?.message}>
                        <Input id="shootDate" type="date" min={today()} {...register("shootDate")} aria-invalid={!!errors.shootDate} data-testid="input-date" />
                      </Field>
                      {upcoming.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs text-muted">Quick pick from {p?.name.split(" ")[0]}'s open dates</p>
                          <div className="flex flex-wrap gap-2">
                            {upcoming.map((d) => {
                              const val = format(d, "yyyy-MM-dd");
                              return (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setValue("shootDate", val, { shouldValidate: true })}
                                  className={cn("rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors", v.shootDate === val ? "border-ink bg-ink text-bg" : "border-line hover:border-ink/40")}
                                >
                                  {format(d, "EEE d MMM")}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <Field label="Location" htmlFor="location" error={errors.location?.message} hint="Venue, area or landmark — the more specific the better.">
                        <Input id="location" placeholder="e.g. Kalyan Road banquet hall, Bhiwandi" {...register("location")} aria-invalid={!!errors.location} data-testid="input-location" />
                      </Field>
                      <Field label="Notes for the photographer (optional)" htmlFor="notes" error={errors.notes?.message}>
                        <Textarea id="notes" placeholder="Number of guests, must-have shots, timings…" {...register("notes")} data-testid="input-notes" />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <Card className="divide-y divide-line">
                      {[
                        ["Package", v.pkg === "hourly" ? `Hourly · ${v.hours} hr` : PACKAGES.find((x) => x.key === v.pkg)?.label],
                        ["Shoot", v.shootType],
                        ["Date", v.shootDate && format(new Date(v.shootDate), "EEEE, d MMMM yyyy")],
                        ["Location", v.location],
                        ...(v.notes ? [["Notes", v.notes]] : []),
                      ].map(([k, val]) => (
                        <div key={k} className="grid grid-cols-3 gap-4 px-5 py-4 text-sm">
                          <dt className="text-muted">{k}</dt>
                          <dd className="col-span-2">{val}</dd>
                        </div>
                      ))}
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              {create.isError && (
                <p role="alert" className="mt-6 rounded-md bg-danger/10 p-3 text-sm text-danger">
                  {errorMessage(create.error, "We couldn't send your request. Please try again.")}
                </p>
              )}

              <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4" /> Back</Button>
                ) : <span />}
                {step < steps.length - 1 ? (
                  <Button key="next" type="button" onClick={next} data-testid="button-next">Continue <ArrowRight className="h-4 w-4" /></Button>
                ) : (
                  <Button key="submit" type="submit" variant="secondary" loading={create.isPending} data-testid="button-confirm">Send request</Button>
                )}
              </div>
            </form>
          </section>

          {/* ------------------------------------------------- summary */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <Card className="sticky top-24 overflow-hidden">
              {isLoading || !p ? (
                <div className="space-y-3 p-6"><Skeleton className="aspect-[16/9]" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-1/3" /></div>
              ) : (
                <>
                  {(p.coverImage || p.portfolio?.[0]) && <img src={p.coverImage || p.portfolio?.[0]} alt="" className="aspect-[16/9] w-full object-cover" />}
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size={40} />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {p.location}</p>
                      </div>
                    </div>
                    <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
                      <div className="flex justify-between"><dt className="text-muted">{PACKAGES.find((x) => x.key === v.pkg)?.label}</dt><dd className="tabular-nums">{formatINR(unit)}{v.pkg === "hourly" ? ` × ${v.hours || 0}` : ""}</dd></div>
                      <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Estimated total</dt><dd className="tabular-nums" data-testid="text-total">{formatINR(total)}</dd></div>
                    </dl>
                    <p className="mt-4 text-xs text-muted">You'll only pay once {p.name.split(" ")[0]} confirms the date.</p>
                  </div>
                </>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
