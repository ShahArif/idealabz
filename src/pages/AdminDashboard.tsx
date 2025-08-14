import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleBasedSidebar } from '@/components/RoleBasedSidebar';
import { DashboardPage } from './admin/DashboardPage';
import { UserManagementPage } from './admin/UserManagementPage';
import { IdeasPage } from './admin/IdeasPage';
import { AIModePage } from './admin/AIModePage';
import { CompetitorAnalysisPage } from './admin/CompetitorAnalysisPage';
import { ValidationFrameworksPage } from './admin/ValidationFrameworksPage';
import { MarketCalculationPage } from './admin/MarketCalculationPage';
import { RelevantIdeasPage } from './admin/RelevantIdeasPage';
import { UserProblemsPage } from './admin/UserProblemsPage';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { role } = useUserRole();

  // Redirect if not super admin
  if (role !== 'super_admin') {
    return <Navigate to="/auth?admin=true" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <RoleBasedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} role="super_admin" />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <div className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">IdeaLabs Admin</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/ai" element={<AIModePage />} />
            <Route path="/competitors" element={<CompetitorAnalysisPage />} />
            <Route path="/ai/validation/frameworks" element={<ValidationFrameworksPage />} />
            <Route path="/ai/validation/relevant" element={<RelevantIdeasPage />} />
            <Route path="/ai/validation/user-problems" element={<UserProblemsPage />} />
            <Route path="/ai/market" element={<MarketCalculationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;