import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="container grid flex-1 place-items-center py-20">
        <div className="text-center">
          <p className="font-mono text-sm tracking-widest text-accent">ERR · 404 · OVEREXPOSED</p>
          <h1 className="mt-6 font-display text-2xl font-medium">This frame didn't develop.</h1>
          <p className="mx-auto mt-4 max-w-sm text-muted">The page you're looking for doesn't exist or has moved.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/" className={buttonClass("primary")}>Go home</Link>
            <Link to="/photographers" className={buttonClass("outline")}>Find photographers</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
