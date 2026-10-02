import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { env } from "@/config/env";
import { AuthProvider } from "@/context/auth";
import { ThemeProvider } from "@/context/theme";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const Router = env.router === "hash" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" toastOptions={{ className: "!font-sans !rounded-md !border-line !bg-surface !text-ink" }} />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
