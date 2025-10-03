"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface ContinueButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export default function ContinueButton({ disabled = false, onClick }: ContinueButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    router.push("/borga");
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
        disabled
          ? 'themed-button opacity-50 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
      }`}
    >
      Halda áfram í greiðslu
    </button>
  );
}