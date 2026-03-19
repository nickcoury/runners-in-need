import {
  categoryStyles,
  categoryLabels,
  needStatusStyles,
  needStatusLabels,
} from "../../lib/constants";
import type { DashboardNeed } from "./types";

interface NeedsTabProps {
  needs: DashboardNeed[];
}

export default function NeedsTab({ needs }: NeedsTabProps) {
  return (
    <div role="tabpanel" id="tabpanel-needs" aria-labelledby="tab-needs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Posted Needs
        </h2>
        <a
          href="/post"
          className="bg-[#2D4A2D] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1F361F] transition-colors"
        >
          + Post New Need
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map((need) => (
          <div
            key={need.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col"
          >
            {/* Top row: category + status */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  categoryStyles[need.categoryTag] || categoryStyles.other
                }`}
              >
                {categoryLabels[need.categoryTag] || "Other"}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  needStatusStyles[need.status] || needStatusStyles.active
                }`}
              >
                {needStatusLabels[need.status] || need.status}
              </span>
            </div>

            {/* Title */}
            <a
              href={`/needs/${need.id}`}
              className="font-semibold text-gray-900 hover:text-[#2D4A2D] mb-1 line-clamp-2"
            >
              {need.title}
            </a>

            {/* Meta */}
            <p className="text-xs text-gray-500 mb-3">
              {need.location} &middot; {need.pledgeCount} pledge
              {need.pledgeCount !== 1 ? "s" : ""}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
              <span
                className={`text-xs ${
                  need.daysLeft <= 14 && need.status === "active"
                    ? "text-amber-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {need.status === "expired"
                  ? "Expired"
                  : need.status === "fulfilled"
                    ? "Fulfilled"
                    : `${need.daysLeft} days left`}
              </span>
              <div className="flex gap-2">
                <a
                  href={`/needs/${need.id}/edit`}
                  className="text-xs text-[#2D4A2D] hover:underline"
                >
                  Edit
                </a>
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={async () => {
                    if (!confirm("Are you sure you want to remove this need? It will be marked as expired.")) return;
                    try {
                      const res = await fetch(`/api/needs/${need.id}`, { method: "DELETE" });
                      if (res.ok || res.redirected) {
                        window.location.reload();
                      } else {
                        alert("Failed to delete need. Please try again.");
                      }
                    } catch {
                      alert("Something went wrong. Please check your connection.");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {needs.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p>You haven't posted any needs yet.</p>
          <a
            href="/post"
            className="inline-block mt-3 text-sm text-[#2D4A2D] hover:underline"
          >
            Post your first need
          </a>
        </div>
      )}
    </div>
  );
}
