"use client";

import { AuthGuard } from '@/components/auth';
import OrderButton from "@/components/ui/OrderButton";
import Map from "@/components/ui/map";

function BorgaPageContent() {
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

export default function BorgaPage() {
    return (
        <AuthGuard redirectTo="/borga">
            <BorgaPageContent />
        </AuthGuard>
    );
}