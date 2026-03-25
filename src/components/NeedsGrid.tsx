import { useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { categoryStyles, categoryLabels } from "../lib/constants";

interface Need {
  id: string;
  orgId: string;
  title: string;
  categoryTag: string;
  body: string;
  orgName: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  extrasWelcome: boolean;
  expiresAt: string;
  pledgeCount: number;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="space-y-1.5 mb-3 flex-1">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-9 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

function NeedCard({ need }: { need: Need }) {
  const daysLeft = Math.ceil(
    (new Date(need.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const style = categoryStyles[need.categoryTag] || categoryStyles.other;
  const label = categoryLabels[need.categoryTag] || "Other";

  return (
    <div
      className="need-card bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:border-[#3D7A3D] transition-colors"
      data-testid="need-card"
      data-category={need.categoryTag}
      data-searchable={`${need.title} ${need.body} ${need.orgName} ${need.location}`.toLowerCase()}
      data-lat={need.lat ?? ""}
      data-lng={need.lng ?? ""}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${style}`}
          data-testid="need-card-category"
        >
          {label}
        </span>
        {need.extrasWelcome && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
            + Extras welcome
          </span>
        )}
      </div>
      <a
        href={`/needs/${need.id}`}
        className="font-semibold text-gray-900 hover:text-[#2D4A2D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:rounded mb-1 line-clamp-2"
      >
        {need.title}
      </a>
      <p
        className="text-xs text-gray-500 mb-2"
        data-testid="need-card-org-location"
      >
        <a
          href={`/org/${need.orgId}`}
          className="hover:text-[#2D4A2D] hover:underline focus:outline-none focus-visible:text-[#2D4A2D] focus-visible:underline"
        >
          {need.orgName}
        </a>{" "}
        &middot; {need.location}
      </p>
      <p className="text-sm text-gray-600 line-clamp-3 mb-3 whitespace-pre-line flex-1">
        {need.body}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>
          {need.pledgeCount} pledge{need.pledgeCount !== 1 ? "s" : ""}
        </span>
        <span
          className={
            daysLeft <= 0
              ? "text-red-600 font-medium"
              : daysLeft <= 14
                ? "text-amber-700 font-medium"
                : ""
          }
        >
          {daysLeft <= 0
            ? "Expired"
            : daysLeft === 1
              ? "1 day left"
              : `${daysLeft} days left`}
        </span>
      </div>
      <a
        href={`/needs/${need.id}`}
        className="block text-center bg-[#2D4A2D] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#1F361F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:ring-offset-2 transition-colors"
      >
        View Need
      </a>
    </div>
  );
}

function NeedsGridInner() {
  const [needs, setNeeds] = useState<Need[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/needs")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then(setNeeds)
      .catch(() => setError(true));
  }, []);

  // Notify browse.ts that cards are ready for filtering
  useEffect(() => {
    if (needs) {
      window.dispatchEvent(new CustomEvent("needs-loaded"));
    }
  }, [needs]);

  if (error) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-2 text-gray-700">
          Something went wrong
        </p>
        <p className="text-sm mb-4">Unable to load needs. Please try again.</p>
        <button
          onClick={() => {
            setError(false);
            setNeeds(null);
            fetch("/api/needs")
              .then((r) => r.json())
              .then(setNeeds)
              .catch(() => setError(true));
          }}
          className="inline-block bg-[#2D4A2D] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1F361F] focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!needs) {
    return (
      <div aria-busy="true" role="status">
        <span className="sr-only">Loading needs...</span>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (needs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-2 text-gray-700">
          No needs posted yet
        </p>
        <p className="text-sm mb-6 max-w-md mx-auto">
          When running organizations post gear needs, they'll appear here. If
          you run a program that serves runners, you can post what your athletes
          need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/become-organizer"
            className="inline-block bg-[#2D4A2D] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1F361F] focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
          >
            Become an Organizer
          </a>
          <a
            href="/about"
            className="inline-block border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:border-[#2D4A2D] hover:text-[#2D4A2D] focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {needs.map((need) => (
          <NeedCard key={need.id} need={need} />
        ))}
      </div>
      <div id="no-results" className="hidden text-center py-12 text-gray-500">
        <p className="text-lg font-medium mb-1">No results found</p>
        <p className="text-sm">
          Try adjusting your search or category filter.
        </p>
      </div>
    </>
  );
}

export default function NeedsGrid() {
  return (
    <ErrorBoundary>
      <NeedsGridInner />
    </ErrorBoundary>
  );
}
