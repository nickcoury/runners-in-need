import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            About Runners in Need
          </h1>

          <div className="mt-8 space-y-6 text-zinc-600 dark:text-zinc-400">
            <p>
              Running changes lives. But not everyone has access to the gear they
              need to get started or keep going. School track teams go without
              proper shoes. Community running groups lack basic equipment. New
              runners can&apos;t afford the essentials.
            </p>
            <p>
              At the same time, experienced runners accumulate gear — shoes with
              plenty of miles left, race shirts from every weekend 5K, finisher
              medals collecting dust in a drawer.
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-white">
                Runners in Need
              </strong>{" "}
              bridges that gap. We connect runners and running groups who have
              extra gear with schools, charity organizations, and individual
              athletes who need it.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-zinc-900 dark:text-white">
              Our Mission
            </h2>
            <p>
              To ensure that no runner is held back by a lack of equipment. Every
              pair of donated shoes is a chance for someone to discover the joy of
              running. Every race medal passed on is a story of inspiration.
            </p>

            <h2 className="pt-4 text-xl font-semibold text-zinc-900 dark:text-white">
              Who We Serve
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>High school and middle school track and cross country teams</li>
              <li>Community running clubs in underserved areas</li>
              <li>Youth athletic programs and nonprofits</li>
              <li>Individual runners who need a hand getting started</li>
              <li>Charity race organizations</li>
            </ul>

            <h2 className="pt-4 text-xl font-semibold text-zinc-900 dark:text-white">
              Get Involved
            </h2>
            <p>
              Whether you have a single pair of shoes to give or a garage full of
              race swag, every donation makes a difference. And if you know a team
              or runner who could use some gear, help them post a request.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
