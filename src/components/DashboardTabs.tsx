import { useState } from "react";

type Tab = "needs" | "pledges" | "account";

interface Need {
  id: string;
  title: string;
  categoryTag: string;
  status: "active" | "fulfilled" | "expired";
  pledgeCount: number;
  daysLeft: number;
  location: string;
}

interface Pledge {
  id: string;
  needId: string;
  needTitle: string;
  donorName: string;
  donorEmail: string;
  description: string;
  status: "pending" | "accepted" | "declined" | "shipped" | "received";
  createdAt: string;
}

interface DashboardTabsProps {
  needs: Need[];
  pledges: Pledge[];
  orgName: string;
  orgEmail: string;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "needs", label: "My Needs" },
  { key: "pledges", label: "Incoming Pledges" },
  { key: "account", label: "Account" },
];

const categoryStyles: Record<string, string> = {
  shoes: "bg-[#2D4A2D] text-white",
  apparel: "bg-blue-600 text-white",
  accessories: "bg-amber-600 text-white",
  other: "bg-gray-500 text-white",
};

const categoryLabels: Record<string, string> = {
  shoes: "Shoes",
  apparel: "Apparel",
  accessories: "Accessories",
  other: "Other",
};

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  fulfilled: "Fulfilled",
  expired: "Expired",
};

const pledgeStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-600 border-red-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  received: "bg-[#2D4A2D]/10 text-[#2D4A2D] border-[#2D4A2D]/20",
};

const pledgeStatusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  shipped: "Shipped",
  received: "Received",
};

export default function DashboardTabs({
  needs,
  pledges,
  orgName,
  orgEmail,
}: DashboardTabsProps) {
  const [active, setActive] = useState<Tab>("needs");

  // Group pledges by needId
  const pledgesByNeed: Record<string, Pledge[]> = {};
  for (const p of pledges) {
    if (!pledgesByNeed[p.needId]) pledgesByNeed[p.needId] = [];
    pledgesByNeed[p.needId].push(p);
  }

  // Get unique need IDs that have pledges
  const needIdsWithPledges = Object.keys(pledgesByNeed);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.key
                ? "border-[#2D4A2D] text-[#2D4A2D]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Needs */}
      {active === "needs" && (
        <div>
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
                      statusStyles[need.status] || statusStyles.active
                    }`}
                  >
                    {statusLabels[need.status] || need.status}
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
                        : "text-gray-400"
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
                    <button className="text-xs text-red-500 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {needs.length === 0 && (
            <div className="border rounded-lg p-8 text-center text-gray-400">
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
      )}

      {/* Incoming Pledges */}
      {active === "pledges" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incoming Pledges
          </h2>

          {needIdsWithPledges.length === 0 && (
            <div className="border rounded-lg p-8 text-center text-gray-400">
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
                      className="hover:text-[#2D4A2D] hover:underline"
                    >
                      {needTitle}
                    </a>
                    <span className="text-gray-400 font-normal ml-2">
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
                            <p className="text-xs text-gray-400">
                              {pledge.donorEmail} &middot; {pledge.createdAt}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                              pledgeStatusStyles[pledge.status] ||
                              pledgeStatusStyles.pending
                            }`}
                          >
                            {pledgeStatusLabels[pledge.status] || pledge.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {pledge.description}
                        </p>

                        {pledge.status === "pending" && (
                          <div className="flex gap-2">
                            <button className="text-xs font-medium bg-[#2D4A2D] text-white px-3 py-1.5 rounded-lg hover:bg-[#1F361F] transition-colors">
                              Accept
                            </button>
                            <button className="text-xs font-medium border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              Decline
                            </button>
                            <button className="text-xs text-[#2D4A2D] hover:underline ml-auto">
                              Message Donor
                            </button>
                          </div>
                        )}

                        {pledge.status === "accepted" && (
                          <div className="flex gap-2">
                            <button className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                              Mark Shipped
                            </button>
                            <button className="text-xs text-[#2D4A2D] hover:underline ml-auto">
                              Message Donor
                            </button>
                          </div>
                        )}

                        {pledge.status === "shipped" && (
                          <div className="flex gap-2">
                            <button className="text-xs font-medium bg-[#2D4A2D] text-white px-3 py-1.5 rounded-lg hover:bg-[#1F361F] transition-colors">
                              Mark Received
                            </button>
                            <button className="text-xs text-[#2D4A2D] hover:underline ml-auto">
                              Message Donor
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
      )}

      {/* Account */}
      {active === "account" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Settings
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue={orgName}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={orgEmail}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            <p className="text-xs text-gray-400 pt-2">
              Account management coming soon. Contact us to update your
              organization details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
