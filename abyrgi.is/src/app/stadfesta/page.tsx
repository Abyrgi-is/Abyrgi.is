"use client";

import { AuthGuard } from '@/components/auth';

function StadfestaPageContent() {
    return <div>Staðfesta Page</div>;
}

export default function StadfestaPage() {
    return (
        <AuthGuard redirectTo="/stadfesta">
            <StadfestaPageContent />
        </AuthGuard>
    );
}