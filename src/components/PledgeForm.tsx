import { useState } from "react";

interface PledgeFormProps {
  needId: string;
  userEmail?: string;
  userName?: string;
}

export default function PledgeForm({
  needId,
  userEmail,
  userName,
}: PledgeFormProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-sm text-green-800">
        <p className="font-medium">Pledge submitted!</p>
        <p className="mt-1">
          The organizer will be notified. You'll receive updates at the email
          you provided.
        </p>
      </div>
    );
  }

  return (
    <form
      method="POST"
      action="/api/pledges"
      className="space-y-4 border rounded-lg p-4"
      onSubmit={() => setSubmitted(true)}
    >
      <input type="hidden" name="needId" value={needId} />

      <h3 className="font-semibold text-gray-900">Pledge Gear</h3>
      <p className="text-sm text-gray-500">
        Tell the organizer what you can provide. You'll coordinate delivery
        details via messaging after your pledge.
      </p>

      {!userEmail && (
        <>
          <div>
            <label
              htmlFor="donorName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your name (optional)
            </label>
            <input
              id="donorName"
              name="donorName"
              type="text"
              defaultValue={userName}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="donorEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your email
            </label>
            <input
              id="donorEmail"
              name="donorEmail"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>
        </>
      )}
      {userEmail && <input type="hidden" name="donorEmail" value={userEmail} />}

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          What can you provide?
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="e.g., I have 3 pairs of men's running shoes (sizes 9, 9.5, 10), lightly used Nike and Brooks. Happy to ship or drop off."
        />
      </div>

      <button
        type="submit"
        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm"
      >
        Submit Pledge
      </button>
    </form>
  );
}
