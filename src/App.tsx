import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import IdeatorDashboard from "./pages/EmployeeDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@ideas2it.com';
  const isEmployee = user && user.email !== 'admin@ideas2it.com';

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/auth?admin=true" />} />
      <Route path="/ideator" element={isEmployee ? <IdeatorDashboard /> : <Navigate to="/auth" />} />
      <Route path="/" element={
        isAdmin ? <Navigate to="/admin" /> : 
        isEmployee ? <Navigate to="/ideator" /> : 
        <Index />
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
