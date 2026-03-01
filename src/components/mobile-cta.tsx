"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MobileCTA() {
  const pathname = usePathname();
  const [user, setUser] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = createClient();
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(!!user);
      };
      getUser();

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(!!session?.user);
      });
      subscription = data.subscription;
    } catch {
      setUser(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  // スクロール方向検知：下スクロールで非表示、上スクロールで再表示
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // LPページのみ、未ログインユーザーのみ表示
  if (pathname !== "/" || user === null || user === true) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-3 backdrop-blur transition-transform duration-300 md:hidden supports-[backdrop-filter]:bg-background/80 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Button asChild className="w-full py-5 text-base font-semibold">
        <Link href="/signup">
          3分で無料体験
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}
