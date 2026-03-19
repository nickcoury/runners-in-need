import { useState } from "react";
import { needTemplates, type CategoryTag } from "../lib/templates";
import { deliveryMethodLabels, VALID_DELIVERY_METHODS } from "../lib/constants";

interface NeedFormProps {
  orgId: string;
  continuedFromId?: string;
  initialBody?: string;
  orgDeliveryMethods?: string[];
  orgDeliveryInstructions?: string;
}

export default function NeedForm({
  orgId,
  continuedFromId,
  initialBody,
  orgDeliveryMethods = [],
  orgDeliveryInstructions = "",
}: NeedFormProps) {
  const [categoryTag, setCategoryTag] = useState<CategoryTag>("shoes");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(initialBody || "");
  const [extrasWelcome, setExtrasWelcome] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>(orgDeliveryMethods);
  const [deliveryInstructions, setDeliveryInstructions] = useState(orgDeliveryInstructions);

  function insertTemplate(tag: CategoryTag) {
    setCategoryTag(tag);
    if (!body || body === needTemplates[categoryTag]?.example) {
      setBody(needTemplates[tag].example);
    }
  }

  return (
    <form method="POST" action="/api/needs" className="space-y-6" onSubmit={() => setSubmitting(true)}>
      <input type="hidden" name="orgId" value={orgId} />
      {continuedFromId && (
        <input type="hidden" name="continuedFromId" value={continuedFromId} />
      )}

      {/* Category templates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(needTemplates) as [CategoryTag, (typeof needTemplates)[CategoryTag]][]).map(
            ([tag, tmpl]) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTemplate(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  categoryTag === tag
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-700 border-gray-300 hover:border-green-700"
                }`}
              >
                {tmpl.icon} {tmpl.label}
              </button>
            ),
          )}
        </div>
        <input type="hidden" name="categoryTag" value={categoryTag} />
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Running shoes for Wilson High cross country team"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          What do you need?
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={10}
          maxLength={5000}
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe what your runners need. Click a category above for a template."
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include sizes, quantities, and any condition preferences.
        </p>
      </div>

      {/* Extras welcome */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="extrasWelcome"
          checked={extrasWelcome}
          onChange={(e) => setExtrasWelcome(e.target.checked)}
          className="rounded border-gray-300"
        />
        <span>
          Extras welcome — additional items beyond the specific request are
          useful
        </span>
      </label>

      {/* Delivery methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Methods
        </label>
        <p className="text-xs text-gray-500 mb-2">
          How can donors get gear to you? Pre-filled from your org preferences.
        </p>
        <div className="space-y-2">
          {VALID_DELIVERY_METHODS.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="deliveryMethods"
                value={method}
                checked={deliveryMethods.includes(method)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDeliveryMethods([...deliveryMethods, method]);
                  } else {
                    setDeliveryMethods(deliveryMethods.filter((m) => m !== method));
                  }
                }}
                className="rounded border-gray-300"
              />
              {deliveryMethodLabels[method]}
            </label>
          ))}
        </div>
      </div>

      {/* Delivery instructions */}
      <div>
        <label
          htmlFor="deliveryInstructions"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Delivery Instructions <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="deliveryInstructions"
          name="deliveryInstructions"
          maxLength={2000}
          rows={3}
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          placeholder="e.g., Drop off at the school gym M-F 3-5pm. Ask for Coach Smith."
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Expiration */}
      <div>
        <label
          htmlFor="expiresInDays"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Expires in
        </label>
        <select
          id="expiresInDays"
          name="expiresInDays"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value={30}>1 month</option>
          <option value={60}>2 months</option>
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2D4A2D] text-white px-6 py-2 rounded-lg hover:bg-[#1F361F] text-sm disabled:opacity-50"
        >
          {submitting ? "Posting..." : continuedFromId ? "Post Remaining Need" : "Post Need"}
        </button>
        <a
          href="/dashboard"
          className="px-6 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
