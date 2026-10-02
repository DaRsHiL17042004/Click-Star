// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import PhotographerDashboard from "./pages/dashboards/PhotographerDashboard";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import { useAuth } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import BookingPage from "./pages/BookingPage";
import ReviewPage from "./pages/ReviewPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";

// ProtectedRoute component to handle route protection based on authentication and roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Extract user, authentication status, and loading state from AuthContext
  const { user, isAuthenticated, loading } = useAuth();

  // Show a loading screen while authentication status is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login page if the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to home page if the user's role is not allowed for this route
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  // Render the children components if all checks pass
  return children;
};

const App = () => {
  return (
    <>
      <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/photographer-dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["photographer"]}>
                  <PhotographerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <SearchPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book/:photographerId"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review/:photographerId/:bookingId"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
      </AnimatePresence>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default App;
