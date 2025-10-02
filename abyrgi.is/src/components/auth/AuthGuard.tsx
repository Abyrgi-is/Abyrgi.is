"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallbackPath?: string;
}

/**
 * AuthGuard - Protects routes for authenticated users only
 * Redirects to sign-in page if user is not authenticated
 */
export default function AuthGuard({ 
  children, 
  redirectTo, 
  fallbackPath = "/" 
}: AuthGuardProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const { user, error } = await supabaseClient.getCurrentUser();
      
      if (!user && isMounted) {
        const redirect = redirectTo || window.location.pathname;
        router.replace(`/sign_in?redirect=${redirect}`);
      } else if (isMounted) {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
    
    return () => { 
      isMounted = false; 
    };
  }, [router, redirectTo]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Athuga innskráningu...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}