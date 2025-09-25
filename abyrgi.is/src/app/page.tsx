'use client'

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Abyrgi.is
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your trusted driving service app
          </p>
        </div>

        {user ? (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Welcome back, {user.email}!
            </p>
            <button
              onClick={signOut}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-600 text-white gap-2 hover:bg-red-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              href="/signin"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-900 gap-2 hover:bg-gray-50 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            >
              Sign Up
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
