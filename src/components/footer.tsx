import Link from "next/link";
import { t } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>&copy; {new Date().getFullYear()} InterviewCoach. All rights reserved.</p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link
            href="/legal/terms"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("footer.termsOfService")}
          </Link>
          <Link
            href="/legal/privacy"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("footer.privacyPolicy")}
          </Link>
          <Link
            href="/legal/cookies"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("footer.cookiePolicy")}
          </Link>
          <Link
            href="/legal/tokushoho"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("footer.tokushoho")}
          </Link>
          <Link
            href="/help"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("footer.help")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
