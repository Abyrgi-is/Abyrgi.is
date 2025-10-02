"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';
import OrderButton from "@/components/ui/OrderButton";
import Map from "@/components/ui/map";

export default function BorgaPage() {
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        
        const checkAuth = async () => {
            const { user, error } = await supabaseClient.getCurrentUser();
            
            if (!user && isMounted) {
                router.replace("/sign_in?redirect=/borga");
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
    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="text-lg text-gray-700 mb-4">
                <p>Verð start gjald: <span className="font-semibold">1000kr</span></p>
                <p>Km verð: <span className="font-semibold">250kr</span></p>
                <p className="text-sm text-gray-500">
                    (Þetta er alvöru borga, þetta virkar ekki í bara að ýtta á takkann)
                </p>
            </div>

            <div className="flex justify-center">
                <OrderButton />
            </div>
            
        </div>
    );
}