import { useState, useEffect, useRef } from "react";

import { deliveryMethodLabels } from "../lib/constants";

interface PledgeFormProps {
  needId: string;
  userEmail?: string;
  userName?: string;
  turnstileSiteKey?: string;
  deliveryMethods?: string[];
  deliveryInstructions?: string;
  shippingAddress?: string;
  shippingAttn?: string;
}

export default function PledgeForm({
  needId,
  userEmail,
  userName,
  turnstileSiteKey,
  deliveryMethods = [],
  deliveryInstructions = "",
  shippingAddress = "",
  shippingAttn = "",
}: PledgeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
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
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
        });
      }
    };
    window.onTurnstileLoad = render;
    // If script already loaded
    if (window.turnstile) render();
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.focus();
    }
  }, [submitted]);

  if (submitted) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border border-green-200 bg-green-50 rounded-lg p-4 text-sm text-green-800 outline-none">
        <p className="font-medium">Pledge submitted!</p>
        <p className="mt-2 font-medium">Here's what happens next:</p>
        <ol className="mt-1 list-decimal list-inside space-y-1">
          <li>The organizer will review your pledge</li>
          <li>Once delivered, the need will be marked fulfilled</li>
        </ol>
        {deliveryMethods.length > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="font-medium mb-1">How to get gear to them:</p>
            <ul className="space-y-1">
              {deliveryMethods.map((method) => (
                <li key={method} className="flex items-center gap-1.5">
                  <span>&#x2713;</span> {deliveryMethodLabels[method] || method}
                </li>
              ))}
            </ul>
            {deliveryInstructions && (
              <p className="mt-2 text-green-700 whitespace-pre-line">{deliveryInstructions}</p>
            )}
            {deliveryMethods.includes("shipping") && shippingAddress && (
              <div className="mt-2 bg-green-100/50 rounded px-3 py-2">
                <p className="text-xs font-medium text-green-800 mb-0.5">Ship to:</p>
                {shippingAttn && <p className="font-medium">{shippingAttn}</p>}
                <p className="whitespace-pre-line">{shippingAddress}</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-3">
          {userEmail && (
            <a href="/dashboard" className="font-medium text-green-700 hover:text-green-900 focus-visible:text-green-900 focus-visible:outline-none underline">
              View your pledges &rarr;
            </a>
          )}
          <a href="/" className="font-medium text-green-700 hover:text-green-900 focus-visible:text-green-900 focus-visible:outline-none underline">
            Browse more needs &rarr;
          </a>
        </div>
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit pledge");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to submit pledge"
        ? err.message
        : "Something went wrong. Please try again.");
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
              autoComplete="name"
            />
          </div>
          <div>
            <label
              htmlFor="donorEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your email <span className="text-red-600">*</span>
            </label>
            <input
              id="donorEmail"
              name="donorEmail"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
              autoComplete="email"
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
          What can you provide? <span className="text-red-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D4A2D]/30 focus:border-[#2D4A2D]"
          placeholder="e.g., I have 3 pairs of men's running shoes (sizes 9, 9.5, 10), lightly used Nike and Brooks. Happy to ship or drop off."
        />
      </div>

      {turnstileSiteKey && (
        <div ref={turnstileRef} aria-label="Human verification" />
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-[#2D4A2D] text-white px-4 py-2 rounded-lg hover:bg-[#1F361F] focus-visible:ring-2 focus-visible:ring-[#2D4A2D]/50 focus-visible:ring-offset-2 focus-visible:outline-none text-sm disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Pledge"}
      </button>
    </form>
  );
}
