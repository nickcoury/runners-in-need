import { useState, useEffect, useRef } from "react";

interface PledgeFormProps {
  needId: string;
  userEmail?: string;
  userName?: string;
  turnstileSiteKey?: string;
}

export default function PledgeForm({
  needId,
  userEmail,
  userName,
  turnstileSiteKey,
}: PledgeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;
    // Load Turnstile script if not already present
    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      document.head.appendChild(script);
    }
    // Render widget
    const render = () => {
      if ((window as any).turnstile && turnstileRef.current) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
        });
      }
    };
    (window as any).onTurnstileLoad = render;
    // If script already loaded
    if ((window as any).turnstile) render();
  }, [turnstileSiteKey]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    if (turnstileSiteKey && turnstileToken) {
      data.set("cf-turnstile-response", turnstileToken);
    }
    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to submit pledge");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4 border rounded-lg p-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="needId" value={needId} />

      {/* Honeypot field — hidden from real users, bots will fill it in */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
          minLength={5}
          maxLength={2000}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="e.g., I have 3 pairs of men's running shoes (sizes 9, 9.5, 10), lightly used Nike and Brooks. Happy to ship or drop off."
        />
      </div>

      {turnstileSiteKey && (
        <div ref={turnstileRef} />
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Pledge"}
      </button>
    </form>
  );
}
