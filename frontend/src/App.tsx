import { Suspense, useEffect, type ReactNode } from "react";
import { lazyWithRetry as lazy } from "@/lib/lazy";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Spinner } from "@/components/ui";
import type { Role } from "@/types";

const Landing = lazy(() => import("@/pages/Landing"));
const Explore = lazy(() => import("@/pages/Explore"));
const PhotographerProfile = lazy(() => import("@/pages/PhotographerProfile"));
const Booking = lazy(() => import("@/pages/Booking"));
const ReviewPage = lazy(() => import("@/pages/Review"));
const Login = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), [pathname]);
  return null;
}

const PageFallback = () => (
  <div className="grid min-h-[60vh] place-items-center">
    <Spinner />
  </div>
);

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/photographers" element={<Explore />} />
          <Route path="/photographers/:id" element={<PhotographerProfile />} />
          <Route path="/book/:photographerId" element={<RequireAuth roles={["client"]}><Booking /></RequireAuth>} />
          <Route path="/review/:photographerId/:bookingId" element={<RequireAuth roles={["client"]}><ReviewPage /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<RequireAuth><Dashboard /></RequireAuth>} />
          {/* Legacy routes from v1 */}
          <Route path="/search" element={<Navigate to="/photographers" replace />} />
          <Route path="/client-dashboard/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/photographer-dashboard/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin-dashboard/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
