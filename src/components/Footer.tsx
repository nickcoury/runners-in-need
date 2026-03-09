export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Runners in Need. All rights reserved.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Helping runners help runners.
          </p>
        </div>
      </div>
    </footer>
  );
}
