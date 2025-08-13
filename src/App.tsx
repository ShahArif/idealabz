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
import IdeaDetail from './pages/IdeaDetail';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'arif@ideas2it.com';
  const isEmployee = user && user.email !== 'arif@ideas2it.com';

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/ideator/*" element={isEmployee ? <IdeatorDashboard /> : <Auth />} />
      <Route path="/admin/*" element={isSuperAdmin ? <AdminDashboard /> : <Navigate to="/auth?admin=true" />} />
      <Route path="/ideas/:id" element={<IdeaDetail />} />
      <Route path="/" element={
        isSuperAdmin ? <Navigate to="/admin" /> : 
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
