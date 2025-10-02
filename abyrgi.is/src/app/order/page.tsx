"use client";

import { AuthGuard } from '@/components/auth';

function OrderPageContent() {
    return <div>Order Page</div>;
}

export default function OrderPage() {
    return (
        <AuthGuard redirectTo="/order">
            <OrderPageContent />
        </AuthGuard>
    );
}