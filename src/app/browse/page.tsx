import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BrowsePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Browse Available Gear
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Find donated running gear available in your area.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            {["All", "Shoes", "Apparel", "Accessories", "Medals", "Electronics"].map(
              (filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {/* Empty state */}
          <div className="mt-16 text-center">
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              No gear listed yet.
            </p>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              Be the first to donate — listings will appear here.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
