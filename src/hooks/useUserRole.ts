import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'employee' | 'product_expert' | 'tech_expert' | 'leader' | 'super_admin' | 'idealabs_core_team';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('employee'); // Default role
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('employee'); // Default role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const canManageStage = (stage: string): boolean => {
    if (!role) return false;
    
    switch (stage) {
      case 'discovery':
      case 'basic_validation':
        return role === 'product_expert' || role === 'super_admin';
      case 'tech_validation':
        return role === 'tech_expert' || role === 'super_admin';
      case 'leadership_pitch':
        return role === 'leader' || role === 'super_admin';
      case 'mvp':
        return role === 'leader' || role === 'super_admin';
      default:
        return false;
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'employee':
        return 'Ideator';
      case 'product_expert':
        return 'Product Expert';
      case 'tech_expert':
        return 'Tech Expert';
      case 'leader':
        return 'Leader';
      case 'super_admin':
        return 'Super Admin';
      case 'idealabs_core_team':
        return 'IdeaLabs Core Team';
      default:
        return 'Unknown';
    }
  };

  return {
    role,
    loading,
    canManageStage,
    getRoleDisplayName
  };
};