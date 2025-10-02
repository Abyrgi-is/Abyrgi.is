"use client";

import { AuthGuard } from '@/components/auth';

function ReviewPageContent() {
    return <div>Review Page</div>;
}

export default function ReviewPage() {
    return (
        <AuthGuard redirectTo="/review">
            <ReviewPageContent />
        </AuthGuard>
    );
}