import { Resend } from "resend";
import { getEnv } from "./env";
import { escapeHtml } from "./html";

const FROM_ADDRESS = "Runners In Need <notifications@runnersinneed.com>";

function getResend(): Resend | null {
  const apiKey = getEnv("RESEND_API_KEY");
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

function getSiteUrl(): string {
  return getEnv("PUBLIC_SITE_URL") || "http://localhost:4321";
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
  const displayName = escapeHtml(donorName || "An anonymous donor");
  const escapedTitle = escapeHtml(needTitle);
  const escapedPledge = escapeHtml(pledgeDescription);
  const subject = `New pledge for "${needTitle}"`;
  const html = emailLayout(
    "New Pledge Received",
    `<p><strong>${displayName}</strong> has pledged to help with your need ${needLink(needId, `"${escapedTitle}"`)}.</p>
     <p style="background:#f8f8f8;padding:12px 16px;border-radius:4px;border-left:3px solid #2D4A2D;">
       ${escapedPledge}
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

  const label = statusLabels[newStatus] || escapeHtml(newStatus);
  const escapedTitle = escapeHtml(needTitle);
  const subject = `Your pledge for "${needTitle}" is now ${label}`;
  const html = emailLayout(
    "Pledge Status Update",
    `<p>Your pledge for ${needLink(needId, `"${escapedTitle}"`)} has been updated.</p>
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
  const escapedSender = escapeHtml(senderName);
  const escapedTitle = escapeHtml(needTitle);
  const escapedMessage = escapeHtml(messageBody);
  const subject = `New message about "${needTitle}"`;
  const html = emailLayout(
    "New Message",
    `<p><strong>${escapedSender}</strong> sent you a message about ${needLink(needId, `"${escapedTitle}"`)}:</p>
     <p style="background:#f8f8f8;padding:12px 16px;border-radius:4px;border-left:3px solid #2D4A2D;">
       ${escapedMessage}
     </p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/needs/${needId}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">Reply</a>
     </p>`
  );

  await sendEmail(recipientEmail, subject, html);
}

// ============================================================
// Template: Organizer request approved
// ============================================================

export async function sendOrganizerApprovedEmail(
  applicantEmail: string,
  orgName: string
): Promise<void> {
  const subject = "Your organizer request has been approved!";
  const html = emailLayout(
    "Request Approved",
    `<p>Great news! Your request to create <strong>${escapeHtml(orgName)}</strong> on Runners In Need has been approved.</p>
     <p>You now have organizer access. You can start posting needs for your organization right away.</p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/dashboard" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
     </p>`
  );

  await sendEmail(applicantEmail, subject, html);
}

// ============================================================
// Template: Organizer request denied
// ============================================================

export async function sendOrganizerDeniedEmail(
  applicantEmail: string,
  orgName: string
): Promise<void> {
  const subject = "Update on your organizer request";
  const html = emailLayout(
    "Request Not Approved",
    `<p>Thank you for your interest in Runners In Need. Unfortunately, your request to create <strong>${escapeHtml(orgName)}</strong> was not approved at this time.</p>
     <p>If you believe this was an error or would like more information, please reach out to us.</p>`
  );

  await sendEmail(applicantEmail, subject, html);
}

// ============================================================
// Template: Need expiring reminder (sent to org members)
// ============================================================

export async function sendNeedExpiryReminderEmail(
  orgEmail: string,
  needTitle: string,
  needId: string,
  extendToken: string,
  timeframe: "1 month" | "2 weeks" | "today"
): Promise<void> {
  const siteUrl = getSiteUrl();
  const extendUrl = `${siteUrl}/api/needs/${needId}/extend?token=${extendToken}`;
  const escapedTitle = escapeHtml(needTitle);

  const urgencyText =
    timeframe === "today"
      ? "expires <strong>today</strong>"
      : `expires in <strong>${timeframe}</strong>`;

  const subject =
    timeframe === "today"
      ? `"${needTitle}" expires today`
      : `"${needTitle}" expires in ${timeframe}`;

  const html = emailLayout(
    "Need Expiring Soon",
    `<p>Your need ${needLink(needId, `"${escapedTitle}"`)} ${urgencyText}.</p>
     <p>If this need is still active, you can extend it for another 90 days with one click:</p>
     <p style="margin-top:24px;">
       <a href="${extendUrl}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">Extend Need 90 Days</a>
     </p>
     <p style="margin-top:16px;color:#666;font-size:13px;">If this need has been fulfilled or is no longer relevant, you can ignore this email and it will expire automatically.</p>`
  );

  await sendEmail(orgEmail, subject, html);
}

// ============================================================
// Template: Fulfillment reminder (sent to org members)
// ============================================================

export async function sendFulfillmentReminderEmail(
  orgEmail: string,
  needTitle: string,
  needId: string,
  token: string,
  daysRemaining: number
): Promise<void> {
  const siteUrl = getSiteUrl();
  const fulfilledUrl = `${siteUrl}/api/needs/${needId}/status?action=fulfilled&token=${token}`;
  const partialUrl = `${siteUrl}/api/needs/${needId}/status?action=partially_fulfilled&token=${token}`;
  const notFulfilledUrl = `${siteUrl}/api/needs/${needId}/status?action=not_fulfilled&token=${token}`;

  const subject =
    daysRemaining <= 5
      ? `Action needed: "${needTitle}" will auto-close in ${daysRemaining} days`
      : `"${needTitle}" will auto-close as fulfilled in ${daysRemaining} days`;

  const html = emailLayout(
    "Fulfillment Check",
    `<p>All pledges for ${needLink(needId, `"${escapeHtml(needTitle)}"`)} have been marked as delivered.</p>
     <p>This need will automatically close as <strong>fulfilled</strong> in <strong>${daysRemaining} days</strong>.</p>
     <p>Please confirm the outcome:</p>
     <div style="margin-top:24px;">
       <a href="${fulfilledUrl}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-right:8px;margin-bottom:8px;">Fulfilled</a>
       <a href="${partialUrl}" style="display:inline-block;background:#B8860B;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-right:8px;margin-bottom:8px;">Partially Fulfilled</a>
       <a href="${notFulfilledUrl}" style="display:inline-block;background:#8B0000;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-bottom:8px;">Not Fulfilled</a>
     </div>
     <p style="margin-top:16px;color:#666;font-size:13px;">
       <strong>Fulfilled</strong> — Close the need. Everything was received.<br>
       <strong>Partially Fulfilled</strong> — Close and create a new need for what's still missing.<br>
       <strong>Not Fulfilled</strong> — Keep the need open and reset delivered pledges.
     </p>`
  );

  await sendEmail(orgEmail, subject, html);
}

// ============================================================
// Template: Pledge auto-expired notification (sent to donor)
// ============================================================

export async function sendPledgeExpiredEmail(
  donorEmail: string,
  needTitle: string,
  needId: string
): Promise<void> {
  const subject = `Your pledge for "${needTitle}" has expired`;
  const html = emailLayout(
    "Pledge Expired",
    `<p>Your pledge for ${needLink(needId, `"${escapeHtml(needTitle)}"`)} has been automatically expired due to inactivity (no updates for 30 days).</p>
     <p>If you'd still like to help, you can visit the need page and create a new pledge.</p>
     <p style="margin-top:24px;">
       <a href="${getSiteUrl()}/needs/${needId}" style="display:inline-block;background:#2D4A2D;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;">View Need</a>
     </p>`
  );

  await sendEmail(donorEmail, subject, html);
}
