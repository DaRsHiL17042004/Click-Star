import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Avatar, Button, buttonClass } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/photographers", label: "Find photographers" },
  { to: "/register?role=photographer", label: "For photographers" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={className} data-testid="button-theme">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const solid = !overlay || scrolled || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        overlay && "-mb-[72px]",
        solid ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent bg-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <Link to="/" data-testid="link-home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm transition-colors hover:text-ink", isActive && n.to === "/photographers" ? "text-ink" : "text-muted")}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/dashboard" className={buttonClass("outline", "sm")} data-testid="link-dashboard">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar name={user.name} size={32} />
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link to="/login" className={buttonClass("ghost", "sm")} data-testid="link-login">
                Sign in
              </Link>
              <Link to="/register" className={buttonClass("primary", "sm")} data-testid="link-register">
                Get started
              </Link>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} data-testid="button-menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-md px-2 py-3 text-base">
                  {n.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className={buttonClass("primary", "md")}>Dashboard</Link>
                    <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>Sign out</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={buttonClass("outline", "md")}>Sign in</Link>
                    <Link to="/register" className={buttonClass("primary", "md")}>Get started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
