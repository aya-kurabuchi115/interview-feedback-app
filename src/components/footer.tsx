import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>&copy; {new Date().getFullYear()} InterviewCoach. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link
            href="/legal/privacy"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            プライバシーポリシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}
