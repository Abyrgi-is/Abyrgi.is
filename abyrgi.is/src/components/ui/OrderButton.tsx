"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function OrderButton() {
    const router = useRouter(); // Call useRouter at the top level of the component

    const handleClick = () => {
        console.log("Button clicked!");
        router.push("/order"); // Use router.push here
    };

    return (
        <button
            style={{
                backgroundColor: "black",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                width: "200px",
                height: "50px",
            }}
            onClick={handleClick} // Pass handleClick directly
        >
            <span style={{ fontFamily: "Arial, sans-serif" }}> Pay</span>
        </button>
    );
}