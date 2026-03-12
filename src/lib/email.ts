import { Resend } from "resend";

const FROM_ADDRESS = "Runners In Need <notifications@runnersinneed.com>";

function getResend(): Resend | null {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

function getSiteUrl(): string {
  return import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321";
}

// ============================================================
// Core send function
// ============================================================

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] Resend not configured, skipping email to ${to}: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send email to ${to}:`, err);
  }
}

// ============================================================
// Shared layout wrapper
// ============================================================

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f4;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <div style="background:#2D4A2D;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${title}</h1>
    </div>
    <div style="padding:24px 32px;color:#333333;font-size:15px;line-height:1.6;">
      ${body}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e5e5;color:#999999;font-size:12px;">
      <a href="${getSiteUrl()}" style="color:#2D4A2D;text-decoration:none;">Runners In Need</a> &mdash; connecting donors with teams that need gear.
    </div>
  </div>
</body>
</html>`;
}

function needLink(needId: string, label: string): string {
  return `<a href="${getSiteUrl()}/needs/${needId}" style="color:#2D4A2D;text-decoration:underline;">${label}</a>`;
}

// ============================================================
// Template: Pledge received (sent to org)
// ============================================================

export async function sendPledgeReceivedEmail(
  orgEmail: string,
  needTitle: string,
  needId: string,
  donorName: string | null,
  pledgeDescription: string
): Promise<void> {
  const displayName = donorName || "An anonymous donor";
  const subject = `New pledge for "${needTitle}"`;
  const html = emailLayout(
    "New Pledge Received",
    `<p><strong>${displayName}</strong> has pledged to help with your need ${needLink(needId, `"${needTitle}"`)}.</p>
     <p style="background:#f8f8f8;padding:12px 16px;border-radius:4px;border-left:3px solid #2D4A2D;">
       ${pledgeDescription}
     </p>
     <p>Log in to your dashboard to view and manage this pledge.</p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/needs/${needId}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">View Need</a>
     </p>`
  );

  await sendEmail(orgEmail, subject, html);
}

// ============================================================
// Template: Pledge status changed (sent to donor)
// ============================================================

export async function sendPledgeStatusEmail(
  donorEmail: string,
  needTitle: string,
  needId: string,
  newStatus: string
): Promise<void> {
  const statusLabels: Record<string, string> = {
    collecting: "Collecting",
    ready_to_deliver: "Ready to Deliver",
    delivered: "Delivered",
    withdrawn: "Withdrawn",
  };

  const label = statusLabels[newStatus] || newStatus;
  const subject = `Your pledge for "${needTitle}" is now ${label}`;
  const html = emailLayout(
    "Pledge Status Update",
    `<p>Your pledge for ${needLink(needId, `"${needTitle}"`)} has been updated.</p>
     <p>New status: <strong style="color:#2D4A2D;">${label}</strong></p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/needs/${needId}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">View Details</a>
     </p>`
  );

  await sendEmail(donorEmail, subject, html);
}

// ============================================================
// Template: New message notification
// ============================================================

export async function sendMessageNotificationEmail(
  recipientEmail: string,
  needTitle: string,
  needId: string,
  senderName: string,
  messageBody: string
): Promise<void> {
  const subject = `New message about "${needTitle}"`;
  const html = emailLayout(
    "New Message",
    `<p><strong>${senderName}</strong> sent you a message about ${needLink(needId, `"${needTitle}"`)}:</p>
     <p style="background:#f8f8f8;padding:12px 16px;border-radius:4px;border-left:3px solid #2D4A2D;">
       ${messageBody}
     </p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/needs/${needId}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">Reply</a>
     </p>`
  );

  await sendEmail(recipientEmail, subject, html);
}
