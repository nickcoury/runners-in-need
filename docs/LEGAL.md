# Legal Analysis: Runners In Need

Research conducted 2026-03-11. This document covers liability, regulatory compliance, organizational structure, and risk mitigation for a platform matching running gear donors with organizations in need.

**Disclaimer:** This is research, not legal advice. Consult an attorney before launch for Terms of Service review and organizational structure decisions.

---

## Executive Summary

**Can we connect donors and organizations without significant platform liability?** Yes, with proper Terms of Service and a passive matching design. The risk profile is comparable to Freecycle, Craigslist, or Buy Nothing — all of which operate successfully with similar models.

**Do we need a lawyer?** Yes, but scope is limited: review Terms of Service, advise on organizational structure (501(c)(3) vs for-profit), and confirm COPPA compliance if youth data is involved. Estimated cost: $1,500-5,000 for initial setup.

**Biggest risks:** COPPA compliance (if collecting data from minors), product liability for defective gear (low probability, high impact), and platform liability if we actively curate matches rather than passively list them.

---

## Findings

### 1. Liability for Donated Goods

**Federal Good Samaritan protections do NOT cover non-food donations.** The Bill Emerson Act (42 U.S.C. § 1791) only covers food and grocery products. There is no federal equivalent for athletic gear.

**State laws vary widely.** Hawaii has broader protections for charitable donations; most states' Good Samaritan laws are narrowly focused on food or emergency aid. We cannot rely on blanket Good Samaritan protection.

**Product liability still applies to used goods.** If donated shoes cause injury (sole separation, inadequate support), the liability chain is:
1. Original manufacturer (primary — design/manufacturing defect)
2. Donor (only if gross negligence — knowingly donated dangerous item)
3. Platform (only if we inspected, recommended, or warranted the goods)

**Risk level: MEDIUM.** Low probability if we're a passive platform, but high impact if injury occurs.

**Mitigation:**
- Platform does NOT inspect, recommend, or warrant goods
- Donors certify items are in safe, wearable condition
- Receiving organizations agree to inspect before distributing
- Terms of Service explicitly disclaim all warranties

### 2. Platform Liability & Section 230

**Section 230 likely protects us** if we operate as a passive matching platform — listing needs posted by organizations and letting donors browse. This is analogous to Craigslist or Freecycle.

**Section 230 may NOT protect us** if we actively curate or algorithmically recommend specific matches. Recent court rulings (TikTok, 2024) have narrowed protection for platforms with active recommendation systems.

**Design recommendation:** Keep the platform passive. Organizations post needs, donors browse and choose. Avoid algorithmically pushing specific matches to specific users.

**How comparable platforms handle this:**

| Platform | Structure | Liability Strategy |
|---|---|---|
| DonorsChoose | 501(c)(3) | Liability capped at $100, class action waiver, broad disclaimers |
| Freecycle | 501(c)(3) | No liability for content, AS IS, disclaims all damages |
| Craigslist | For-profit | AS IS/AS AVAILABLE, no liability for user conduct |
| Good Sports | 501(c)(3) | Donation release agreements, organizations sign waivers |

**Risk level: MEDIUM.** Manageable with proper Terms of Service.

### 3. Tax Implications

**Donor tax deductions require the recipient to be a 501(c)(3).** If an organization receiving gear is a registered charity, donors can deduct fair market value of used items. If the organization is not a 501(c)(3) (e.g., an informal running club), donations are not tax-deductible.

**The platform itself:**
- If structured as 501(c)(3): can issue donation receipts, donations to the platform are deductible
- If structured as for-profit: cannot issue tax receipts; receiving organizations would issue their own

**Valuation of used gear:** IRS Publication 561 governs. Used running shoes in good condition: approximately $20-40/pair (thrift store pricing). Items must be in "good used condition or better." Documentation required if value exceeds $250.

**Risk level: LOW.** Platform should provide valuation guidance but is not responsible for donors' tax claims.

### 4. Data Privacy & Compliance

**COPPA is the biggest regulatory concern.** If the platform serves youth programs and could collect data from anyone under 17 (COPPA 2.0, effective 2025), we need:
- Parental consent mechanisms for minors
- Minimum necessary data collection
- Privacy policy explicitly addressing children's data
- Penalties: up to $53,088 per violation

**Practical mitigation:** The platform primarily serves adult organizers (coaches, program directors) and adult donors. We do NOT need to collect data from the youth athletes themselves. If we avoid collecting minor data entirely, COPPA risk drops significantly.

**CCPA:** Currently exempts nonprofits. If we operate as for-profit, CCPA applies only if we exceed thresholds (100K+ CA residents' data or derive 50%+ revenue from selling data). Unlikely to apply at our scale.

**CAN-SPAM:** Standard email compliance — unsubscribe links, honest subject lines, 10-day opt-out processing. Straightforward.

**Risk level: HIGH if we collect youth data, LOW if we don't.**

### 5. Organizational Structure

**Recommended: 501(c)(3) nonprofit.** This is the model used by DonorsChoose, Freecycle, Good Sports, and virtually every successful donation matching platform.

| Factor | 501(c)(3) | For-Profit | B-Corp |
|---|---|---|---|
| Donor tax deductions | Yes | No | No |
| Grant eligibility | Yes | No | No |
| Tax-exempt | Yes | No | No |
| Can pay employees | Yes | Yes | Yes |
| Investor funding | No (grants/donations only) | Yes | Yes |
| Brand trust | Higher | Lower | Medium |
| Setup cost | $500-2,000 + attorney | ~$200 | ~$200 + certification |
| Governance | Board required | Flexible | Board required |

**Why 501(c)(3) wins for RIN:**
- Donors are more motivated when donations are tax-deductible
- Grants and corporate giving programs open up (foundation funding)
- Brand trust — "nonprofit" signals mission-driven intent
- DonorsChoose proves this model works at massive scale ($1.64B raised)
- Can still pay employees and operate professionally

**If seeking venture capital:** Consider a for-profit B-Corp with a separate 501(c)(3) partner that handles donation receipts. This is more complex but allows investor returns.

### 6. Insurance

**Recommended coverage:**

| Type | What It Covers | Estimated Cost | Essential? |
|---|---|---|---|
| General Liability | Bodily injury, property damage claims | ~$50-60/mo | Yes |
| Directors & Officers | Board/officer legal liability | ~$70/mo | Yes (if board exists) |
| Cyber Liability | Data breaches, hacking | ~$100/mo | Yes |
| Errors & Omissions | Professional liability | ~$50/mo | Optional |

**Total: ~$200-300/month.** Affordable and strongly recommended. Going uninsured creates catastrophic exposure.

### 7. Used Athletic Gear Risks

**Injury from defective shoes:** Platform liability is minimal if we don't inspect or recommend goods. Manufacturer retains primary liability for defects. Donor liability only attaches with gross negligence.

**Hygiene:** No federal regulation on donated clothing/shoe hygiene (unlike food). Industry practice: receiving organizations clean items before distribution. Comparable to thrift store operation.

**Product recalls:** Platform should not knowingly match recalled products. Include donor certification that items are not recalled. Keep records for potential recall notification.

**Risk level: LOW to MEDIUM.** Manageable with donor certifications and organizational waivers.

---

## Recommendations

### Before Launch (Required)

1. **Hire an attorney ($1,500-5,000) to:**
   - Draft or review Terms of Service (model after Freecycle/DonorsChoose)
   - Advise on organizational structure (501(c)(3) filing if chosen)
   - Confirm COPPA compliance approach

2. **Draft Terms of Service including:**
   - Liability disclaimers (platform not responsible for goods quality or user conduct)
   - User indemnification (users indemnify platform for claims)
   - Liability cap ($100, following DonorsChoose precedent)
   - No warranties (goods are "as is")
   - Waiver of class action rights
   - Donor certification (items safe, not recalled, cleaned)
   - Organization release (will inspect items before distributing)

3. **Create Privacy Policy covering:**
   - What data is collected and why
   - How long data is retained
   - Who has access
   - User rights (access, deletion, opt-out)
   - Explicit statement: we do not collect data from minors
   - Contact information for privacy inquiries

4. **Choose organizational structure:**
   - Strong recommendation: 501(c)(3) nonprofit
   - File with IRS (Form 1023 or 1023-EZ), ~2-4 weeks processing
   - Register with state charity regulators as required

5. **Procure insurance:**
   - General liability + cyber liability at minimum (~$150/month)
   - D&O if forming a board (~$70/month additional)

### Before Launch (Recommended)

6. **Create donor certification checklist (built into pledge flow):**
   - "I certify these items are in safe, wearable condition"
   - "These items are not subject to product recalls"
   - "I have cleaned/laundered these items"

7. **Create organization onboarding agreement:**
   - Organization agrees to inspect donated items before distributing
   - Organization assumes responsibility for items once received
   - Organization confirms its legal status (501(c)(3) or other)

8. **Provide donor resources:**
   - Link to IRS Publication 561 (valuation of donated property)
   - Valuation table for common running gear
   - Link to CPSC recall database

### After Launch (When Needed)

9. **Monitor for:**
   - Any injury claims or complaints
   - COPPA compliance if youth-facing features are added
   - State-specific charity registration requirements as we expand geographically

---

## Risk Matrix

| Risk | Probability | Impact | Overall | Action |
|---|---|---|---|---|
| Injury from donated gear | Low | High | MEDIUM | ToS disclaimers, donor certification, org inspection requirement |
| Platform liability (Section 230) | Low | High | MEDIUM | Passive design, comprehensive ToS |
| COPPA violation | Low (if no minor data) | Very High | LOW-MEDIUM | Don't collect minor data; privacy policy |
| Donor tax deduction issues | Low | Low | LOW | Provide guidance, not guarantees |
| Data breach | Low | Medium | LOW-MEDIUM | Cyber insurance, standard security practices |
| State charity registration | Medium | Low | LOW | Register in states as we expand |
| Product recall liability | Very Low | Medium | LOW | Donor certification, record keeping |
| Hygiene complaints | Low | Low | LOW | Recommend cleaning, leave to orgs |

---

## Key Precedent: Why This Is Viable

DonorsChoose has facilitated **$1.64 billion** in donations with a similar matching model. Freecycle has operated for 20+ years connecting donors with recipients of used goods. Craigslist has facilitated billions in person-to-person transactions. All operate with comprehensive Terms of Service and have not faced existential liability challenges.

The running gear donation matching model falls squarely within established legal frameworks for these types of platforms. With proper Terms of Service, passive platform design, and basic insurance, the liability profile is manageable and well-understood.

---

## Next Steps (Priority Order)

| # | Action | Owner | Cost | Timeline |
|---|---|---|---|---|
| 1 | Decide: 501(c)(3) or for-profit | Nick | $0 | This week |
| 2 | Find attorney for ToS + structure | Nick | $1,500-5,000 | 1-2 weeks |
| 3 | Draft Terms of Service | Attorney + dev | Included above | 2-3 weeks |
| 4 | Draft Privacy Policy | Dev (template) + attorney review | Included above | 2-3 weeks |
| 5 | File for 501(c)(3) if chosen | Attorney | ~$600 filing fee | 2-4 weeks processing |
| 6 | Procure insurance | Nick | ~$200-300/mo | 1 week |
| 7 | Build donor certification into pledge flow | Dev | $0 | With platform launch |
| 8 | Build org onboarding agreement | Dev + attorney | Included above | With platform launch |
| 9 | State charity registrations | Attorney/Nick | Varies by state | As we expand |

---

## Sources

- [42 U.S.C. § 1791 — Bill Emerson Good Samaritan Food Donation Act](https://www.law.cornell.edu/uscode/text/42/1791)
- [Section 230 of the Communications Decency Act — EFF](https://www.eff.org/issues/cda230)
- [Federal Volunteer Protection Act of 1997](https://uscode.house.gov/view.xhtml?path=/prelim@title42/chapter139&edition=prelim)
- [COPPA Rule — FTC](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [IRS Publication 561 — Determining Value of Donated Property](https://www.irs.gov/publications/p561)
- [DonorsChoose Terms of Use](https://www.donorschoose.org/terms)
- [Freecycle Terms of Service](https://www.freecycle.org/pages/tos)
- [Craigslist Terms of Use](https://www.craigslist.org/about/terms.of.use/en)
- [Good Sports FAQ](https://www.goodsports.org/frequently-asked-questions-for-our-donors/)
- [Nonprofit Insurance — Insureon](https://www.insureon.com/nonprofit-business-insurance)
- [D&O Insurance for Nonprofits](https://insurancefornonprofits.org/coverages/directors-officers-d-and-o/)
