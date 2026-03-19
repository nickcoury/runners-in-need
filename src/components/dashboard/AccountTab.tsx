import { deliveryMethodLabels, VALID_DELIVERY_METHODS } from "../../lib/constants";

interface AccountTabProps {
  orgEmail: string;
  orgName: string;
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

export default function AccountTab({
  orgEmail,
  orgName,
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
}: AccountTabProps) {
  return (
    <div className="space-y-6" role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account">
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
          <p className="text-xs text-gray-500 mt-1">
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
            } else {
              const text = await res.text();
              alert(text || "Failed to save organization details. Please try again.");
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
              Location <span className="text-gray-500 font-normal">(City, State)</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Methods
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Select how donors can get gear to you. These defaults will be pre-selected on every new need you post.
            </p>
            <div className="space-y-2">
              {VALID_DELIVERY_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="deliveryMethods"
                    value={method}
                    defaultChecked={orgDeliveryMethods.includes(method)}
                    className="rounded border-gray-300 text-[#2D4A2D] focus:ring-[#2D4A2D]/30"
                  />
                  {deliveryMethodLabels[method]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Any additional details for donors about how to get gear to you (e.g., drop-off hours, contact info).
            </p>
            <textarea
              name="deliveryInstructions"
              defaultValue={orgDeliveryInstructions}
              rows={3}
              maxLength={2000}
              placeholder="e.g., Drop off at the school gym M-F 3-5pm. Ask for Coach Smith at the front office."
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
            } else {
              const text = await res.text();
              alert(text || "Failed to save shipping address. Please try again.");
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
              Attention Line <span className="text-gray-500 font-normal">(optional, e.g. "Attn: Coach Smith")</span>
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

      {userRole === "organizer" && orgId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg">
          <h3 className="text-sm font-semibold text-gray-900">
            Pledge Drive Gear
          </h3>
          <p className="text-xs text-gray-500">
            Opt in to receive gear collected at pledge drives in your area.
            When a drive is organized nearby, your organization will be eligible
            to receive donated gear.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pledgeDriveInterest"
              defaultChecked={orgPledgeDriveInterest}
              className="rounded border-gray-300 text-[#2D4A2D] focus:ring-[#2D4A2D]/30"
              onChange={async (e) => {
                const checked = e.target.checked;
                const data = new FormData();
                data.set("orgId", orgId);
                data.set("pledgeDriveInterest", checked ? "on" : "off");
                const res = await fetch("/api/org/pledge-drive-interest", {
                  method: "POST",
                  body: data,
                });
                if (res.ok) {
                  const label = document.getElementById("pledge-drive-saved");
                  if (label) {
                    label.textContent = "Saved!";
                    setTimeout(() => { label.textContent = ""; }, 2000);
                  }
                }
              }}
            />
            <label htmlFor="pledgeDriveInterest" className="text-sm text-gray-700">
              I'm interested in receiving pledge drive gear
            </label>
            <span id="pledge-drive-saved" className="text-xs text-green-600 ml-2"></span>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg">
        <button
          onClick={() => (window as any).signOut?.()}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white border border-red-200 rounded-lg p-6 space-y-3 max-w-lg">
        <h3 className="text-sm font-semibold text-red-700">
          Danger Zone
        </h3>
        <p className="text-xs text-gray-500">
          Permanently delete your account, withdraw all pledges, and remove your data. This cannot be undone.
        </p>
        <button
          onClick={async () => {
            if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
            if (!confirm("This will permanently delete your account, withdraw your pledges, and remove your data. Continue?")) return;
            const res = await fetch("/api/user/delete", { method: "POST" });
            if (res.ok) {
              window.location.href = "/?deleted=1";
            } else {
              alert("Failed to delete account. Please try again.");
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
