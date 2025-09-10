"use client";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "2rem", position: "relative", minHeight: "100vh" }}>
      <div className="desktop-btn-wrapper">
      </div>
      <button className="mobile-bottom-btn">
        <Link 
        href="./sign_up">
        Panta
        </Link>
      </button>
      <h1 style={{ fontSize: "2rem" }}>Velkomin á Abyrgi.is</h1>
      <p style={{ fontSize: "1.2rem" }}>
        Við sækjum bílinn þinn og keyrum hann örugglega heim, og ef þú vilt, færð þú líka far með!
      </p>
      <Image
        src="/car-ride-home.jpg"
        alt="Bíll sóttur og keyrður heim"
        width={700}
        height={350}
        style={{ borderRadius: "10px", margin: "2rem 0" }}
      />
      <p>
        Þægileg og örugg þjónusta fyrir þig og bílinn þinn. Hafðu samband og við sjáum um restina!
      </p>
      <style jsx>{`
        .desktop-btn-wrapper {
          display: none;
        }
        .mobile-bottom-btn {
          display: none;
        }
        @media (max-width: 700px) {
          .mobile-bottom-btn {
            display: block;
            position: fixed;
            left: 5vw;
            right: 5vw;
            bottom: 3vw;
            width: 90vw;
            padding: 1.2rem;
            font-size: 1.2rem;
            background: #0070f3;
            color: white;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            z-index: 1000;
          }
        }
        @media (min-width: 701px) {
          .desktop-btn-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 1.5rem;
          }
          .mobile-bottom-btn {
            display: inline-block;
            position: static;
            width: auto;
            padding: 0.9rem 2rem;
            font-size: 1.1rem;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
            cursor: pointer;
            transition: background 0.2s;
          }
          .mobile-bottom-btn:hover {
            background: #005bb5;
          }
        }
      `}</style>
    </main>
  );
}