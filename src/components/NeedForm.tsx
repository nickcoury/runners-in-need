import { useState } from "react";
import { needTemplates, type CategoryTag } from "../lib/templates";

interface NeedFormProps {
  orgId: string;
  continuedFromId?: string;
  initialBody?: string;
}

export default function NeedForm({
  orgId,
  continuedFromId,
  initialBody,
}: NeedFormProps) {
  const [categoryTag, setCategoryTag] = useState<CategoryTag>("shoes");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(initialBody || "");
  const [extrasWelcome, setExtrasWelcome] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [submitting, setSubmitting] = useState(false);

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
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe what your runners need. Click a category above for a template."
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-gray-400 mt-1">
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

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
      >
        {submitting ? "Posting..." : continuedFromId ? "Post Remaining Need" : "Post Need"}
      </button>
    </form>
  );
}
