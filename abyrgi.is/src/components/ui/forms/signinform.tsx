'use client'

import React, { useState } from "react";
import { createClient } from '@supabase/supabase-js';

// --- Supabase singleton clients to avoid multiple GoTrueClient instances ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Keep module-level references so we only ever create these once per storage flavor
let supabasePersist: ReturnType<typeof createClient> | null = null;
let supabaseSession: ReturnType<typeof createClient> | null = null;

function getSupabase(persist: boolean) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  if (persist) {
    if (!supabasePersist) {
      supabasePersist = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'abyrgi-auth-persist',
        },
      });
    }
    return supabasePersist;
  }

  if (!supabaseSession) {
    supabaseSession = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        storageKey: 'abyrgi-auth-session',
      },
    });
  }
  return supabaseSession;
}
// --- end singleton setup ---

export type SignInValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignInFormProps = {
  onSubmit?: (values: SignInValues) => Promise<void> | void;
  disabled?: boolean;
  error?: string;
  forgotPasswordHref?: string;
  signUpHref?: string;
  labels?: Partial<{
    title: string;
    subtitle: string;
    email: string;
    password: string;
    remember: string;
    submit: string;
    forgot: string;
    signupPrefix: string;
    signupCta: string;
  }>;
  className?: string;
  redirectTo?: string;
};

const defaultLabels = {
  title: "Sign in",
  subtitle: "Welcome back. Please enter your details.",
  email: "Email",
  password: "Password",
  remember: "Remember me",
  submit: "Sign in",
  forgot: "Forgot password?",
  signupPrefix: "Don’t have an account?",
  signupCta: "Create one",
};

export function SignInForm({
  onSubmit,
  disabled,
  error,
  forgotPasswordHref = "#",
  signUpHref = "/sign_up",
  labels: customLabels,
  className,
  redirectTo,
}: SignInFormProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!email.trim()) return "Please enter your email.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || loading) return;

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({ email: email.trim(), password, remember });
      } else {
        const supabase = getSupabase(remember);

        // Attempt sign-in
        const { error: supaError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (supaError) {
          // Surface clearer messages for common cases
          const raw = (supaError.message || "").toLowerCase();
          if (raw.includes("invalid login credentials")) {
            throw new Error("Invalid email or password.");
          }
          if (raw.includes("email not confirmed") || raw.includes("email not confirmed")) {
            throw new Error("Please confirm your email before signing in.");
          }
          throw new Error(supaError.message);
        }

        // Double-check that a session exists after sign-in; this helps catch CORS/site URL misconfig
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Supabase getSession error:", sessionError);
        }
        if (!sessionData?.session) {
          throw new Error(
            "Signed in but no session was returned. Check your Supabase Auth settings (enable Email/Password), add your site's URL to 'Site URL' and 'Allowed CORS Origins', and verify NEXT_PUBLIC_SUPABASE_URL/ANON key."
          );
        }

        if (redirectTo) {
          window.location.assign(redirectTo);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // Log the full error for debugging in the browser console
      console.error("Sign-in error:", err);
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = Boolean(disabled || loading);

  return (
    <form
      onSubmit={handleSubmit}
      aria-describedby={error || localError ? "signin-error" : undefined}
      className={`w-full max-w-md mx-auto rounded-xl bg-white shadow-lg p-8 space-y-6 ${className ?? ""}`}
    >
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{labels.title}</h2>
        <p className="text-sm text-gray-600">{labels.subtitle}</p>
      </div>

      {(error || localError) && (
        <div
          id="signin-error"
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error || localError}
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-left">
          <span className="block text-sm font-medium text-gray-900 mb-1">
            {labels.email}
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formDisabled}
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </label>

        <label className="block text-left">
          <span className="block text-sm font-medium text-gray-900 mb-1">
            {labels.password}
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={formDisabled}
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </label>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-900">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={formDisabled}
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
            />
            <span>{labels.remember}</span>
          </label>

          {forgotPasswordHref && (
            <a
              href={forgotPasswordHref}
              className="text-sm text-sky-600 hover:underline"
            >
              {labels.forgot}
            </a>
          )}
        </div>

        <button
          type="submit"
          disabled={formDisabled}
          aria-busy={loading || undefined}
          className="w-full rounded-md bg-sky-600 px-4 py-2 text-white font-medium shadow hover:bg-sky-700 active:translate-y-px transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : labels.submit}
        </button>

        {signUpHref && (
          <p className="text-center text-sm text-gray-600">
            {labels.signupPrefix}{" "}
            <a href={signUpHref} className="text-sky-600 hover:underline">
              {labels.signupCta}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}

export default SignInForm;