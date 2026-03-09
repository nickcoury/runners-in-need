import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
          Runners in Need
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/browse"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Browse Gear
          </Link>
          <Link
            href="/donate"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Donate
          </Link>
          <Link
            href="/request"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Request Gear
          </Link>
          <Link
            href="/about"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
