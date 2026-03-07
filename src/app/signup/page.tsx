"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { PasswordStrength } from "@/components/ui/password-strength";
import { PasswordInput } from "@/components/ui/password-input";
import { t } from "@/lib/i18n";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError(t("auth.termsRequired"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError(t("auth.alreadyRegistered"));
        } else {
          setError(t("auth.signupFailed"));
        }
        return;
      }

      setEmailSent(true);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  // メール送信完了画面
  if (emailSent) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t("auth.confirmEmail")}</CardTitle>
            <CardDescription className="mt-2 text-base">
              <span className="font-medium text-foreground">{email}</span>
              {" "}{t("auth.confirmEmailSent")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p className="mb-2">{t("auth.confirmEmailInstruction")}</p>
              <p>{t("auth.confirmEmailSpam")}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              {t("auth.useAnotherEmail")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("auth.login")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* 左パネル: 訴求エリア */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="/images/hero-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(17, 34, 64, 0.8)' }} />
        <div className="relative z-10 flex h-full flex-col justify-center px-16 xl:px-24">
          <img src="/images/logo.png" alt="Menpass" className="mb-8 h-8 w-auto self-start brightness-0 invert" />
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            声に出して練習する、
            <br />
            AI面接コーチ。
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300">
            回答内容・話し方・論理構成をAIが多角的に分析し、
            具体的な改善アクションを提示します。
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              4.8 平均評価
            </span>
            <span>92% 利用者満足度</span>
          </div>
        </div>
      </div>

      {/* 右パネル: フォーム */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="text-center">
            <img src="/images/logo.png" alt="Menpass" className="mx-auto mb-4 h-8 w-auto lg:hidden" />
            <CardTitle className="text-2xl">{t("auth.signupTitle")}</CardTitle>
            <CardDescription>
              {t("auth.signupDescription")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <CardContent className="space-y-4">
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <PasswordStrength password={password} />
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <Label
                  htmlFor="agree"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {t("auth.termsOfService")}
                  </Link>
                  と
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {t("auth.privacyPolicy")}
                  </Link>
                  {t("auth.agreeTerms")}
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="h-12 w-full text-base font-bold"
                disabled={loading || !agreed}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t("auth.signupLoading") : t("auth.signup")}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t("auth.hasAccount")}{" "}
                <Link href="/login" className="text-primary hover:underline">
                  {t("auth.login")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
