import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Every runner deserves the right gear.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Connect with schools, charities, and athletes who need running gear.
            Donate your lightly used shoes, apparel, and race medals to runners
            who will put them to good use.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/donate"
              className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Donate Gear
            </Link>
            <Link
              href="/request"
              className="rounded-full border border-zinc-300 px-8 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
            >
              Request Gear
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
              How it works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Step
                number={1}
                title="List or Request"
                description="Donors list gear they want to give away. Organizations and athletes post what they need."
              />
              <Step
                number={2}
                title="Get Matched"
                description="We match available gear with nearby requests based on location, size, and category."
              />
              <Step
                number={3}
                title="Connect & Deliver"
                description="Donors and recipients coordinate pickup or shipping to get gear where it's needed."
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
            What you can donate
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryCard title="Running Shoes" description="Trail, road, track — all types welcome in any condition." />
            <CategoryCard title="Apparel" description="Shirts, shorts, jackets, socks, and other running clothing." />
            <CategoryCard title="Accessories" description="Hydration packs, belts, headbands, gloves, and more." />
            <CategoryCard title="Race Medals" description="Give your medals a second life inspiring the next generation." />
            <CategoryCard title="Electronics" description="GPS watches, heart rate monitors, and other running tech." />
            <CategoryCard title="Other Gear" description="Cones, bibs, timing equipment, and team supplies." />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white dark:bg-white dark:text-zinc-900">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function CategoryCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
