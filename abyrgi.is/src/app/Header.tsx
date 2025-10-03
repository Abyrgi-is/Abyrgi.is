"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseClient } from "@/utils/supabase/supabase-library";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { cursorTo } from "readline";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    // Listen for auth state changes FIRST - this fires immediately with cached session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session?.user;
      setUserAuthenticated(isAuth);

      // Load roles on auth change
      if (session?.user) {
        supabaseClient.getUserRole(session.user.id).then(({ data: rolesData }) => {
          if (rolesData) {
            const roles = rolesData.map((r: any) => r?.roles?.role).filter(Boolean);
            setIsStaff(roles.includes('staff'));
            setIsDriver(roles.includes('driver'));
          }
        });
      } else {
        setIsStaff(false);
        setIsDriver(false);
      }
    });

    // Also do an explicit check
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session?.user;
        setUserAuthenticated(isAuth);

        if (session?.user) {
          supabaseClient.getUserRole(session.user.id).then(({ data: rolesData }) => {
            if (rolesData) {
              const roles = rolesData.map((r: any) => r?.roles?.role).filter(Boolean);
              setIsStaff(roles.includes('staff'));
              setIsDriver(roles.includes('driver'));
            }
          });
        } else {
          setIsStaff(false);
          setIsDriver(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUserAuthenticated(false);
      }
    };
    
    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseClient.signOut();
      if (error) {
        console.error("Sign out error:", error);
        alert("Error signing out: " + error.message);
      } else {
        // Redirect to home page after successful sign out
        router.push("/");
        // Force reload to clear any cached state
        window.location.reload();
      }
    } catch (err) {
      console.error("Unexpected sign out error:", err);
      alert("Unexpected error signing out");
    }
  };

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
    <nav className="header-nav bg-gray-800">
      <span className="header-logo"><Link href="/">Abyrgi.is</Link></span>
      {/* Stór skjár links */}
      <div className="header-links">
        <Link href="/about">About</Link>
        <Link href="/stillingar">Stillingar</Link>
        {userAuthenticated && <Link href="/minarsidur">Mínar Síður</Link>}
        {userAuthenticated && <Link href="/stadsetnig">Panta</Link>}
        {isDriver && <Link href="/pickup">Pickup</Link>}
        {(isStaff || isDriver) && <Link href="/dropoff">Dropoff</Link>}
        {userAuthenticated ? (
          <button
            onClick={handleSignOut}
            style={{ 
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '0',
              margin: '0',
              font: 'inherit',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign out
          </button>
        ) : (
          <Link href="/sign_in">Sign in</Link>
        )}
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
        {userAuthenticated && (
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
        )}
        <Link href="/stadsetnig"
          style={{
            display: "block",
            padding: "0.75rem 1rem",
            textDecoration: "none",
            color: "#0070f3",
          }}
        onClick={() => setMenuOpen(false)}>
          Panta
        </Link>
        {userAuthenticated ? (
          <button
            onClick={() => {
              setMenuOpen(false);
              handleSignOut();
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f0f8ff";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/sign_in"
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              textDecoration: "none",
              color: "#0070f3",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
        )}
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
          color: inherit;
          text-decoration: none;
          padding: 0.5rem 0;
        }
        .header-links a:hover {
          text-decoration: underline;
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
        .header-dropdown a,
        .header-dropdown-button {
          display: none;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #0070f3;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          font-size: inherit;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .header-dropdown a:hover,
        .header-dropdown-button:hover {
          background: #f0f8ff;
          text-decoration: underline;
          cursor: pointer;
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