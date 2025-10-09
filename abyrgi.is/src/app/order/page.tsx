"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OrderPage() {
    return (
        <AuthGuard redirectTo="/order">
            <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Pöntun staðfest!
                    </h1>
                    <p className="text-gray-600">
                        Pöntunin þín hefur verið móttekin og vistuð í gagnagrunninn okkar.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                        Þú færð staðfestingu í gegnum appið þegar ökumaður hefur verið úthlutaður.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/minarsidur"
                        className="block w-full py-3 px-6 rounded-lg font-semibold transition-colors order-link-primary"
                    >
                        Sjá mínar pantanir
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 px-6 rounded-lg font-semibold transition-colors order-link-secondary"
                    >
                        Til baka á forsíðu
                    </Link>
                    <style jsx>{`
                        :global(.order-link-primary) {
                            background-color: #1e40af !important;
                            color: #ffffff !important;
                        }
                        :global(.order-link-primary:hover) {
                            background-color: #60a5fa !important;
                        }
                        :global(.order-link-secondary) {
                            background-color: #93c5fd !important;
                            color: #1e293b !important;
                        }
                        :global(.order-link-secondary:hover) {
                            background-color: #9ca3af !important;
                        }
                    `}</style>
                </div>
            </div>
        </div>
        </AuthGuard>
    );
}

