import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Removed hardcoded UserRole type

// Canonical list of roles supported by the app_role enum in the database
const allowedRoles = [
  'employee',
  'product_expert',
  'tech_expert',
  'leader',
  'super_admin',
  'idealabs_core_team',
  'idea_mentor',
];

// Hook to fetch all available roles dynamically from the database
export const useRoles = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // First try to fetch from a 'roles' table if it exists
        const { data: rolesData, error: rolesError } = await supabase.from('roles').select('name');
        
        if (!rolesError && rolesData && rolesData.length > 0) {
          // Normalize and constrain to allowed enum values
          const normalized = rolesData
            .map((r: { name: string }) => r.name)
            .map((name) => (name === 'ideator' ? 'employee' : name))
            .filter((name) => allowedRoles.includes(name));
          setRoles(Array.from(new Set(normalized)));
        } else {
          // Fallback to canonical enum-backed roles
          setRoles(allowedRoles);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to canonical enum-backed roles on error
        setRoles(allowedRoles);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading };
};

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { roles: availableRoles } = useRoles();

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !data?.role) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
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
        return ['product_expert', 'super_admin'].includes(role);
      case 'tech_validation':
        return ['tech_expert', 'super_admin'].includes(role);
      case 'leadership_pitch':
      case 'mvp':
        return ['leader', 'super_admin'].includes(role);
      default:
        return false;
    }
  };

  const getRoleDisplayName = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
  };

  return {
    role,
    loading,
    canManageStage,
    getRoleDisplayName,
  };
};