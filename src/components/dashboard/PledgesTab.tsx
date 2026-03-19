import { useState } from "react";
import {
  pledgeStatusStyles,
  pledgeStatusLabels,
} from "../../lib/constants";
import type { DashboardPledge } from "./types";

interface PledgesTabProps {
  pledges: DashboardPledge[];
}

export default function PledgesTab({ pledges }: PledgesTabProps) {
  const [pledgeStatuses, setPledgeStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(pledges.map((p) => [p.id, p.status]))
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updatePledgeStatus(pledgeId: string, newStatus: string) {
    setUpdating(pledgeId);
    setError(null);
    try {
      const form = new FormData();
      form.set("pledgeId", pledgeId);
      form.set("status", newStatus);
      const res = await fetch("/_actions/updatePledgeStatus", { method: "POST", body: form });
      if (res.ok) {
        setPledgeStatuses((prev) => ({ ...prev, [pledgeId]: newStatus }));
      } else {
        setError("Failed to update pledge status. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setUpdating(null);
    }
  }

  // Group pledges by needId
  const pledgesByNeed: Record<string, Pledge[]> = {};
  for (const p of pledges) {
    if (!pledgesByNeed[p.needId]) pledgesByNeed[p.needId] = [];
    pledgesByNeed[p.needId].push(p);
  }

  const needIdsWithPledges = Object.keys(pledgesByNeed);

  return (
    <div role="tabpanel" id="tabpanel-pledges" aria-labelledby="tab-pledges">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Incoming Pledges
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 focus-visible:text-red-600 focus-visible:outline-none ml-4" aria-label="Dismiss error">
            &times;
          </button>
        </div>
      )}

      {needIdsWithPledges.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p>No pledges yet. They'll appear here when donors respond to your needs.</p>
        </div>
      )}

      <div className="space-y-6">
        {needIdsWithPledges.map((needId) => {
          const needPledges = pledgesByNeed[needId];
          const needTitle =
            needPledges[0]?.needTitle || "Unknown need";
          return (
            <div key={needId}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                <a
                  href={`/needs/${needId}`}
                  className="hover:text-[#2D4A2D] hover:underline focus-visible:text-[#2D4A2D] focus-visible:underline focus-visible:outline-none"
                >
                  {needTitle}
                </a>
                <span className="text-gray-500 font-normal ml-2">
                  ({needPledges.length} pledge
                  {needPledges.length !== 1 ? "s" : ""})
                </span>
              </h3>

              <div className="space-y-3">
                {needPledges.map((pledge) => (
                  <div
                    key={pledge.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pledge.donorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pledge.donorEmail} &middot; {pledge.createdAt}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          pledgeStatusStyles[pledgeStatuses[pledge.id] || pledge.status] ||
                          pledgeStatusStyles.collecting
                        }`}
                      >
                        {pledgeStatusLabels[pledgeStatuses[pledge.id] || pledge.status] || pledge.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {pledge.description}
                    </p>

                    {(pledgeStatuses[pledge.id] || pledge.status) === "collecting" && (
                      <div className="flex gap-2">
                        <button
                          disabled={updating === pledge.id}
                          onClick={() => updatePledgeStatus(pledge.id, "ready_to_deliver")}
                          className="text-xs font-medium bg-[#2D4A2D] text-white px-3 py-1.5 rounded-lg hover:bg-[#1F361F] focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:outline-none transition-colors disabled:opacity-50"
                        >
                          {updating === pledge.id ? "Updating..." : "Mark Ready to Deliver"}
                        </button>
                        <button
                          disabled={updating === pledge.id}
                          onClick={() => updatePledgeStatus(pledge.id, "withdrawn")}
                          className="text-xs font-medium border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:outline-none transition-colors disabled:opacity-50"
                        >
                          Withdraw
                        </button>
                      </div>
                    )}

                    {(pledgeStatuses[pledge.id] || pledge.status) === "ready_to_deliver" && (
                      <div className="flex gap-2">
                        <button
                          disabled={updating === pledge.id}
                          onClick={() => updatePledgeStatus(pledge.id, "delivered")}
                          className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:outline-none transition-colors disabled:opacity-50"
                        >
                          {updating === pledge.id ? "Updating..." : "Mark Delivered"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
