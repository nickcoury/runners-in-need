import { useState } from "react";

type Tab = "needs" | "pledges" | "account";

interface Need {
  id: string;
  title: string;
  categoryTag: string;
  status: string;
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
  status: string;
  createdAt: string;
}

interface DashboardTabsProps {
  needs: Need[];
  pledges: Pledge[];
  orgName: string;
  orgEmail: string;
  orgLocation: string;
  orgDescription: string;
  orgId: string;
  orgShippingAddress: string;
  orgShippingAttn: string;
  orgShowShippingAddress: boolean;
  userId: string;
  userRole: string;
}

const organizerTabs: { key: Tab; label: string }[] = [
  { key: "needs", label: "My Needs" },
  { key: "pledges", label: "Incoming Pledges" },
  { key: "account", label: "Account" },
];

const donorTabs: { key: Tab; label: string }[] = [
  { key: "pledges", label: "My Pledges" },
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
  partially_fulfilled: "bg-amber-50 text-amber-700 border-amber-200",
  fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  partially_fulfilled: "Partially Fulfilled",
  fulfilled: "Fulfilled",
  expired: "Expired",
};

const pledgeStatusStyles: Record<string, string> = {
  collecting: "bg-amber-50 text-amber-700 border-amber-200",
  ready_to_deliver: "bg-green-50 text-green-700 border-green-200",
  delivered: "bg-blue-50 text-blue-700 border-blue-200",
  withdrawn: "bg-red-50 text-red-600 border-red-200",
};

const pledgeStatusLabels: Record<string, string> = {
  collecting: "Collecting",
  ready_to_deliver: "Ready to Deliver",
  delivered: "Delivered",
  withdrawn: "Withdrawn",
};

export default function DashboardTabs({
  needs,
  pledges,
  orgName,
  orgEmail,
  orgLocation,
  orgDescription,
  orgId,
  orgShippingAddress,
  orgShippingAttn,
  orgShowShippingAddress,
  userId,
  userRole,
}: DashboardTabsProps) {
  const tabs = userRole === "organizer" ? organizerTabs : donorTabs;
  const [active, setActive] = useState<Tab>(userRole === "organizer" ? "needs" : "pledges");
  const [pledgeStatuses, setPledgeStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(pledges.map((p) => [p.id, p.status]))
  );
  const [updating, setUpdating] = useState<string | null>(null);

  async function updatePledgeStatus(pledgeId: string, newStatus: string) {
    setUpdating(pledgeId);
    try {
      const form = new FormData();
      form.set("pledgeId", pledgeId);
      form.set("userId", userId);
      form.set("status", newStatus);
      const res = await fetch("/_actions/updatePledgeStatus", { method: "POST", body: form });
      if (res.ok) {
        setPledgeStatuses((prev) => ({ ...prev, [pledgeId]: newStatus }));
      }
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

      {/* TBD location warning */}
      {userRole === "organizer" && orgLocation === "TBD" && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your organization location is set to <strong>TBD</strong>. Needs you post will inherit this placeholder.{" "}
          <button
            onClick={() => setActive("account")}
            className="font-medium underline hover:text-amber-900"
          >
            Update it in Account settings
          </button>
        </div>
      )}

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
                    <button
                      className="text-xs text-red-500 hover:underline"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to remove this need? It will be marked as expired.")) return;
                        const form = new FormData();
                        const res = await fetch(`/api/needs/${need.id}`, { method: "DELETE" });
                        if (res.ok || res.redirected) {
                          window.location.reload();
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
                              className="text-xs font-medium bg-[#2D4A2D] text-white px-3 py-1.5 rounded-lg hover:bg-[#1F361F] transition-colors disabled:opacity-50"
                            >
                              {updating === pledge.id ? "Updating..." : "Mark Ready to Deliver"}
                            </button>
                            <button
                              disabled={updating === pledge.id}
                              onClick={() => updatePledgeStatus(pledge.id, "withdrawn")}
                              className="text-xs font-medium border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                              className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
      )}

      {/* Account */}
      {active === "account" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Settings
          </h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg">
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
              <p className="text-xs text-gray-400 mt-1">
                Managed by your sign-in provider
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <span className="inline-block text-sm capitalize bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                {userRole}
              </span>
            </div>
          </div>

          {userRole === "organizer" && orgId && (
            <form
              className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const res = await fetch("/api/org/update", {
                  method: "POST",
                  body: data,
                });
                if (res.ok) {
                  const btn = form.querySelector("button[type=submit]") as HTMLButtonElement;
                  btn.textContent = "Saved!";
                  setTimeout(() => { btn.textContent = "Save Changes"; }, 2000);
                }
              }}
            >
              <h3 className="text-sm font-semibold text-gray-900">
                Organization Details
              </h3>
              <input type="hidden" name="orgId" value={orgId} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={orgName}
                  required
                  minLength={2}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-gray-400 font-normal">(City, State)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={orgLocation}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={orgDescription}
                  rows={3}
                  maxLength={2000}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
                />
              </div>

              <button
                type="submit"
                className="bg-[#2D4A2D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1F361F] transition-colors"
              >
                Save Changes
              </button>
            </form>
          )}

          {userRole === "organizer" && orgId && (
            <form
              className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                data.set("orgId", orgId);
                const res = await fetch("/api/org/shipping", {
                  method: "POST",
                  body: data,
                });
                if (res.ok) {
                  const btn = form.querySelector("button[type=submit]") as HTMLButtonElement;
                  btn.textContent = "Saved!";
                  setTimeout(() => { btn.textContent = "Save Shipping Address"; }, 2000);
                }
              }}
            >
              <h3 className="text-sm font-semibold text-gray-900">
                Shipping Address
              </h3>
              <p className="text-xs text-gray-500">
                Provide an address where donors can ship gear. When visible, this address appears on your posted needs.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attention Line <span className="text-gray-400 font-normal">(optional, e.g. "Attn: Coach Smith")</span>
                </label>
                <input
                  type="text"
                  name="shippingAttn"
                  defaultValue={orgShippingAttn}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  name="shippingAddress"
                  defaultValue={orgShippingAddress}
                  rows={3}
                  maxLength={500}
                  placeholder={"123 Main St\nSuite 100\nPortland, OR 97201"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showShippingAddress"
                  id="showShippingAddress"
                  defaultChecked={orgShowShippingAddress}
                  className="rounded border-gray-300 text-[#2D4A2D] focus:ring-[#2D4A2D]/30"
                />
                <label htmlFor="showShippingAddress" className="text-sm text-gray-700">
                  Show shipping address on my posted needs
                </label>
              </div>

              <button
                type="submit"
                className="bg-[#2D4A2D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1F361F] transition-colors"
              >
                Save Shipping Address
              </button>
            </form>
          )}

          <div className="max-w-lg">
            <button
              onClick={async () => {
                try {
                  const csrfRes = await fetch('/api/auth/csrf');
                  const { csrfToken } = await csrfRes.json();
                  const form = new FormData();
                  form.set('csrfToken', csrfToken);
                  await fetch('/api/auth/signout', { method: 'POST', body: form });
                  window.location.href = '/';
                } catch {
                  window.location.href = '/api/auth/signout';
                }
              }}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
