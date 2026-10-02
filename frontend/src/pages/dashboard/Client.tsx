import { useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNowStrict, isAfter } from "date-fns";
import { ArrowRight, Heart, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PhotographerCard, PhotographerCardSkeleton } from "@/components/photographer/PhotographerCard";
import { Button, Card, EmptyState, Field, Input, Select, Skeleton, StatusBadge, buttonClass } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useClientBookings, useClientProfile, useFavorites, useUpdateClientProfile } from "@/hooks/queries";
import { CITIES } from "@/lib/constants";
import { errorMessage, formatINR, refId, refName } from "@/lib/utils";
import { BookingList, PageHeader, Stat } from "./shared";

function Overview() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useClientBookings(user?.id);
  const { data: favs, isLoading: favLoading } = useFavorites(user?.id);
  const upcoming = (bookings ?? [])
    .filter((b) => isAfter(new Date(b.shootDate), new Date()) && b.status !== "cancelled")
    .sort((a, b) => +new Date(a.shootDate) - +new Date(b.shootDate));
  const next = upcoming[0];
  const spent = (bookings ?? []).filter((b) => b.status === "completed").reduce((a, b) => a + b.price, 0);

  return (
    <>
      <PageHeader title={`Namaste, ${user?.name.split(" ")[0]}`} description="Here's what's coming up." />

      {isLoading ? (
        <Skeleton className="h-44" />
      ) : next ? (
        <Card className="grid overflow-hidden md:grid-cols-[1fr_auto]">
          <div className="p-6 md:p-8">
            <p className="eyebrow">Next shoot · in {formatDistanceToNowStrict(new Date(next.shootDate))}</p>
            <h2 className="mt-3 font-display text-xl font-medium">{next.shootType} with {refName(next.photographerId)}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>{format(new Date(next.shootDate), "EEEE, d MMMM yyyy")}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{next.location}</span>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <StatusBadge status={next.status} />
              <span className="text-sm tabular-nums">{formatINR(next.price)}</span>
            </div>
          </div>
          <div className="flex items-end border-t border-line p-6 md:border-l md:border-t-0">
            <Link to={`/photographers/${refId(next.photographerId)}`} className={buttonClass("outline", "sm")}>View photographer</Link>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState icon={<Heart />} title="Nothing on the calendar" body="Find a photographer for your next occasion — weddings, birthdays, a new product launch." action={<Link to="/photographers" className={buttonClass("secondary")}>Find photographers</Link>} />
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Upcoming" value={upcoming.length} loading={isLoading} />
        <Stat label="Completed shoots" value={(bookings ?? []).filter((b) => b.status === "completed").length} loading={isLoading} />
        <Stat label="Spent on Click-Star" value={formatINR(spent)} loading={isLoading} />
      </div>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Saved photographers</h2>
          <Link to="/dashboard/saved" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">See all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {favLoading ? (
          <div className="grid gap-6 sm:grid-cols-3">{[0, 1, 2].map((i) => <PhotographerCardSkeleton key={i} />)}</div>
        ) : favs?.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{favs.slice(0, 3).map((p, i) => <PhotographerCard key={p._id} p={p} index={i} />)}</div>
        ) : (
          <p className="text-sm text-muted">Tap the heart on any photographer to save them here.</p>
        )}
      </section>
    </>
  );
}

function Bookings() {
  const { user } = useAuth();
  const { data, isLoading } = useClientBookings(user?.id);
  return (
    <>
      <PageHeader title="My bookings" description="Track requests, confirmations and completed shoots." action={<Link to="/photographers" className={buttonClass("outline", "sm")}>New booking</Link>} />
      <BookingList bookings={data} loading={isLoading} perspective="client" emptyAction={<Link to="/photographers" className={buttonClass("secondary")}>Find a photographer</Link>} />
    </>
  );
}

function Saved() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useFavorites(user?.id);
  return (
    <>
      <PageHeader title="Saved" description="Your shortlist of photographers." />
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-3">{[0, 1, 2].map((i) => <PhotographerCardSkeleton key={i} />)}</div>
      ) : isError ? (
        <Card><EmptyState icon={<Heart />} title="Couldn't load your shortlist" body={errorMessage(error)} /></Card>
      ) : !data?.length ? (
        <Card>
          <EmptyState icon={<Heart />} title="Your shortlist is empty" body="Save photographers while you browse and compare them side by side here." action={<Link to="/photographers" className={buttonClass("secondary")}>Start browsing</Link>} />
        </Card>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{data.map((p, i) => <PhotographerCard key={p._id} p={p} index={i} />)}</div>
      )}
    </>
  );
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[+\d\s-]{0,16}$/, "Use digits, spaces or +").optional(),
  location: z.string().optional(),
});

function Profile() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useClientProfile(user?.id);
  const update = useUpdateClientProfile(user?.id ?? "");
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", phone: "", location: "" },
  });
  useEffect(() => {
    if (data) reset({ name: data.name, email: data.email, phone: data.phone ?? "", location: data.location ?? "" });
  }, [data, reset]);

  const onSubmit = handleSubmit((v) =>
    update.mutate(v, { onSuccess: () => toast.success("Profile saved"), onError: (e) => toast.error(errorMessage(e)) }),
  );

  return (
    <>
      <PageHeader title="Profile" description="How photographers will see and contact you." />
      {isLoading ? (
        <Skeleton className="h-80 max-w-2xl" />
      ) : isError ? (
        <Card className="max-w-2xl">
          <EmptyState icon={<UserRound />} title="Profile not set up yet" body="Your client profile hasn't been created on the server. It's created automatically after your first booking." />
        </Card>
      ) : (
        <Card className="max-w-2xl p-6 md:p-8">
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
            <Field label="Full name" htmlFor="name" error={errors.name?.message}><Input id="name" {...register("name")} aria-invalid={!!errors.name} /></Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} /></Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone?.message}><Input id="phone" placeholder="+91" {...register("phone")} aria-invalid={!!errors.phone} /></Field>
            <Field label="City" htmlFor="location">
              <Select id="location" {...register("location")}>
                <option value="">Select…</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" loading={update.isPending} disabled={!isDirty} data-testid="button-save-profile">Save changes</Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}

export default function Client() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="saved" element={<Saved />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Overview />} />
    </Routes>
  );
}
