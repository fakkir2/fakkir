"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/shared/Providers";
import { useAuth } from "@/components/shared/AuthProvider";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { locale, dict } = useApp();
  const a = dict.auth;
  const { supabase, user, configured } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!user || busy) return;

    const next = new URLSearchParams(window.location.search).get("next");
    const safe =
      next && next.startsWith(`/${locale}/`)
        ? next
        : `/${locale}/dashboard`;

    router.replace(safe);
  }, [user, busy, locale, router]);

  if (!configured) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted">{a.notConfigured}</p>
        <Link
          href={`/${locale}/dashboard`}
          className={buttonStyles({ className: "mt-5" })}
        >
          {a.continueDemo}
        </Link>
      </Card>
    );
  }

  const messageFor = (err: unknown) => {
    const code =
      (err as { code?: string } | null)?.code ??
      (err as { message?: string } | null)?.message ??
      "";

    switch (code) {
      case "invalid_credentials":
      case "Invalid login credentials":
      case "email_not_confirmed":
        return a.invalidCredentials;
      case "user_already_exists":
      case "email_exists":
        return a.emailInUse;
      case "weak_password":
      case "Password should be at least 8 characters":
        return a.weakPassword;
      case "invalid_email":
      case "Unable to validate email address: invalid format":
        return a.invalidEmail;
      case "over_email_send_rate_limit":
        return a.tooManyAttempts;
      default:
        return dict.common.errorGeneric;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || busy) return;

    setError(null);
    setInfo(null);

    if (mode === "signup" && password.length < 8) {
      setError(a.weakPassword);
      return;
    }

    setBusy(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setInfo(
            locale === "ar"
              ? "تم إنشاء حسابك. تحقق من بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول."
              : "Your account has been created. Check your email to confirm your account before signing in."
          );
        }
      }
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!supabase || busy) return;

    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError(a.resetNeedsEmail);
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) throw error;

      setInfo(a.resetSent);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {isLogin ? a.loginTitle : a.signupTitle}
      </h1>

      <p className="mt-1 text-sm text-muted">
        {isLogin ? a.loginSubtitle : a.signupSubtitle}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {!isLogin && (
          <label className="block text-sm font-medium">
            {a.name}
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              dir="auto"
              required
            />
          </label>
        )}

        <label className="block text-sm font-medium">
          {a.email}
          <Input
            className="mt-1.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            dir="ltr"
            required
          />
        </label>

        <label className="block text-sm font-medium">
          {a.password}
          <Input
            className="mt-1.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? undefined : 8}
            dir="ltr"
            required
          />
          {!isLogin && (
            <span className="mt-1 block text-xs font-normal text-muted">
              {a.passwordHint}
            </span>
          )}
        </label>

        {isLogin && (
          <button
            type="button"
            onClick={resetPassword}
            disabled={busy}
            className="text-sm font-medium text-brand hover:underline disabled:opacity-50"
          >
            {a.forgotPassword}
          </button>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        {info && (
          <p
            role="status"
            className="rounded-xl border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success"
          >
            {info}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy
            ? isLogin
              ? a.signingIn
              : a.signingUp
            : isLogin
              ? a.login
              : a.signup}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {isLogin ? a.noAccount : a.haveAccount}{" "}
        <Link
          href={`/${locale}/${isLogin ? "signup" : "login"}`}
          className="font-medium text-brand hover:underline"
        >
          {isLogin ? a.signup : a.login}
        </Link>
      </p>
    </Card>
  );
}
