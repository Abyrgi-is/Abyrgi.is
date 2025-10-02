"use client";

import { RoleGuard } from '@/components/auth';

function DropoffPageContent() {
    return <div>Dropoff Page</div>;
}

export default function DropoffPage() {
    return (
        <RoleGuard requiredRoles={['staff', 'driver']} redirectTo="/dropoff">
            <DropoffPageContent />
        </RoleGuard>
    );
}