# ScamSafe.in — End-to-End Test Document

## Environment
- **Frontend**: https://scamsafe.in (Netlify)
- **Backend**: https://web-production-71fe5.up.railway.app/api/v1 (Railway)
- **Admin**: https://scamsafe.in/admin
- **Test OTP**: `786786` (when `OTP_TEST_MODE=1`)
- **Admin login**: `sam@scamsafe.in` / `Sam123$`

---

## 1. Landing Page (`/`)

| # | Test | Expected |
|---|------|----------|
| 1.1 | Open https://scamsafe.in | Landing page loads with phone input, live victim counter, "How it Works" section |
| 1.2 | Verify footer links | Scam Watch, Privacy Policy, Terms & Conditions, Contact, Transparency visible. No "Inbox Shield" or "Pricing" links |
| 1.3 | Verify footer branding | "Powered by Prodigious Digital Solutions" shown |
| 1.4 | Verify social icons | Instagram, YouTube, Mail icons aligned and clickable |
| 1.5 | Verify "How it Works" step 3 | Says "Remove" — mentions submitting DPDP Act deletion notices and monitoring |
| 1.6 | Verify FAQs | Includes 90-day deletion timeline, DPDP Act explanation, 15-day rescan frequency |
| 1.7 | Verify automated rescans text | Says "every 15 days" |

## 2. OTP & Phone Login

| # | Test | Expected |
|---|------|----------|
| 2.1 | Enter valid 10-digit phone | OTP sent (or test code accepted) |
| 2.2 | Enter OTP `786786` | Verification succeeds, navigates to scan |
| 2.3 | Enter wrong OTP | Error message shown |
| 2.4 | Re-login with same phone | Previous scan data restored from localStorage |

## 3. Scan Flow (`/scan`)

| # | Test | Expected |
|---|------|----------|
| 3.1 | Scan starts automatically | Progress bar fills, databases checked one by one |
| 3.2 | Scan completes | Results page shows exposure score + found databases |
| 3.3 | Scan limit enforced | After 2 scans in 15 days, shows "scan limit reached" message |
| 3.4 | Scan history banner | If previously scanned, shows "Previous Scan Data" card with days until rescan |

## 4. Results Page (`/results`)

| # | Test | Expected |
|---|------|----------|
| 4.1 | Exposure score shown | Red circle with number of databases found |
| 4.2 | No BreachIntelligence section | Breach Intelligence component not rendered |
| 4.3 | No ₹49 report card | "Download Full Exposure Report" card removed |
| 4.4 | "What happens next" card | Lists: deletion requests submitted, 7-30 day acknowledgement, 90-day full deletion, monitoring, escalation |
| 4.5 | Removal button | Click starts removal — shows "Submitting deletion requests..." |
| 4.6 | Removal progress | Per-broker status shows "Submitted for Removal" / "Submitting..." / "Pending" |
| 4.7 | Removal complete message | "All Deletion Requests Submitted!" + "Next rescan in 15 days" |

## 5. Dashboard (`/dashboard`)

| # | Test | Expected |
|---|------|----------|
| 5.1 | Protection Score | Shows animated score ring |
| 5.2 | Deletion certificate button | Says "Download Deletion Request Report" |
| 5.3 | Scan limit banner | Shows "Scans used: X/Y (max 2 per 15 days)" |
| 5.4 | Status tab | Removal status data loaded |
| 5.5 | Removal tab | Per-broker status shows "Submitted for Removal" / "Opt-out Filed" |
| 5.6 | Log tab (DeletionLog) | Status labels: "REQUESTED FOR DELETION", "SUBMITTED", "PROCESSING", "NO RESPONSE", "REAPPEARED" |
| 5.7 | Compliance tab | DPDP compliance timeline with day progress |
| 5.8 | AI Advisor tab | Initial message mentions "Deletion requests have been submitted" + 90-day timeline |
| 5.9 | No Breach Intelligence | Component removed from dashboard |

## 6. Logout

| # | Test | Expected |
|---|------|----------|
| 6.1 | NavHeader shows phone | Last 4 digits of phone shown in header |
| 6.2 | Logout icon visible | Red logout icon in header on authenticated pages |
| 6.3 | Click logout | State cleared, redirected to landing page |
| 6.4 | localStorage cleared | `dataeraser_state` removed from localStorage |

## 7. Pricing Page (`/pricing`)

| # | Test | Expected |
|---|------|----------|
| 7.1 | Plan features | "ScamSafe Privacy Advisor" (not "AI Privacy Advisor") |
| 7.2 | Rescan frequency | Shield: "Automatic rescan every 15 days", Pro: "Priority rescans (every 15 days)" |
| 7.3 | Launching Soon badges | "Dark web breach monitoring — Launching Soon", "Inbox Shield — Launching Soon" |
| 7.4 | UPI payment modal | Mobile: "Pay Now with UPI App" button opens GPay/PhonePe/Paytm |
| 7.5 | QR code (desktop) | QR code shown for desktop users |
| 7.6 | No UTR input | Manual UTR entry field removed |
| 7.7 | UPI ID shown | Copy button works for UPI ID |

## 8. Privacy Policy (`/privacy`)

| # | Test | Expected |
|---|------|----------|
| 8.1 | Grievance Officer section | Shows only: "Mohammed Sameer Quadri — grievance@scamsafe.in" |
| 8.2 | No response time detail | Response time line removed |

## 9. Transparency Page (`/transparency`)

| # | Test | Expected |
|---|------|----------|
| 9.1 | No third-party sub-processors table | Section completely removed |
| 9.2 | "Account Deletion on Request" | Not "Instant Account Deletion" |
| 9.3 | Your Rights → Delete | Says "Request deletion of your data from the dashboard" |
| 9.4 | Removal Accuracy section | Mentions "monitor the process until completion" + "up to 90 days" |

## 10. Live Scam Dashboard (`/live`)

| # | Test | Expected |
|---|------|----------|
| 10.1 | Counter ticking | Real-time victim counter based on IST |
| 10.2 | Data broker connection | Says "72+ such sources" (not 47) |
| 10.3 | Government sources | Methodology section links to cybercrime.gov.in, mha.gov.in, ncrb.gov.in, pib.gov.in |
| 10.4 | Footer sources | Shows full domain URLs for all government sources |

## 11. Reappearance Tracker (`/reappearance`)

| # | Test | Expected |
|---|------|----------|
| 11.1 | Header | Says "ScamSafe" (not "Data Eraser") |
| 11.2 | Stats labels | "Total Removals" (not "Total Erasures") |
| 11.3 | Chart title | "Monthly Removals" |
| 11.4 | Status badges | "REMOVAL SENT" (not "RE-ERASED") |
| 11.5 | Auto-removal banner | "AUTO-REMOVED" badge, "submitted fresh removal requests automatically" |
| 11.6 | Summary section | "submitted for removal since joining ScamSafe" |

## 12. Admin Dashboard (`/admin`)

| # | Test | Expected |
|---|------|----------|
| 12.1 | Login | Email + password login works with admin credentials |
| 12.2 | Overview tab | Today/Yesterday stats, 7-day trend, recent activity |
| 12.3 | Scans tab | All user scans with phone, databases found, data types, removal status |
| 12.4 | Users tab | Search by phone/email, scan count, removal status, payment status |
| 12.5 | Billing tab | Revenue summary, transaction list with plan/amount/date |
| 12.6 | Health tab | System status, Instamojo/Resend/OTP config, DB stats, email delivery rate |
| 12.7 | Settings tab | Feature toggles for Dark Web Monitoring and Inbox Shield |
| 12.8 | Data Retention panel | Shows "Never deleted" for scan data and removal records |
| 12.9 | Logout | Clears admin session, returns to login |

## 13. Content Language Audit

| # | Check | Expected |
|---|-------|----------|
| 13.1 | No "instant deletion" | Replaced with "submitted for deletion + monitored" everywhere |
| 13.2 | No "erased" in user-facing text | Replaced with "removal requested" / "submitted for removal" |
| 13.3 | No "DELETED" status labels | Changed to "Requested for Deletion" / "Submitted for Removal" |
| 13.4 | No "guaranteed deletion" | Certificate says "Deletion Request Report" |
| 13.5 | 90-day timeline mentioned | In FAQs, transparency, AI advisor, "what happens next" |
| 13.6 | 15-day rescan cycle | In FAQs, pricing features, scan quota, dashboard banner |

---

## Quick Smoke Test Checklist

1. [ ] Open scamsafe.in → phone input visible
2. [ ] Enter phone + OTP 786786 → scan starts
3. [ ] Scan completes → results show exposure score
4. [ ] Click "Start Removal" → shows "Submitting deletion requests..."
5. [ ] Removal completes → "All Deletion Requests Submitted!"
6. [ ] Navigate to /dashboard → Protection Score, tabs working
7. [ ] Log tab shows "REQUESTED FOR DELETION" labels
8. [ ] Logout button in header → clears state, returns to home
9. [ ] /admin login → all tabs load data
10. [ ] Settings tab → Dark Web & Inbox Shield toggles work
