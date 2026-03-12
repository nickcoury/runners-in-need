# Legal Analysis: Runners In Need

Research conducted 2026-03-11. This document covers liability, regulatory compliance, organizational structure, and risk mitigation for a platform matching running gear donors with organizations in need.

**Disclaimer:** This is research, not legal advice.

---

## Operating Model

This is a **personal charity project** with these constraints:
- **No money changes hands** — not on the platform, not between parties, not ever
- **No revenue** — hosting and technical costs are paid personally by the operator
- **No donations accepted** — not to the platform, not to the operator
- **No formal entity** — operates as a personal project, not a business or nonprofit
- The platform is a **free bulletin board** connecting gear donors with organizations

This model is the simplest possible structure and eliminates entire categories of legal complexity (tax compliance, charity registration, financial regulation, payment processing liability).

---

## Executive Summary

**Can we connect donors and organizations without significant platform liability?** Yes. The risk profile is comparable to Freecycle, Craigslist, or Buy Nothing — all of which started as personal projects and operate successfully with similar models. No money changes hands, which eliminates the most significant liability categories.

**Do we need a lawyer?** Not to start. A good Terms of Service (modeled on Freecycle/Craigslist templates) and a privacy policy are sufficient for launch. Attorney review is recommended only if the project grows significantly (1,000+ users).

**Do we need a formal entity?** No. This can operate as a personal side project indefinitely. Craigslist ran unincorporated from Craig Newmark's apartment for 4 years. Buy Nothing groups operate as informal Facebook groups with no entity. Formal structure becomes important only if money enters the picture.

**Biggest risks:** Product liability for defective gear (low probability, high impact) and COPPA if collecting data from minors (avoidable by only collecting adult organizer/donor data).

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

**For a personal side project, no formal entity is required.** Here's the spectrum from lightest to heaviest:

#### Option A: Personal Project (Recommended for Launch)

Operate as yourself. No entity, no filing, no ongoing compliance.
- **Cost:** $0
- **Liability protection:** None beyond Section 230 and Terms of Service disclaimers
- **Tax deductions for donors:** No (but gear donations to 501(c)(3) orgs are deductible regardless — the org issues the receipt, not the platform)
- **Precedent:** Craigslist (1995-1999), DonorsChoose (initial launch), every community forum ever
- **When to upgrade:** 1,000+ users, handling money, or wanting grant funding

#### Option B: Fiscal Sponsorship (If You Want 501(c)(3) Credibility Later)

Operate under an existing nonprofit's umbrella. No incorporation needed.
- **Cost:** 5-7% of any donations raised (to the platform itself, not gear donations)
- **Options:** Open Collective Foundation, Hack Club (7% flat, includes bank account + tax handling)
- **Benefits:** Donors to the platform get tax deductions, institutional backing, reduced personal liability
- **When it makes sense:** If people want to donate money to support the platform's operations

#### Option C: Full 501(c)(3) (Only at Scale)

Form your own nonprofit corporation.
- **Cost:** $1,500-5,000 setup + ~$1,000-3,000/year compliance
- **Benefits:** Full tax exemption, grant eligibility, maximum credibility
- **When it makes sense:** 50,000+ in annual donations, employees, multi-state operations

| Factor | Personal Project | Fiscal Sponsorship | Full 501(c)(3) |
|---|---|---|---|
| Cost to start | $0 | $0 | $1,500-5,000 |
| Annual cost | $0-500 (insurance) | 5-7% of donations | $1,000-3,000 |
| Setup time | Now | 2-3 weeks | 2-4 months |
| Liability protection | Section 230 + ToS | Medium | High |
| Donor tax deductions (platform) | No | Yes | Yes |
| Grant eligibility | No | Sometimes | Yes |
| Governance overhead | None | Minimal | Board required |

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

### Before Launch (Do Now — No Lawyer Needed)

1. **Draft Terms of Service** using Freecycle/Craigslist as templates:
   - Platform provides service "as is" — not responsible for goods quality or user conduct
   - Users indemnify the platform
   - Liability cap ($100, following DonorsChoose precedent)
   - No warranties on donated goods
   - Donor certification: items are safe, not recalled, cleaned

2. **Create Privacy Policy** (template-based):
   - What data is collected (email, name, organization) and why
   - We do NOT collect data from minors
   - How long data is retained, who has access
   - User rights (access, deletion)
   - CAN-SPAM compliance (unsubscribe links)

3. **Build donor certification into pledge flow:**
   - "I certify these items are in safe, wearable condition"
   - "These items are not subject to product recalls"
   - "I have cleaned/laundered these items"

4. **Design platform as passive matching** (not active curation):
   - Organizations post needs, donors browse and choose
   - Don't algorithmically recommend specific matches to specific users
   - This preserves Section 230 protection

### When the Project Grows (200+ Users)

5. **Consider basic general liability insurance** (~$300-500/year)
6. **Consider fiscal sponsorship** if wanting to accept donations to the platform
7. **Get attorney review of ToS** (~$500-1,500 for review only)

### At Scale (1,000+ Users)

8. **Evaluate formal entity** (fiscal sponsorship or 501(c)(3))
9. **Procure full insurance package** (GL + cyber + D&O, ~$200-300/month)
10. **State charity registrations** as needed for geographic expansion

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

| # | Action | Cost | When |
|---|---|---|---|
| 1 | Draft Terms of Service (template-based) | $0 | Before launch |
| 2 | Draft Privacy Policy (template-based) | $0 | Before launch |
| 3 | Build donor certification into pledge flow | $0 | With launch |
| 4 | Keep platform design passive (no algorithmic matching) | $0 | Ongoing |
| 5 | Consider general liability insurance | ~$300-500/year | When 200+ users |
| 6 | Attorney review of ToS | ~$500-1,500 | When 200+ users |
| 7 | Evaluate fiscal sponsorship (Hack Club / Open Collective) | 5-7% of donations | If accepting platform donations |
| 8 | Evaluate formal entity (501(c)(3)) | $1,500-5,000 | If 1,000+ users or handling money |

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
