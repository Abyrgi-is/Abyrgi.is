"use client";

import Link from "next/link";

export default function StadfestaPage() {
    return (
        <div className="max-w-2xl mx-auto p-6 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-green-100 rounded-full p-6">
                        <svg
                            className="w-16 h-16 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
                
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pöntun staðfest!
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Þakka þér fyrir að nota Abyrgi.is
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                        Pöntunin þín hefur verið skráð í kerfið okkar. 
                        Við munum senda þér upplýsingar um ökumann þegar 
                        pöntun hefur verið úthlutað.
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <Link href="/minarsidur" className="block">
                        <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Skoða mínar pantanir
                        </button>
                    </Link>
                    <Link href="/" className="block">
                        <button className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            Fara á forsíðu
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}