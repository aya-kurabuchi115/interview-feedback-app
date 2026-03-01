"use client";

import Link from "next/link";
import { LogOut, Menu, Mic, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = createClient();

      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
      };
      getUser();

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch {
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/");
    router.refresh();
  };

  const navItems = user
    ? [
        { href: "/dashboard", label: "ダッシュボード" },
        { href: "/profile", label: "プロフィール" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2 font-bold">
          <Mic className="h-5 w-5" />
          InterviewCoach
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
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
                    プロフィール
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">サインアップ</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-8 flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                {loading ? null : user ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">ログイン</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/signup">サインアップ</Link>
                    </Button>
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
