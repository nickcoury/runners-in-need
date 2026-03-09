import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DonatePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Donate Gear
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            List running gear you&apos;d like to donate. Your contribution helps
            runners in need get the equipment they deserve.
          </p>

          <form className="mt-10 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Item Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g., Nike Pegasus 40 — Size 10"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">Select a category</option>
                <option value="shoes">Shoes</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="medals">Race Medals</option>
                <option value="electronics">Electronics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">Select condition</option>
                <option value="new">New (unused)</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the item, including size, color, and any wear details..."
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min={1}
                defaultValue={1}
                className="mt-2 w-32 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              List Item for Donation
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
