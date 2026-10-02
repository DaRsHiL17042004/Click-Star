import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Heart, MapPin, Star } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useFavorites, useRating, useToggleFavorite } from "@/hooks/queries";
import { cn, formatINR, startingPrice } from "@/lib/utils";
import type { Photographer } from "@/types";
import { Skeleton } from "@/components/ui";

export function FavoriteButton({ photographer, className }: { photographer: Photographer; className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isClient = user?.role === "client";
  const { data: favs } = useFavorites(isClient ? user?.id : undefined);
  const toggle = useToggleFavorite(user?.id);
  const on = !!favs?.some((f) => f._id === photographer._id);
  if (user && !isClient) return null;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate("/login", { state: { from: `/photographers/${photographer._id}` } });
        toggle.mutate({ photographer, on: !on });
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${photographer.name} from saved` : `Save ${photographer.name}`}
      data-testid={`button-favorite-${photographer._id}`}
      className={cn("grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-ink shadow-soft backdrop-blur transition-colors hover:bg-surface", className)}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart className={cn("h-[18px] w-[18px]", on && "fill-accent text-accent")} />
      </motion.span>
    </motion.button>
  );
}

export function RatingInline({ id, className }: { id: string; className?: string }) {
  const { data, isLoading } = useRating(id);
  if (isLoading) return <Skeleton className="h-4 w-14" />;
  if (!data?.totalReviews) return <span className={cn("text-xs text-muted", className)}>New</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
      <span className="font-medium tabular-nums">{data.averageRating.toFixed(1)}</span>
      <span className="text-muted">({data.totalReviews})</span>
    </span>
  );
}

export function PhotographerCard({ p, index = 0 }: { p: Photographer; index?: number }) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const cover = p.coverImage || p.portfolio?.[0];
  const from = startingPrice(p.pricing);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
      data-testid={`card-photographer-${p._id}`}
    >
      <Link to={`/photographers/${p._id}`} className="block focus-visible:outline-offset-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2">
          {cover && !broken ? (
            <img
              src={cover}
              alt={`Sample work by ${p.name}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setBroken(true)}
              className={cn(
                "h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.04]",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <div className="grid h-full place-items-center text-faint" role="img" aria-label="No portfolio yet">
              <Camera className="h-10 w-10 stroke-1" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-sm bg-ink/70 px-1.5 py-0.5 font-mono text-[11px] tracking-wider text-bg backdrop-blur">
            №{String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-medium leading-tight">{p.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">{p.location || "Location not set"}</span>
              <span aria-hidden className="shrink-0">·</span>
              <span className="min-w-0 truncate">{p.specialties.slice(0, 2).join(", ")}</span>
            </p>
          </div>
          <RatingInline id={p._id} className="shrink-0 pt-1" />
        </div>
        <p className="mt-2 text-sm">
          {from ? (
            <>
              <span className="text-muted">From </span>
              <span className="font-medium tabular-nums">{formatINR(from)}</span>
              <span className="text-muted"> / hr</span>
            </>
          ) : (
            <span className="text-muted">Pricing on request</span>
          )}
        </p>
      </Link>
      <FavoriteButton photographer={p} className="absolute right-3 top-3" />
    </motion.article>
  );
}

export function PhotographerCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
