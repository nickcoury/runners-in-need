# Incident Playbook: What To Do If Something Happens

A reference guide for Nick. Covers the realistic scenarios and what to do for each.

---

## General Principles

1. **Don't panic.** The platform is a free bulletin board with no money involved. Your exposure is minimal.
2. **Don't admit fault.** Be empathetic but factual. "I'm sorry that happened" is fine. "It was our fault" is not.
3. **Document everything.** Save emails, screenshots, dates. If something escalates, documentation matters.
4. **Respond promptly.** Acknowledge within 48 hours even if you need time to figure out next steps.
5. **When in doubt, consult a lawyer.** A one-hour consultation is ~$200-400 and worth it for anything that feels serious.

---

## Scenario 1: Someone Claims Injury From Donated Gear

**Example:** "My athlete twisted their ankle because the donated shoes had a separated sole."

**Risk level:** Low probability, potentially high impact. This is the most significant scenario.

**What to do:**

1. **Express concern** — "I'm sorry to hear about the injury. I hope [person] recovers quickly."
2. **Do NOT admit liability** — Don't say "we should have caught that" or "that's our fault."
3. **Point to the Terms of Service:**
   - The platform is a passive bulletin board that does not inspect or warrant goods
   - Donors certified items were in safe condition
   - Organizations agreed to inspect items before distributing
   - The platform's liability is explicitly limited to $0
4. **Document the exchange** — Save the original need post, pledge, any messages between parties
5. **If they threaten to sue:**
   - Don't respond to legal threats yourself
   - Consult an attorney (~$200-400 for initial consultation)
   - Your defenses: Section 230 (passive platform), Terms of Service (liability disclaimers, donor certification, org inspection requirement), no money changed hands
6. **Consider removing the listing** if appropriate, but don't delete records

**Why this is defensible:**
- The manufacturer bears primary product liability for defective shoes
- You're a bulletin board, not a retailer or distributor
- The donor certified the items were safe
- The organization agreed to inspect before distributing
- Section 230 protects platforms for user-generated content
- Every Buy Nothing group and Freecycle chapter operates with this same risk profile

---

## Scenario 2: Fraud or Misrepresentation

**Example:** "An organization posted fake needs and collected gear to resell" or "A donor sent garbage instead of shoes."

**What to do:**

1. **Remove the offending account/listing** immediately
2. **Notify affected users** — "We've become aware of a concern with [listing/account] and have removed it."
3. **Ban the user** from the platform
4. **If criminal** (theft, fraud): suggest the affected party file a police report. The platform facilitated an introduction — the criminal act is between the parties.
5. **Document everything** — save the listings, messages, user info before deletion
6. **Don't try to mediate** — you're not responsible for resolving disputes between users

**Your position:** The platform connects parties in good faith. Criminal acts by users are the responsibility of those users, not the bulletin board.

---

## Scenario 3: Someone Demands You Remove Content

**Example:** "Take down that listing, it mentions my organization without permission" or "That review is defamatory."

**What to do:**

1. **Evaluate the request** — Is the content actually problematic?
2. **If it's clearly inappropriate** (harassment, doxxing, hate speech): remove it
3. **If it's a legitimate dispute** (organization says they didn't post something):
   - Verify the account ownership
   - Remove content if it appears to be impersonation
4. **If it's a legal threat** (defamation claim, cease and desist):
   - Take it seriously but don't rush
   - Section 230 protects you for content posted by users
   - If you receive a formal legal letter, consult an attorney before responding
5. **Don't over-moderate** — Section 230 protects good-faith moderation, but you're not required to police every listing

---

## Scenario 4: Data Breach or Security Incident

**Example:** Database exposed, user emails leaked, account compromised.

**What to do:**

1. **Contain the breach** — Fix the vulnerability immediately (rotate API keys, patch the code, etc.)
2. **Assess what was exposed** — What data? How many users? Email addresses? Names?
3. **Notify affected users** — Be transparent about what happened, what data was affected, and what you've done to fix it
   - Most states require breach notification within 30-72 days
   - California (CCPA) requires "expedient" notification
4. **Notify Cloudflare/Turso** if the breach involves their infrastructure
5. **Document the timeline** — When discovered, what was affected, what was done
6. **Consider cyber liability insurance** going forward (~$100/month)

**What data we store:**
- Email addresses (most sensitive)
- Names (public on listings anyway)
- Organization names and locations (public)
- Gear descriptions (public)
- No financial data, no SSNs, no sensitive personal info

**Realistic impact:** An email list leak is embarrassing and requires notification but is not catastrophic. We don't store financial or highly sensitive data.

---

## Scenario 5: Cease and Desist Letter

**Example:** A lawyer sends a letter demanding you stop operating, remove content, or pay damages.

**What to do:**

1. **Don't ignore it** — but don't panic either
2. **Read it carefully** — What specifically are they claiming?
3. **Don't respond immediately** — Take a few days to think
4. **Consult an attorney** — A one-hour consultation (~$200-400) is essential here
5. **Common reasons and responses:**
   - **Trademark claim** (e.g., using a brand name): Remove the specific content
   - **Defamation claim**: Section 230 protects you for user-posted content
   - **Copyright claim**: Remove the content (DMCA safe harbor)
   - **Product liability claim**: See Scenario 1

---

## Scenario 6: Government/Regulatory Contact

**Example:** FTC inquiry about COPPA compliance, state AG inquiry about charity registration.

**What to do:**

1. **Take it seriously** — Government inquiries require a response
2. **Consult an attorney immediately** — This is not DIY territory
3. **Our COPPA position:** We do not collect data from minors. Only adult organizers and donors create accounts. Youth athletes never interact with the platform directly.
4. **Our charity position:** We are not a charity. We don't accept donations, don't solicit funds, and don't claim tax-exempt status. We're a free personal project.
5. **Cooperate** — but only share what's requested, with attorney guidance

**This is unlikely** given the platform's model (no money, no minor data, no charity claims).

---

## Scenario 7: User Dispute (Non-Legal)

**Example:** "The donor promised shoes but never sent them" or "The organization won't respond to my messages."

**What to do:**

1. **You are NOT a mediator** — The platform connects parties; it doesn't guarantee outcomes
2. **Empathize** — "I'm sorry the pledge didn't work out."
3. **Suggest they try again** — "There are other [donors/needs] on the platform."
4. **If a pattern emerges** (same user repeatedly ghosting): consider banning the account
5. **Don't promise outcomes** — "We'll make sure this gets resolved" creates expectations you can't meet

**Template response:**
> "Thanks for letting me know. Runners In Need connects donors with organizations, but we can't guarantee that every pledge will be fulfilled. I'd encourage you to reach out to other [donors/organizations] on the platform. If you believe this user is acting in bad faith, let me know and I'll review the account."

---

## Scenario 8: Platform Goes Viral / Unexpected Scale

**Example:** A Reddit post blows up and suddenly thousands of people are signing up.

**What to do:**

1. **Enjoy it** — this is the dream scenario
2. **Monitor Cloudflare** — Free tier handles reasonable traffic; Workers has 100K requests/day free
3. **Watch for abuse** — Spammers and bad actors follow traffic spikes
4. **Consider:**
   - Adding Cloudflare Turnstile to forms (free bot protection)
   - Adding rate limiting
   - Getting basic liability insurance (~$300-500/year)
   - Having an attorney review your ToS (~$500-1,500)
5. **Don't over-promise** — Keep the site simple and reliable

---

## Key Contacts to Have Ready

| Who | When | Cost |
|---|---|---|
| **Local attorney** (internet law / small business) | Legal threats, C&D letters, government inquiries | ~$200-400/hour |
| **Cloudflare support** | Infrastructure issues, DDoS, abuse reports | Free (community plan) |
| **Turso support** | Database issues | Free tier support |

**Finding an attorney:** Search your state bar association's lawyer referral service, or use Avvo.com. Look for someone with internet law, small business, or nonprofit experience. Many offer free 15-30 minute initial consultations.

---

## Annual Checklist

Things to review once a year:

- [ ] Read through Terms of Service — still accurate?
- [ ] Read through Privacy Policy — still accurate?
- [ ] Review user accounts — any obvious spam or abuse to clean up?
- [ ] Check Cloudflare dashboard — any security alerts?
- [ ] Update "Last updated" dates on legal pages if anything changed
- [ ] Consider whether scale warrants liability insurance

---

## Bottom Line

You're running a free bulletin board. No money, no entity, no complexity. The realistic risk is very low — comparable to running a neighborhood Facebook group or a Freecycle chapter. The ToS and privacy policy protect you from most scenarios. For anything that feels genuinely threatening, spend $200-400 on an attorney consultation. That's the total cost of managing risk for this project.
