"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, LogOut, Moon, Sun } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { useAuth } from "@/components/shared/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useSyncedState } from "@/hooks/useSyncedState";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/cn";
import { format } from "@/lib/format";
import { buttonStyles } from "@/components/ui/Button";
import { locales, localeMeta } from "@/i18n/config";
import type { Profile } from "@/types";

type Notifications = { deadlines: boolean; daily: boolean; tips: boolean };

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function SettingsView() {
  const { locale, dict, theme, setTheme } = useApp();
  const s = dict.settings;
  const pathname = usePathname();
  const { configured, supabase, user } = useAuth();

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const [profile, setProfile, profileReady] = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useSyncedState<Notifications>("studymate-notifications", {
    deadlines: true,
    daily: false,
    tips: false,
  });

  useEffect(() => {
    if (profileReady) setDraft(profile);
    // Only sync once storage has been read; later edits stay in the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileReady]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const hrefFor = (target: string) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/");
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      name: draft.name.trim(),
      email: draft.email.trim(),
      university: draft.university.trim(),
    });
    setSaved(true);
  };

  const choice = (active: boolean) =>
    cn(
      "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
      active
        ? "border-brand bg-brand/10 text-brand"
        : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-fg"
    );

  const notifRows: { key: keyof Notifications; label: string }[] = [
    { key: "deadlines", label: s.notifDeadlines },
    { key: "daily", label: s.notifDaily },
    { key: "tips", label: s.notifTips },
  ];

  return (
    <>
      <PageHeader title={s.title} subtitle={s.subtitle} />

      <div className="mx-auto max-w-2xl space-y-5">
        <Section title={dict.auth.account}>
          {user ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" dir="auto">
                {format(dict.auth.signedInAs, { email: user.email ?? "" })}
              </p>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="rtl-flip size-4" aria-hidden />
                {dict.auth.signOut}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {configured ? dict.auth.signInToSync : dict.auth.demoAccount}
              </p>
              {configured && (
                <Link href={`/${locale}/login`} className={buttonStyles({ variant: "secondary" })}>
                  {dict.auth.login}
                </Link>
              )}
            </div>
          )}
        </Section>

        <Section title={s.language} hint={s.languageHint}>
          <div className="flex gap-3">
            {locales.map((l) =>
              l === locale ? (
                <span key={l} aria-current="true" className={choice(true)}>
                  <Check className="size-4" aria-hidden />
                  {localeMeta[l].label}
                </span>
              ) : (
                <Link
                  key={l}
                  href={hrefFor(l)}
                  hrefLang={l}
                  onClick={() => {
                    document.cookie = `studymate-locale=${l}; path=/; max-age=31536000; samesite=lax`;
                  }}
                  className={choice(false)}
                >
                  {localeMeta[l].label}
                </Link>
              )
            )}
          </div>
        </Section>

        <Section title={s.appearance} hint={s.appearanceHint}>
          <div className="flex gap-3">
            <button
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className={choice(theme === "light")}
            >
              <Sun className="size-4" aria-hidden />
              {s.light}
            </button>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={choice(theme === "dark")}
            >
              <Moon className="size-4" aria-hidden />
              {s.dark}
            </button>
          </div>
        </Section>

        <Section title={s.profile}>
          <form onSubmit={saveProfile} className="space-y-3">
            <label className="block text-sm font-medium">
              {s.name}
              <Input
                className="mt-1.5"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                dir="auto"
                autoComplete="name"
              />
            </label>
            <label className="block text-sm font-medium">
              {s.email}
              <Input
                className="mt-1.5"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                dir="ltr"
                autoComplete="email"
              />
            </label>
            <label className="block text-sm font-medium">
              {s.university}
              <Input
                className="mt-1.5"
                value={draft.university}
                onChange={(e) => setDraft({ ...draft, university: e.target.value })}
                dir="auto"
              />
            </label>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit">{s.saveProfile}</Button>
              {saved && (
                <span role="status" className="inline-flex items-center gap-1.5 text-sm text-success">
                  <Check className="size-4" aria-hidden />
                  {s.saved}
                </span>
              )}
            </div>
          </form>
        </Section>

        <Section title={s.notifications} hint={s.notificationsHint}>
          <ul className="divide-y divide-border">
            {notifRows.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={notif[key]}
                  label={label}
                  onChange={(value) => setNotif({ ...notif, [key]: value })}
                />
              </li>
            ))}
          </ul>
        </Section>

        <p className="text-center text-xs text-muted">{user ? "" : s.localNote}</p>
      </div>
    </>
  );
}
