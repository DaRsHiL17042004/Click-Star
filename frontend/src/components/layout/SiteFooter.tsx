import { Link } from "react-router-dom";
import { AtSign as Instagram, Mail, MapPin } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

const cities = ["Mumbai", "Thane", "Bhiwandi", "Navi Mumbai", "Pune", "Nashik"];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <span className="font-display text-xl font-medium">Click·Star</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted">
            The local way to hire a photographer. Real portfolios, honest prices in rupees, and reviews from people who actually booked.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Bhiwandi, Maharashtra</span>
            <a href="mailto:hello@clickstar.in" className="inline-flex items-center gap-2 hover:text-ink"><Mail className="h-4 w-4" /> hello@clickstar.in</a>
          </div>
        </div>

        <div className="md:col-span-3">
          <h2 className="eyebrow mb-4">Browse by city</h2>
          <ul className="grid grid-cols-2 gap-y-2 text-sm md:grid-cols-1">
            {cities.map((c) => (
              <li key={c}>
                <Link to={`/photographers?location=${encodeURIComponent(c)}`} className="text-muted hover:text-ink">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="eyebrow mb-4">Platform</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/photographers" className="text-muted hover:text-ink">Find photographers</Link></li>
            <li><Link to="/register?role=photographer" className="text-muted hover:text-ink">List your studio</Link></li>
            <li><Link to="/login" className="text-muted hover:text-ink">Sign in</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="eyebrow mb-4">Follow</h2>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container flex flex-col justify-between gap-2 py-6 font-mono text-xs text-faint sm:flex-row">
          <span>© {new Date().getFullYear()} Click-Star. All rights reserved.</span>
          <span>f/2.8 · 1/250s · ISO 200 · Made in Maharashtra</span>
        </div>
      </div>
    </footer>
  );
}
