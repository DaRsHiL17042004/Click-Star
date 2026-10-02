import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PhotographerCard, PhotographerCardSkeleton } from "@/components/photographer/PhotographerCard";
import { Select, buttonClass } from "@/components/ui";
import { usePhotographers } from "@/hooks/queries";
import { CITIES, SPECIALTIES } from "@/lib/constants";

const img = (n: string) => `${import.meta.env.BASE_URL}img/${n}.webp`;

const reel = [
  { label: "Wedding", src: img("pf-wedding") },
  { label: "Portrait", src: img("pf-portrait") },
  { label: "Maternity", src: img("pf-maternity") },
  { label: "Product", src: img("pf-product") },
  { label: "Event", src: img("pf-event") },
  { label: "Newborn", src: img("pf-newborn") },
  { label: "Fashion", src: img("pf-fashion") },
  { label: "Food", src: img("pf-food") },
  { label: "Street", src: img("pf-street") },
  { label: "Travel", src: img("pf-travel") },
];

const ease = [0.22, 1, 0.36, 1] as const;

function HeroSearch() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (specialty) q.set("specialty", specialty);
    if (city) q.set("location", city);
    navigate(`/photographers${q.toString() ? `?${q}` : ""}`);
  };
  return (
    <form onSubmit={submit} className="flex w-full max-w-xl flex-col gap-2 rounded-lg border border-line bg-surface p-2 shadow-soft sm:flex-row" role="search" aria-label="Find a photographer">
      <label className="sr-only" htmlFor="hero-specialty">Type of shoot</label>
      <Select id="hero-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="border-0 bg-transparent focus:ring-0 sm:flex-1" data-testid="select-hero-specialty">
        <option value="">Any kind of shoot</option>
        {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <span className="hidden w-px self-stretch bg-line sm:block" aria-hidden />
      <label className="sr-only" htmlFor="hero-city">City</label>
      <Select id="hero-city" value={city} onChange={(e) => setCity(e.target.value)} className="border-0 bg-transparent focus:ring-0 sm:flex-1" data-testid="select-hero-city">
        <option value="">Anywhere nearby</option>
        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <button type="submit" className={buttonClass("secondary", "md", "sm:px-5")} data-testid="button-hero-search">
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}

export default function Landing() {
  const { data: photographers, isLoading } = usePhotographers();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 60]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader overlay />
      <main id="main">
        {/* ------------------------------------------------------------ Hero */}
        <section className="relative overflow-hidden pb-16 pt-[120px] md:pb-24 md:pt-[136px]">
          <div className="container grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="eyebrow mb-6">
                Local photographers · Maharashtra
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="font-display text-hero font-medium tracking-[-0.02em]"
              >
                Hire the photographer who <em className="font-normal italic text-accent">knows</em> your city.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease }}
                className="mt-6 max-w-[46ch] text-base text-muted md:text-lg"
              >
                Weddings in Bhiwandi, product shoots in Thane, maternity sessions by the sea. Compare real portfolios and rupee prices, then book in three steps.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }} className="mt-10">
                <HeroSearch />
                <p className="mt-4 text-sm text-muted">
                  Are you a photographer?{" "}
                  <Link to="/register?role=photographer" className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
                    List your studio for free
                  </Link>
                </p>
              </motion.div>
            </div>

            <motion.div
              style={{ y: heroY }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease }}
              className="relative lg:col-span-6"
            >
              <div className="crop-marks">
                <div className="grain relative aspect-[4/5] overflow-hidden rounded-md sm:aspect-[5/4] lg:aspect-[4/5]">
                  <img src={img("hero-wedding")} alt="A bride and groom laughing together in a marigold-decorated courtyard" className="h-full w-full object-cover object-[60%_center]" fetchPriority="high" />
                </div>
              </div>
              {/* EXIF caption — a nod to the contact sheet */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease }}
                className="absolute -bottom-6 left-4 right-4 flex items-center justify-between gap-4 rounded-md border border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur sm:left-auto sm:right-[-12px] sm:w-[340px]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Rajesh Sharma</p>
                  <p className="truncate text-xs text-muted">Wedding · Mumbai</p>
                </div>
                <p className="shrink-0 text-right font-mono text-[11px] leading-tight text-muted">
                  f/1.8 · 1/320
                  <br />
                  ISO 400 · 85mm
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------- Film reel */}
        <section aria-labelledby="reel-title" className="border-y border-line bg-[#15120e] py-10 text-[#f3eee4]">
          <div className="container mb-6 flex items-end justify-between gap-4">
            <h2 id="reel-title" className="font-display text-xl font-medium">What are you shooting?</h2>
            <span className="hidden font-mono text-xs tracking-widest text-[#f3eee4]/50 sm:block">KODAK PORTRA 400 · 36 EXP</span>
          </div>
          <div className="relative">
            <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto px-5 md:px-8 [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]">
              {reel.map((r, i) => (
                <Link
                  key={r.label}
                  to={`/photographers?specialty=${encodeURIComponent(r.label)}`}
                  className="group relative shrink-0 snap-start"
                  data-testid={`link-reel-${r.label.toLowerCase()}`}
                >
                  {/* sprocket holes */}
                  <div className="flex justify-between px-1 pb-2" aria-hidden>
                    {Array.from({ length: 6 }).map((_, k) => <span key={k} className="h-2 w-3 rounded-[2px] bg-[#f3eee4]/15" />)}
                  </div>
                  <div className="relative h-[220px] w-[170px] overflow-hidden rounded-sm md:h-[260px] md:w-[200px]">
                    <img src={r.src} alt="" loading="lazy" className="h-full w-full bg-[#2a251f] object-cover opacity-85 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                      <span className="text-sm font-medium">{r.label}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="flex justify-between px-1 pt-2" aria-hidden>
                    <span className="font-mono text-[10px] text-[#e0532c]">{String(i + 1).padStart(2, "0")}A</span>
                    {Array.from({ length: 4 }).map((_, k) => <span key={k} className="h-2 w-3 rounded-[2px] bg-[#f3eee4]/15" />)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- How it works */}
        <section aria-labelledby="how-title" className="py-20 md:py-32">
          <div className="container grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4">How it works</p>
              <h2 id="how-title" className="font-display text-2xl font-medium tracking-tight">
                From “we need a photographer” to booked — before your chai gets cold.
              </h2>
              <ol className="mt-12 space-y-10">
                {[
                  ["Browse real work", "Every profile shows the photographer's own portfolio, specialties and starting price — no stock photos, no “call for rates”."],
                  ["Pick a package & date", "Hourly, single-event or full multi-day coverage. Choose a date from their availability and tell them where the shoot is."],
                  ["Confirm & review", "The photographer confirms within hours. After the shoot, leave a review that helps the next family decide."],
                ].map(([t, b], i) => (
                  <motion.li
                    key={t}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="grid grid-cols-[56px_1fr] gap-4"
                  >
                    <span className="font-mono text-sm text-accent">0{i + 1}</span>
                    <div className="border-t border-line pt-4">
                      <h3 className="text-lg font-semibold">{t}</h3>
                      <p className="mt-2 text-muted">{b}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
            <div className="relative lg:col-span-6 lg:col-start-7">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 overflow-hidden rounded-md">
                  <img src={img("about-photographer")} alt="A photographer reviewing shots on her camera in a sunlit studio" loading="lazy" className="aspect-[3/4] h-full w-full object-cover" />
                </div>
                <div className="col-span-2 flex flex-col gap-3 pt-16">
                  <img src={img("pf-portrait")} alt="Studio portrait against a terracotta backdrop" loading="lazy" className="aspect-[3/4] w-full rounded-md object-cover" />
                  <img src={img("pf-product")} alt="Brass diyas and chai, product still life" loading="lazy" className="aspect-square w-full rounded-md object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- Featured */}
        <section aria-labelledby="featured-title" className="border-t border-line bg-surface py-20 md:py-24">
          <div className="container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">On the contact sheet this week</p>
                <h2 id="featured-title" className="font-display text-xl font-medium">Photographers near you</h2>
              </div>
              <Link to="/photographers" className={buttonClass("outline", "sm")} data-testid="link-view-all">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <PhotographerCardSkeleton key={i} />)
                : photographers?.slice(0, 4).map((p, i) => <PhotographerCard key={p._id} p={p} index={i} />)}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ Testimony */}
        <section className="py-20 md:py-32">
          <figure className="container max-w-4xl">
            <blockquote className="font-display text-xl font-normal italic leading-snug md:text-2xl">
              “Rajesh barely felt present, yet he caught everything. The candid frames of my grandmother are my favourite photos ever.”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-sm">
              <span className="h-px w-10 bg-accent" aria-hidden />
              <span className="font-medium">Priya Iyer</span>
              <span className="text-muted">— booked a candid shoot in Bandra</span>
            </figcaption>
          </figure>
        </section>

        {/* ---------------------------------------------- For photographers */}
        <section aria-labelledby="pro-title" className="relative isolate overflow-hidden bg-[#15120e] text-[#f3eee4]">
          <img src={img("pf-travel")} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full bg-[#15120e] object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#15120e] via-[#15120e]/85 to-transparent" />
          <div className="container py-24 md:py-36">
            <div className="max-w-xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-[#f3eee4]/60">For photographers</p>
              <h2 id="pro-title" className="font-display text-2xl font-medium tracking-tight">Spend less time chasing clients, more time behind the lens.</h2>
              <p className="mt-6 text-[#f3eee4]/75">
                A portfolio page that does the selling, bookings that land in one dashboard, and reviews that build your name across the city. Free to list.
              </p>
              <Link to="/register?role=photographer" className={buttonClass("secondary", "lg", "mt-10")} data-testid="link-join-photographer">
                List your studio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
