"use client";

import Link from "next/link";
import { CreditCard, LogOut, Menu, Mic, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/i18n";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // オンボーディング完了チェック
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .single();
          setOnboardingCompleted(
            !!(profile as { onboarding_completed?: boolean } | null)?.onboarding_completed
          );
        }

        setLoading(false);
      };
      getUser();

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setOnboardingCompleted(false);
        }
      });
      subscription = data.subscription;
    } catch {
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/");
    router.refresh();
  };

  const pathname = usePathname();

  // オンボーディング完了後のみ表示するナビ
  const navItems = user && onboardingCompleted
    ? [
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/dashboard/growth", label: t("nav.growthRecord") },
        { href: "/help", label: "ヘルプ" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center">
          <img src="/images/logo.png" alt="Menpass" className="h-7 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center gap-4 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive
                    ? "text-foreground border-b-2 border-[var(--brand-orange)] pb-0.5"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user && <ThemeToggle />}
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("nav.planManagement")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("auth.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t("auth.freeTrialCta")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 items-center justify-end gap-1 md:hidden">
          {user && <ThemeToggle />}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="メニューを開く">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="sr-only">メニュー</SheetTitle>
              <nav className="mt-6 flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                          isActive ? "text-[var(--brand-orange)] font-bold" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                <div className="my-2 border-t" />
                {loading ? null : user ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/settings/billing"
                        className="text-sm font-medium transition-colors hover:text-primary"
                      >
                        {t("nav.planManagement")}
                      </Link>
                    </SheetClose>
                    <div className="my-2 border-t" />
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("auth.logout")}
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">{t("auth.login")}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button size="sm" asChild>
                        <Link href="/signup">{t("auth.freeTrialCta")}</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
