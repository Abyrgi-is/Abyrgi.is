'use client'

import React, { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const labels = {
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

  const validate = (): string | null => {
    if (!email.trim()) return "Please enter your email.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    setLocalError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        const message = data?.error || data?.message || 'Sign-in failed.';
        throw new Error(message);
      }

      // Success: server set httpOnly auth cookies via @supabase/ssr
      window.location.assign('/minarsidur');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = loading;

  return (
    <form
      onSubmit={handleSubmit}
      aria-describedby={localError ? "signin-error" : undefined}
      className="w-full max-w-md mx-auto rounded-xl bg-white shadow-lg p-8 space-y-6"
    >
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{labels.title}</h2>
        <p className="text-sm text-gray-600">{labels.subtitle}</p>
      </div>

      {localError && (
        <div
          id="signin-error"
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {localError}
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
        </div>

        <button
          type="submit"
          disabled={formDisabled}
          aria-busy={loading || undefined}
          className="w-full rounded-md bg-sky-600 px-4 py-2 text-white font-medium shadow hover:bg-sky-700 active:translate-y-px transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : labels.submit}
        </button>
      </div>
    </form>
  );
}