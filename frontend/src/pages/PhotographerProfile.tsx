import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { ArrowLeft, CalendarDays, Camera, Globe, AtSign as Instagram, MapPin, MessageSquareQuote, Phone } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FavoriteButton } from "@/components/photographer/PhotographerCard";
import { Lightbox } from "@/components/photographer/Lightbox";
import { Avatar, Badge, Button, Card, EmptyState, Skeleton, Stars, buttonClass } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { usePhotographer, useRating, useReviews } from "@/hooks/queries";
import { PACKAGES } from "@/lib/constants";
import { cn, errorMessage, formatINR, refName } from "@/lib/utils";

function ProfileSkeleton() {
  return (
    <div className="container py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-12 w-2/3 max-w-lg" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="grid grid-cols-2 gap-3 lg:col-span-8">
          <Skeleton className="col-span-2 aspect-[16/10]" />
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
        </div>
        <Skeleton className="h-96 lg:col-span-4" />
      </div>
    </div>
  );
}

export default function PhotographerProfile() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: p, isLoading, isError, error } = usePhotographer(id);
  const { data: rating } = useRating(id);
  const { data: reviews, isLoading: reviewsLoading } = useReviews(id);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const gallery = useMemo(() => Array.from(new Set([...(p?.coverImage ? [p.coverImage] : []), ...(p?.portfolio ?? [])])), [p]);
  const upcoming = useMemo(
    () => (p?.availability ?? []).map((d) => new Date(d)).filter((d) => !Number.isNaN(+d) && isAfter(d, new Date())).sort((a, b) => +a - +b).slice(0, 4),
    [p],
  );
  const breakdown = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews?.filter((r) => r.rating === s).length ?? 0 }));
    return { counts, max: Math.max(1, ...counts.map((c) => c.n)) };
  }, [reviews]);

  const book = () => {
    if (!user) return navigate("/login", { state: { from: `/book/${id}` } });
    navigate(`/book/${id}`);
  };
  const canBook = !user || user.role === "client";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {isLoading ? (
          <ProfileSkeleton />
        ) : isError || !p ? (
          <div className="container">
            <EmptyState
              icon={<Camera />}
              title="This profile is out of focus"
              body={errorMessage(error, "We couldn't find that photographer. They may have paused their listing.")}
              action={<Link to="/photographers" className={buttonClass("primary")}>Browse photographers</Link>}
            />
          </div>
        ) : (
          <>
            <div className="container pt-8 md:pt-10">
              <Link to="/photographers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> All photographers
              </Link>

              <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <div className="flex items-center gap-5">
                  <Avatar name={p.name} size={72} className="hidden sm:inline-flex" />
                  <div>
                    <h1 className="font-display text-xl font-medium" data-testid="text-photographer-name">{p.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location || "Location not set"}</span>
                      {rating && rating.totalReviews > 0 && (
                        <span className="inline-flex items-center gap-2">
                          <Stars value={rating.averageRating} />
                          <span className="tabular-nums text-ink">{rating.averageRating.toFixed(1)}</span>
                          <span>({rating.totalReviews} review{rating.totalReviews > 1 ? "s" : ""})</span>
                        </span>
                      )}
                      {p.yearsExperience ? <span>{p.yearsExperience} yrs experience</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.specialties.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
              </header>
            </div>

            <div className="container grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
              {/* ------------------------------------------- gallery + about */}
              <div className="lg:col-span-8">
                {gallery.length ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        onClick={() => setLightbox(i)}
                        className={cn("group relative overflow-hidden rounded-md", i === 0 ? "col-span-2 row-span-2 aspect-[4/5] md:aspect-auto" : "aspect-square")}
                        aria-label={`Open image ${i + 1} of ${gallery.length}`}
                        data-testid={`button-gallery-${i}`}
                      >
                        <img src={src} alt="" loading={i > 2 ? "lazy" : "eager"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                        <span className="absolute bottom-2 left-2 rounded-sm bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] text-bg opacity-0 transition-opacity group-hover:opacity-100">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <EmptyState icon={<Camera />} title="Portfolio coming soon" body={`${p.name} hasn't uploaded work yet. Message them for samples.`} />
                  </Card>
                )}

                <section className="mt-14 grid gap-8 md:grid-cols-12" aria-labelledby="about">
                  <h2 id="about" className="eyebrow md:col-span-3">About</h2>
                  <div className="md:col-span-9">
                    <p className="text-lg leading-relaxed">{p.bio || "This photographer hasn't written a bio yet."}</p>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {p.instagram && <a className="inline-flex items-center gap-1.5 text-muted hover:text-ink" href={`https://instagram.com/${p.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> @{p.instagram.replace("@", "")}</a>}
                      {p.website && <a className="inline-flex items-center gap-1.5 text-muted hover:text-ink" href={p.website} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /> {p.website.replace(/^https?:\/\//, "")}</a>}
                      {p.phone && <a className="inline-flex items-center gap-1.5 text-muted hover:text-ink" href={`tel:${p.phone.replace(/\s/g, "")}`}><Phone className="h-4 w-4" /> {p.phone}</a>}
                    </div>
                  </div>
                </section>

                <section className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-12" aria-labelledby="reviews">
                  <div className="md:col-span-3">
                    <h2 id="reviews" className="eyebrow">Reviews</h2>
                    {rating && rating.totalReviews > 0 && (
                      <div className="mt-4">
                        <p className="font-display text-2xl font-medium tabular-nums">{rating.averageRating.toFixed(1)}</p>
                        <Stars value={rating.averageRating} className="mt-1" />
                        <div className="mt-5 space-y-1.5">
                          {breakdown.counts.map(({ s, n }) => (
                            <div key={s} className="flex items-center gap-2 text-xs text-muted">
                              <span className="w-3 tabular-nums">{s}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                                <div className="h-full rounded-full bg-accent" style={{ width: `${(n / breakdown.max) * 100}%` }} />
                              </div>
                              <span className="w-4 text-right tabular-nums">{n}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-9">
                    {reviewsLoading ? (
                      <div className="space-y-6">{[0, 1].map((i) => <Skeleton key={i} className="h-24" />)}</div>
                    ) : !reviews?.length ? (
                      <EmptyState icon={<MessageSquareQuote />} title="No reviews yet" body="Be the first to book and share how it went." />
                    ) : (
                      <ul className="divide-y divide-line">
                        {reviews.map((r) => (
                          <li key={r._id} className="py-6 first:pt-0" data-testid={`review-${r._id}`}>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={refName(r.clientId, "Client")} size={36} />
                                <div>
                                  <p className="text-sm font-medium">{refName(r.clientId, "Verified client")}</p>
                                  {r.createdAt && <p className="text-xs text-muted">{format(new Date(r.createdAt), "d MMM yyyy")}</p>}
                                </div>
                              </div>
                              <Stars value={r.rating} />
                            </div>
                            {r.comment && <p className="mt-3 leading-relaxed">{r.comment}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>

              {/* --------------------------------------------- booking card */}
              <aside className="lg:col-span-4">
                <Card className="sticky top-24 p-6 shadow-soft">
                  <div className="flex items-start justify-between">
                    <h2 className="font-display text-lg font-medium">Packages</h2>
                    <FavoriteButton photographer={p} className="-mr-2 -mt-2 shadow-none" />
                  </div>
                  <ul className="mt-4 divide-y divide-line">
                    {PACKAGES.map((pk) => {
                      const price = p.pricing?.[pk.key];
                      return (
                        <li key={pk.key} className="flex items-baseline justify-between gap-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{pk.label}</p>
                            <p className="text-xs text-muted">{pk.blurb}</p>
                          </div>
                          <p className="shrink-0 text-right">
                            <span className="font-medium tabular-nums">{price ? formatINR(price) : "—"}</span>
                            <span className="block text-xs text-muted">{pk.unit}</span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-4 border-t border-line pt-4">
                    <p className="eyebrow mb-3 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Next available</p>
                    {upcoming.length ? (
                      <div className="flex flex-wrap gap-2">
                        {upcoming.map((d) => (
                          <span key={+d} className="rounded-sm border border-line px-2 py-1 font-mono text-xs">{format(d, "EEE d MMM")}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Request a date — they'll confirm availability.</p>
                    )}
                  </div>

                  {canBook ? (
                    <Button variant="secondary" size="lg" className="mt-6 w-full" onClick={book} data-testid="button-book">
                      Request a booking
                    </Button>
                  ) : (
                    <p className="mt-6 rounded-md bg-ink/[0.04] p-3 text-xs text-muted">Sign in with a client account to book this photographer.</p>
                  )}
                  <p className="mt-3 text-center text-xs text-muted">No payment until the photographer confirms.</p>
                </Card>
              </aside>
            </div>
            <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} caption={p.name} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
