"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 700 && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <nav className="header-nav">
      <span className="header-logo"><Link href="/">Abyrgi.is</Link></span>
      {/* Stór skjár links */}
      <div className="header-links">
        <Link href="/"></Link>
        <Link href="/about">About</Link>
        <Link href="/stillingar">Stillingar</Link>
        <Link href="/minarsidur">Mínar Síður</Link>
      </div>
      {/* "Hamborgari" fyrir minni skjá */}
      <button
        className="header-hamburger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      {/* Dropdown fyrir mobile */}
      <div className="header-dropdown" style={{ display: menuOpen ? "block" : "none" }}>
        <Link href="/about"
          style={{
            display: "block",
            padding: "0.75rem 1rem",
            textDecoration: "none",
            color: "#0070f3",
          }}
        onClick={() => setMenuOpen(false)}>
          About
        </Link>
        <Link href="/stillingar"
          style={{
            display: "block",
            padding: "0.75rem 1rem",
            textDecoration: "none",
            color: "#0070f3",
          }}
        onClick={() => setMenuOpen(false)}>
          Stillingar
        </Link>
        <Link href="/minarsidur"
          style={{
            display: "block",
            padding: "0.75rem 1rem",
            textDecoration: "none",
            color: "#0070f3",
          }}
        onClick={() => setMenuOpen(false)}>
          Mínar Síður
        </Link>
      </div>
      <style jsx>{`
        .header-nav {
          padding: 1rem 2rem;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          position: relative;
        }
        .header-logo {
          font-weight: bold;
          font-size: 1.2rem;
        }
        .header-links {
          display: flex;
          gap: 2rem;
          margin-left: auto;
        }
        .header-links a {
          color: #0070f3;
          text-decoration: none;
          padding: 0.5rem 0;
        }
        .header-hamburger {
          display: none;
          margin-left: auto;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
        }
        .header-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          right: 2rem;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          min-width: 120px;
          z-index: 100;
        }
        .header-dropdown a {
          display: none;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #0070f3;
          background: none;
        }
        .header-dropdown a:hover {
          background: #f0f8ff;
        }
        /* Responsive styles */
        @media (max-width: 700px) {
          .header-links {
            display: none;
          }
          .header-hamburger {
            display: block;
          }
          .header-dropdown {
            display: ${menuOpen ? "flex" : "none"};
            flex-direction: column;
          }
        }
      `}</style>
    </nav>
  );
}