import "./global.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logAction } from "@/lib/firebase";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import { LanguageProvider } from "@/context/LanguageContext";
import { UserProgressProvider } from "@/context/UserProgressContext";

// New component for tracking page views
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logAction("page_visited");
  }, [location.pathname]);

  return null;
};

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("quantaraUser");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Redirect if already logged in
const LoginCheck = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("quantaraUser");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <UserProgressProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsTracker />
            <Routes>
              <Route
                path="/login"
                element={
                  <LoginCheck>
                    <Login />
                  </LoginCheck>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProgressProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
