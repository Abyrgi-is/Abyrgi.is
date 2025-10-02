"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';

export default function DropoffPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        
        const checkAuthAndRole = async () => {
            const { user, error: userError } = await supabaseClient.getCurrentUser();
            
            if (!user && isMounted) {
                router.replace("/sign_in?redirect=/dropoff");
                return;
            }
            
            if (user) {
                const { data: rolesData, error: roleError } = await supabaseClient.getUserRole(user.id);
                
                if (rolesData && isMounted) {
                    const roles = rolesData.map((r: any) => r?.roles?.role).filter(Boolean);
                    const isStaff = roles.includes('staff');
                    const isDriver = roles.includes('driver');
                    
                    if (!isStaff && !isDriver) {
                        // Only staff and drivers can access dropoff page
                        router.replace("/");
                        return;
                    }
                    
                    setAuthChecked(true);
                } else if (isMounted) {
                    // No roles found, redirect to home
                    router.replace("/");
                }
            }
        };
        
        checkAuthAndRole();
        
        return () => { 
            isMounted = false; 
        };
    }, [router]);

    if (!authChecked) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg">Athuga aðgang...</p>
                </div>
            </div>
        );
    }

    return <div>Dropoff Page</div>; 
}