import { useState, useEffect } from "react";
import NeedsTab from "./dashboard/NeedsTab";
import PledgesTab from "./dashboard/PledgesTab";
import AccountTab from "./dashboard/AccountTab";
import type { DashboardNeed, DashboardPledge } from "./dashboard/types";

type Tab = "needs" | "pledges" | "account";
const validTabs: Tab[] = ["needs", "pledges", "account"];

function getTabFromHash(defaultTab: Tab, allowedTabs: Tab[]): Tab {
  if (typeof window === "undefined") return defaultTab;
  const hash = window.location.hash.replace("#", "") as Tab;
  return allowedTabs.includes(hash) ? hash : defaultTab;
}

interface DashboardTabsProps {
  needs: DashboardNeed[];
  pledges: DashboardPledge[];
  orgName: string;
  orgEmail: string;
  orgLocation: string;
  orgDescription: string;
  orgId: string;
  orgShippingAddress: string;
  orgShippingAttn: string;
  orgShowShippingAddress: boolean;
  orgDeliveryMethods: string[];
  orgDeliveryInstructions: string;
  orgPledgeDriveInterest: boolean;
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
  orgDeliveryMethods,
  orgDeliveryInstructions,
  orgPledgeDriveInterest,
  userRole,
}: DashboardTabsProps) {
  const tabs = userRole === "organizer" ? organizerTabs : donorTabs;
  const allowedKeys = tabs.map((t) => t.key);
  const defaultTab = userRole === "organizer" ? "needs" : "pledges";
  const [active, setActive] = useState<Tab>(() => getTabFromHash(defaultTab, allowedKeys));

  useEffect(() => {
    const onHashChange = () => {
      setActive(getTabFromHash(defaultTab, allowedKeys));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => {
              window.location.hash = tab.key;
              setActive(tab.key);
            }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.key
                ? "border-[#2D4A2D] text-[#2D4A2D]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus-visible:text-gray-700 focus-visible:border-gray-300 focus-visible:outline-none"
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
            onClick={() => {
              window.location.hash = "account";
              setActive("account");
            }}
            className="font-medium underline hover:text-amber-900 focus-visible:text-amber-900 focus-visible:outline-none"
          >
            Update it in Account settings
          </button>
        </div>
      )}

      {active === "needs" && <NeedsTab needs={needs} />}
      {active === "pledges" && <PledgesTab pledges={pledges} userRole={userRole} />}
      {active === "account" && (
        <AccountTab
          orgEmail={orgEmail}
          orgName={orgName}
          orgLocation={orgLocation}
          orgDescription={orgDescription}
          orgId={orgId}
          orgShippingAddress={orgShippingAddress}
          orgShippingAttn={orgShippingAttn}
          orgShowShippingAddress={orgShowShippingAddress}
          orgDeliveryMethods={orgDeliveryMethods}
          orgDeliveryInstructions={orgDeliveryInstructions}
          orgPledgeDriveInterest={orgPledgeDriveInterest}
          userRole={userRole}
        />
      )}
    </div>
  );
}
