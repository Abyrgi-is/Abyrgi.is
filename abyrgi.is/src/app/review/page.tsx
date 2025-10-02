"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';

export default function ReviewPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        
        const checkAuth = async () => {
            const { user, error } = await supabaseClient.getCurrentUser();
            
            if (!user && isMounted) {
                router.replace("/sign_in?redirect=/review");
            } else if (isMounted) {
                setAuthChecked(true);
            }
        };
        
        checkAuth();
        
        return () => { 
            isMounted = false; 
        };
    }, [router]);

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return <div>Review Page</div>;
}