import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RequestPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Request Gear
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Let us know what your team, school, or organization needs. We&apos;ll
            match you with available donations in your area.
          </p>

          <form className="mt-10 space-y-6">
            <div>
              <label htmlFor="org" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Organization Name
              </label>
              <input
                type="text"
                id="org"
                name="org"
                placeholder="e.g., Lincoln High School Track Team"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-zinc-900 dark:text-white">
                What do you need?
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
              <label htmlFor="description" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Description of Need
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Tell us about your team and what gear would help most..."
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sizeRange" className="block text-sm font-medium text-zinc-900 dark:text-white">
                  Size Range (if applicable)
                </label>
                <input
                  type="text"
                  id="sizeRange"
                  name="sizeRange"
                  placeholder="e.g., Youth 4–Adult 12"
                  className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-zinc-900 dark:text-white">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min={1}
                  defaultValue={1}
                  className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-zinc-900 dark:text-white">
                Urgency
              </label>
              <select
                id="urgency"
                name="urgency"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="low">Low — anytime works</option>
                <option value="medium">Medium — within a few weeks</option>
                <option value="high">High — season starting soon</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
