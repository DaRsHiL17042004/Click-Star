import { Suspense } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazy";
import { Link, Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays, Heart, Images, LayoutGrid, LogOut, MessageSquareQuote, Search, UserRound, UsersRound, Inbox,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/SiteHeader";
import { Avatar, Button, Spinner } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const Client = lazy(() => import("./Client"));
const Photographer = lazy(() => import("./Photographer"));
const Admin = lazy(() => import("./Admin"));

type NavItem = { to: string; label: string; icon: typeof LayoutGrid; end?: boolean };

const NAV: Record<Role, NavItem[]> = {
  client: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/dashboard/saved", label: "Saved", icon: Heart },
    { to: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  photographer: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/dashboard/portfolio", label: "Portfolio", icon: Images },
    { to: "/dashboard/reviews", label: "Reviews", icon: MessageSquareQuote },
    { to: "/dashboard/profile", label: "Studio profile", icon: UserRound },
  ],
  admin: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/dashboard/leads", label: "Leads", icon: Inbox },
    { to: "/dashboard/users", label: "Users", icon: UsersRound },
  ],
};

const roleLabel: Record<Role, string> = { client: "Client", photographer: "Photographer", admin: "Administrator" };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  const items = NAV[user.role];
  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      {/* ---------------------------------------------------------- sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 py-5">
          <Link to="/" aria-label="Click-Star home"><Logo /></Link>
        </div>
        <nav aria-label="Dashboard" className="flex-1 space-y-0.5 px-3 py-4">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors", isActive ? "bg-ink/[0.06] font-medium text-ink" : "text-muted hover:bg-ink/[0.03] hover:text-ink")
              }
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {({ isActive }) => (
                <>
                  <n.icon className={cn("h-4 w-4", isActive && "text-accent")} />
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
          {user.role === "client" && (
            <Link to="/photographers" className="mt-4 flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted hover:text-ink">
              <Search className="h-4 w-4" /> Find photographers
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 border-t border-line p-4">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" data-testid="text-user-name">{user.name}</p>
            <p className="truncate text-xs text-muted">{roleLabel[user.role]}</p>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out" data-testid="button-sidebar-logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* ------------------------------------------------------ mobile bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" aria-label="Click-Star home"><Logo /></Link>
          <div className="flex items-center">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
        <nav aria-label="Dashboard" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => cn("flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-sm", isActive ? "bg-ink text-bg" : "text-muted")}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main" className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<div className="grid h-64 place-items-center"><Spinner /></div>}>
            {user.role === "client" ? <Client /> : user.role === "photographer" ? <Photographer /> : <Admin />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
