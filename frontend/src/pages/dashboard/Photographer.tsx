import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isAfter, startOfMonth, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarPlus, ImagePlus, Images, MessageSquareQuote, Star, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge, Button, Card, Chip, EmptyState, Field, Input, Skeleton, Stars, Textarea, buttonClass } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useMyPhotographerProfile, usePhotographerBookings, useRating, useReviews, useSavePhotographerProfile } from "@/hooks/queries";
import { photographerApi } from "@/services/api";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { cn, errorMessage, formatINR, refName } from "@/lib/utils";
import type { Photographer as P } from "@/types";
import { BookingList, PageHeader, Stat } from "./shared";

/* ------------------------------------------------------------- Overview */
function Overview() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = usePhotographerBookings(user?.id);
  const { data: rating, isLoading: rLoading } = useRating(user?.id);
  const { data: profile } = useMyPhotographerProfile();

  const stats = useMemo(() => {
    const list = bookings ?? [];
    const now = new Date();
    return {
      pending: list.filter((b) => b.status === "pending"),
      upcoming: list.filter((b) => b.status === "confirmed" && isAfter(new Date(b.shootDate), now)).sort((a, b) => +new Date(a.shootDate) - +new Date(b.shootDate)),
      earned: list.filter((b) => b.status === "completed").reduce((a, b) => a + b.price, 0),
      pipeline: list.filter((b) => b.status === "confirmed" || b.status === "pending").reduce((a, b) => a + b.price, 0),
      months: Array.from({ length: 6 }).map((_, i) => {
        const m = startOfMonth(subMonths(now, 5 - i));
        const end = startOfMonth(subMonths(now, 4 - i));
        const inMonth = list.filter((b) => b.status !== "cancelled" && new Date(b.shootDate) >= m && new Date(b.shootDate) < end);
        return { month: format(m, "MMM"), revenue: inMonth.reduce((a, b) => a + b.price, 0), shoots: inMonth.length };
      }),
    };
  }, [bookings]);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const checks = [profile.bio, profile.location, profile.specialties?.length, profile.pricing?.hourly || profile.pricing?.event, profile.portfolio?.length, profile.phone || profile.instagram];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  return (
    <>
      <PageHeader title={`Good to see you, ${user?.name.split(" ")[0]}`} description="Your studio at a glance." action={<Link to={`/photographers/${user?.id}`} className={buttonClass("outline", "sm")}>View public profile</Link>} />

      {profile && completeness < 100 && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Your profile is {completeness}% complete</p>
            <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-ink/[0.08]">
              <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${completeness}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="mt-2 text-xs text-muted">Complete profiles with 6+ portfolio images get noticeably more requests.</p>
          </div>
          <Link to="/dashboard/profile" className={buttonClass("primary", "sm")}>Finish profile</Link>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New requests" value={stats.pending.length} loading={isLoading} hint="Awaiting your reply" />
        <Stat label="Upcoming shoots" value={stats.upcoming.length} loading={isLoading} />
        <Stat label="Earned" value={formatINR(stats.earned)} loading={isLoading} hint={`${formatINR(stats.pipeline)} in pipeline`} />
        <Stat
          label="Rating"
          loading={rLoading}
          value={rating?.totalReviews ? <span className="inline-flex items-center gap-2">{rating.averageRating.toFixed(1)} <Star className="h-5 w-5 fill-accent text-accent" strokeWidth={0} /></span> : "—"}
          hint={rating?.totalReviews ? `${rating.totalReviews} reviews` : "No reviews yet"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Booked revenue · last 6 months</h2>
            <span className="font-mono text-xs text-muted">INR</span>
          </div>
          <div className="h-56">
            {isLoading ? (
              <Skeleton className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.months} margin={{ left: -8, right: 4, top: 4 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--line))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--ink) / 0.04)" }}
                    contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--line))", borderRadius: 6, fontSize: 13 }}
                    formatter={(v) => [formatINR(Number(v)), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Needs your reply</h2>
            <Link to="/dashboard/bookings" className="text-xs text-muted hover:text-ink">All bookings</Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : stats.pending.length ? (
            <ul className="divide-y divide-line">
              {stats.pending.slice(0, 4).map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={refName(b.clientId)} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{refName(b.clientId, "Client")} · {b.shootType}</p>
                      <p className="text-xs text-muted">{format(new Date(b.shootDate), "d MMM")} · {formatINR(b.price)}</p>
                    </div>
                  </div>
                  <Badge tone="warning">New</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted">You're all caught up.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function Bookings() {
  const { user } = useAuth();
  const { data, isLoading } = usePhotographerBookings(user?.id);
  return (
    <>
      <PageHeader title="Bookings" description="Accept new requests and keep your calendar up to date." />
      <BookingList bookings={data} loading={isLoading} perspective="photographer" emptyAction={<Link to="/dashboard/profile" className={buttonClass("secondary")}>Complete your profile</Link>} />
    </>
  );
}

/* ------------------------------------------------------------ Portfolio */
function Portfolio() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyPhotographerProfile();
  const save = useSavePhotographerProfile();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [queue, setQueue] = useState<{ file: File; url: string }[]>([]);
  const [progress, setProgress] = useState<number | null>(null);

  const images = profile?.portfolio ?? [];
  const persist = (portfolio: string[], coverImage = profile?.coverImage) =>
    save.mutateAsync({ ...(profile ?? { name: user!.name }), portfolio, coverImage: coverImage && portfolio.includes(coverImage) ? coverImage : portfolio[0] });

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const ok = Array.from(files).filter((f) => /image\/(jpe?g|png|gif|webp)/.test(f.type) && f.size <= 10 * 1024 * 1024);
    if (ok.length < files.length) toast.error("Some files were skipped — images up to 10 MB only.");
    setQueue((q) => [...q, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, 10));
  };

  const upload = async () => {
    try {
      setProgress(0);
      const res = await photographerApi.uploadPortfolio(queue.map((q) => q.file), setProgress);
      await persist([...images, ...res.portfolioUrls]);
      setQueue([]);
      toast.success(`${res.portfolioUrls.length} image${res.portfolioUrls.length > 1 ? "s" : ""} added`);
    } catch (e) {
      toast.error(errorMessage(e, "Upload failed"));
    } finally {
      setProgress(null);
    }
  };

  return (
    <>
      <PageHeader title="Portfolio" description="Your best 6–12 images. The first one is your cover." />

      <Card
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        className={cn("border-dashed p-8 text-center transition-colors", drag && "border-accent bg-accent-soft")}
      >
        <UploadCloud className="mx-auto h-8 w-8 stroke-[1.5] text-muted" />
        <p className="mt-3 text-sm font-medium">Drag images here or <button type="button" onClick={() => input.current?.click()} className="text-accent underline underline-offset-4">browse</button></p>
        <p className="mt-1 text-xs text-muted">JPG, PNG, GIF or WebP · up to 10 MB each · max 10 per upload</p>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} data-testid="input-portfolio" />
      </Card>

      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {queue.map((q, i) => (
                <div key={q.url} className="relative">
                  <img src={q.url} alt="" className="h-20 w-20 rounded object-cover" />
                  <button onClick={() => setQueue((x) => x.filter((_, k) => k !== i))} aria-label="Remove from upload" className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-bg"><X className="h-3 w-3" /></button>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-3">
                {progress != null && <span className="font-mono text-xs tabular-nums text-muted">{progress}%</span>}
                <Button onClick={upload} loading={progress != null} data-testid="button-upload"><ImagePlus className="h-4 w-4" /> Upload {queue.length}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
        ) : !images.length ? (
          <EmptyState icon={<Images />} title="Your portfolio is empty" body="Clients decide in seconds. Upload a handful of your strongest frames to start getting booked." />
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((src, i) => {
              const isCover = (profile?.coverImage ?? images[0]) === src;
              return (
                <motion.li layout key={src} className="group relative aspect-square overflow-hidden rounded-md" data-testid={`portfolio-item-${i}`}>
                  <img src={src} alt={`Portfolio image ${i + 1}`} className="h-full w-full object-cover" />
                  {isCover && <Badge className="absolute left-2 top-2 bg-ink/80 text-bg">Cover</Badge>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    {!isCover && (
                      <button onClick={() => persist(images, src).then(() => toast.success("Cover updated"))} className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-black">Set cover</button>
                    )}
                    <button onClick={() => persist(images.filter((x) => x !== src)).then(() => toast.success("Image removed"))} aria-label="Remove image" className="grid h-7 w-7 place-items-center rounded bg-white/90 text-black">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------- Reviews */
function Reviews() {
  const { user } = useAuth();
  const { data, isLoading } = useReviews(user?.id);
  const { data: rating } = useRating(user?.id);
  return (
    <>
      <PageHeader title="Reviews" description={rating?.totalReviews ? `${rating.averageRating.toFixed(1)} average from ${rating.totalReviews} clients` : "What clients say about you."} />
      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !data?.length ? (
        <Card><EmptyState icon={<MessageSquareQuote />} title="No reviews yet" body="After you mark a shoot as completed, your client can leave a review here." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((r) => (
            <Card key={r._id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={refName(r.clientId)} size={36} />
                  <div>
                    <p className="text-sm font-medium">{refName(r.clientId, "Client")}</p>
                    {r.createdAt && <p className="text-xs text-muted">{format(new Date(r.createdAt), "d MMM yyyy")}</p>}
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-4 leading-relaxed">“{r.comment}”</p>}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------- Studio profile */
const num = z.coerce.number().min(0, "Can't be negative").max(10_000_000);
const studioSchema = z.object({
  name: z.string().trim().min(2, "Studio or display name is required"),
  bio: z.string().max(800, "Keep it under 800 characters").optional(),
  location: z.string().min(1, "Choose your base city"),
  specialties: z.array(z.string()).min(1, "Pick at least one specialty"),
  hourly: num, event: num, package: num,
  phone: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url("Include https://").or(z.literal("")).optional(),
});
type Studio = z.infer<typeof studioSchema>;

function StudioProfile() {
  const { user } = useAuth();
  const { data, isLoading } = useMyPhotographerProfile();
  const save = useSavePhotographerProfile();
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Studio>({
    resolver: zodResolver(studioSchema) as never,
    defaultValues: { name: user?.name ?? "", bio: "", location: "", specialties: [], hourly: 0, event: 0, package: 0, phone: "", instagram: "", website: "" },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name, bio: data.bio ?? "", location: data.location ?? "", specialties: data.specialties ?? [],
      hourly: data.pricing?.hourly ?? 0, event: data.pricing?.event ?? 0, package: data.pricing?.package ?? 0,
      phone: data.phone ?? "", instagram: data.instagram ?? "", website: data.website ?? "",
    });
    setDates((data.availability ?? []).map((d) => d.slice(0, 10)));
  }, [data, reset]);

  const specialties = watch("specialties");
  const bio = watch("bio") ?? "";
  const toggle = (s: string) => setValue("specialties", specialties.includes(s) ? specialties.filter((x) => x !== s) : [...specialties, s], { shouldValidate: true, shouldDirty: true });

  const onSubmit = handleSubmit((v) => {
    const body: Partial<P> = {
      ...(data ?? {}),
      name: v.name, bio: v.bio, location: v.location, specialties: v.specialties,
      pricing: { hourly: v.hourly, event: v.event, package: v.package },
      phone: v.phone, instagram: v.instagram?.replace("@", ""), website: v.website,
      availability: dates.map((d) => new Date(d).toISOString()),
    };
    save.mutate(body, { onSuccess: () => toast.success("Studio profile saved"), onError: (e) => toast.error(errorMessage(e)) });
  });

  if (isLoading) return <Skeleton className="h-[600px]" />;

  return (
    <>
      <PageHeader title="Studio profile" description="This is what clients see on your public page." />
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5 p-6">
            <h2 className="text-sm font-semibold">Basics</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Display name" htmlFor="name" error={errors.name?.message}><Input id="name" {...register("name")} aria-invalid={!!errors.name} data-testid="input-studio-name" /></Field>
              <Field label="Base city" htmlFor="location" error={errors.location?.message}>
                <select id="location" {...register("location")} aria-invalid={!!errors.location} className="h-11 w-full rounded-md border border-line bg-surface px-3.5 text-base" data-testid="select-studio-city">
                  <option value="">Select…</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Bio" htmlFor="bio" error={errors.bio?.message} hint={`${bio.length}/800 · What makes your work yours?`}>
              <Textarea id="bio" rows={5} {...register("bio")} data-testid="input-bio" />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Specialties</legend>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => <Chip key={s} active={specialties.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}
              </div>
              {errors.specialties && <p role="alert" className="mt-2 text-xs font-medium text-danger">{errors.specialties.message}</p>}
            </fieldset>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-sm font-semibold">Pricing (₹)</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Per hour" htmlFor="hourly" error={errors.hourly?.message}><Input id="hourly" type="number" min={0} step={100} {...register("hourly")} /></Field>
              <Field label="Per event" htmlFor="event" error={errors.event?.message}><Input id="event" type="number" min={0} step={500} {...register("event")} /></Field>
              <Field label="Full package" htmlFor="package" error={errors.package?.message}><Input id="package" type="number" min={0} step={1000} {...register("package")} /></Field>
            </div>
            <p className="text-xs text-muted">Leave a package at 0 to hide it from clients.</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <h2 className="text-sm font-semibold">Contact</h2>
            <Field label="Phone" htmlFor="phone"><Input id="phone" placeholder="+91" {...register("phone")} /></Field>
            <Field label="Instagram" htmlFor="instagram"><Input id="instagram" placeholder="yourhandle" {...register("instagram")} /></Field>
            <Field label="Website" htmlFor="website" error={errors.website?.message}><Input id="website" placeholder="https://" {...register("website")} /></Field>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Open dates</h2>
            <div className="mt-4 flex gap-2">
              <label htmlFor="newDate" className="sr-only">Add open date</label>
              <Input id="newDate" type="date" min={format(new Date(), "yyyy-MM-dd")} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <Button type="button" variant="outline" size="icon" aria-label="Add date" disabled={!newDate} onClick={() => { setDates((d) => [...new Set([...d, newDate])].sort()); setNewDate(""); }}>
                <CalendarPlus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {dates.length ? dates.map((d) => (
                <li key={d} className="inline-flex items-center gap-1 rounded-sm border border-line py-1 pl-2 pr-1 font-mono text-xs">
                  {format(new Date(d), "d MMM yyyy")}
                  <button type="button" onClick={() => setDates((x) => x.filter((y) => y !== d))} aria-label={`Remove ${d}`} className="grid h-5 w-5 place-items-center rounded hover:bg-ink/10"><X className="h-3 w-3" /></button>
                </li>
              )) : <li className="text-xs text-muted">No dates added — clients can still request any date.</li>}
            </ul>
          </Card>

          <Button type="submit" size="lg" className="w-full" loading={save.isPending} data-testid="button-save-studio">Save profile</Button>
        </div>
      </form>
    </>
  );
}

export default function Photographer() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="portfolio" element={<Portfolio />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="profile" element={<StudioProfile />} />
      <Route path="*" element={<Overview />} />
    </Routes>
  );
}
