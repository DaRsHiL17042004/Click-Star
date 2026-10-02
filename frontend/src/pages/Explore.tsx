import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Aperture, SlidersHorizontal, X } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PhotographerCard, PhotographerCardSkeleton } from "@/components/photographer/PhotographerCard";
import { Button, Chip, Dialog, EmptyState, Input, Select } from "@/components/ui";
import { usePhotographers } from "@/hooks/queries";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { errorMessage, formatINR, startingPrice } from "@/lib/utils";

const PRICE_STEPS = [0, 2500, 4000, 6000];
type Sort = "recommended" | "price-asc" | "price-desc" | "experience";

function Filters({
  location, specialties, maxPrice, setParam, toggleSpecialty, clear,
}: {
  location: string; specialties: string[]; maxPrice: number;
  setParam: (k: string, v: string | null) => void; toggleSpecialty: (s: string) => void; clear: () => void;
}) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow mb-3">City</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={!location} onClick={() => setParam("location", null)}>Anywhere</Chip>
          {CITIES.map((c) => (
            <Chip key={c} active={location === c} onClick={() => setParam("location", location === c ? null : c)} data-testid={`chip-city-${c}`}>
              {c}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Specialty</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <Chip key={s} active={specialties.includes(s)} onClick={() => toggleSpecialty(s)} data-testid={`chip-specialty-${s}`}>
              {s}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Hourly budget</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_STEPS.map((p) => (
            <Chip key={p} active={maxPrice === p} onClick={() => setParam("max", p ? String(p) : null)}>
              {p ? `Up to ${formatINR(p)}` : "Any"}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Button variant="ghost" size="sm" onClick={clear} className="-ml-3">
        <X className="h-4 w-4" /> Clear all filters
      </Button>
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);

  const location = params.get("location") ?? "";
  const specialties = useMemo(() => params.getAll("specialty"), [params]);
  const q = params.get("q") ?? "";
  const maxPrice = Number(params.get("max") ?? 0);
  const sort = (params.get("sort") ?? "recommended") as Sort;

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggleSpecialty = (s: string) => {
    const next = new URLSearchParams(params);
    const cur = next.getAll("specialty");
    next.delete("specialty");
    (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]).forEach((x) => next.append("specialty", x));
    setParams(next, { replace: true });
  };
  const clear = () => setParams(new URLSearchParams(), { replace: true });

  const { data, isLoading, isError, error, refetch, isFetching } = usePhotographers({ location, specialties });

  const results = useMemo(() => {
    let list = data ?? [];
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((p) => [p.name, p.bio, p.location, ...p.specialties].join(" ").toLowerCase().includes(needle));
    }
    if (maxPrice) list = list.filter((p) => (p.pricing?.hourly ?? Infinity) <= maxPrice);
    const price = (p: (typeof list)[number]) => startingPrice(p.pricing) ?? Infinity;
    if (sort === "price-asc") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "experience") list = [...list].sort((a, b) => (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0));
    return list;
  }, [data, q, maxPrice, sort]);

  const activeCount = (location ? 1 : 0) + specialties.length + (maxPrice ? 1 : 0);
  const filterProps = { location, specialties, maxPrice, setParam, toggleSpecialty, clear };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="container flex-1 py-10 md:py-14">
        <header className="mb-10 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-3">Explore</p>
            <h1 className="font-display text-xl font-medium">
              {specialties.length === 1 ? `${specialties[0]} photographers` : "Photographers"}
              {location ? ` in ${location}` : " near you"}
            </h1>
          </div>
          <div className="flex gap-2 md:col-span-5 md:justify-end">
            <label htmlFor="q" className="sr-only">Search by name or style</label>
            <Input id="q" type="search" placeholder="Search name, style, area…" value={q} onChange={(e) => setParam("q", e.target.value || null)} className="md:max-w-xs" data-testid="input-search" />
            <Button variant="outline" className="shrink-0 lg:hidden" onClick={() => setSheet(true)} data-testid="button-filters">
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeCount ? ` · ${activeCount}` : ""}
            </Button>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
            <div className="sticky top-24">
              <Filters {...filterProps} />
            </div>
          </aside>

          <section className="lg:col-span-9" aria-live="polite" aria-busy={isLoading || isFetching}>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
              <p className="text-sm text-muted" data-testid="text-result-count">
                {isLoading ? "Loading…" : `${results.length} photographer${results.length === 1 ? "" : "s"}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-muted">Sort</label>
                <Select id="sort" value={sort} onChange={(e) => setParam("sort", e.target.value === "recommended" ? null : e.target.value)} className="h-9 w-auto text-sm" data-testid="select-sort">
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="experience">Most experienced</option>
                </Select>
              </div>
            </div>

            {isError ? (
              <EmptyState
                icon={<Aperture />}
                title="We couldn't load photographers"
                body={errorMessage(error, "The server didn't respond. Check your connection and try again.")}
                action={<Button onClick={() => refetch()}>Try again</Button>}
              />
            ) : isLoading ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <PhotographerCardSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={<Aperture />}
                title="Nobody in frame yet"
                body="No photographers match these filters. Try another city or widen your budget — new studios join every week."
                action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
              />
            ) : (
              <motion.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((p, i) => <PhotographerCard key={p._id} p={p} index={i} />)}
              </motion.div>
            )}
          </section>
        </div>
      </main>

      <Dialog open={sheet} onClose={() => setSheet(false)} title="Filters">
        <Filters {...filterProps} />
        <Button className="mt-6 w-full" onClick={() => setSheet(false)}>Show {results.length} results</Button>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
