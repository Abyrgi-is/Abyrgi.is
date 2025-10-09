"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';

type Role = 'staff' | 'driver';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role | Role[];
  redirectTo?: string;
  fallbackPath?: string;
}

/**
 * RoleGuard - Protects routes based on user roles
 * Checks both authentication and role requirements
 * Redirects to sign-in if not authenticated, or home if insufficient roles
 */
export default function RoleGuard({ 
  children, 
  requiredRoles,
  redirectTo, 
  fallbackPath = "/" 
}: RoleGuardProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndRole = async () => {
      const { user, error: userError } = await supabaseClient.getCurrentUser();
      
      if (!user && isMounted) {
        const redirect = redirectTo || window.location.pathname;
        router.replace(`/sign_in?redirect=${redirect}`);
        return;
      }
      
      if (user) {
        const { data: rolesData, error: roleError } = await supabaseClient.getUserRole(user.id);
        
        if (rolesData && isMounted) {
          const userRoles = rolesData.map((r: any) => r?.roles?.role).filter(Boolean);
          const requiredRolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
          
          // Check if user has at least one of the required roles
          const hasRequiredRole = requiredRolesArray.some(role => userRoles.includes(role));
          
          if (!hasRequiredRole) {
            // User doesn't have required role, redirect to fallback
            router.replace(fallbackPath);
            return;
          }
          
          setAuthChecked(true);
        } else if (isMounted) {
          // No roles found, redirect to fallback
          router.replace(fallbackPath);
        }
      }
    };
    
    checkAuthAndRole();
    
    return () => { 
      isMounted = false; 
    };
  }, [router, requiredRoles, redirectTo, fallbackPath]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Athuga aðgang...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}