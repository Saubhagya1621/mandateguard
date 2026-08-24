# Retry Compliance Rules — Research Summary

Research date: August 2026. Sources cited inline; treat as directional (NPCI circulars
are the authoritative source for production use — this is hackathon-grade research,
not a legal compliance document).

## UPI Autopay — Core Rule (NPCI, effective August 2025)

A failed autopay mandate gets a maximum of **4 total attempts**: 1 original execution
+ 3 retries. After that, the payment is cancelled for that billing cycle.

Source: NPCI rule change reported across multiple fintech blogs (Kiwi Credit Card,
Oxigen Wallet), effective August 1, 2025.

## Retry Spacing

Retries should be spaced out, not fired in rapid succession — NPCI treats
rapid-fire retries as spam-like behavior and may apply rate limiting. The commonly
cited "smart retry window" pattern used by payment aggregators is:

- Retry 1: ~24 hours after original failure
- Retry 2: ~72 hours after original failure
- Retry 3: ~168 hours (7 days) after original failure

Source: productgrowth.in UPI AutoPay design guide.

## Execution Timing Window

Autopay debit attempts (original + retries) should only be triggered during
NPCI's designated non-peak hours:
- Before 10:00 AM
- 1:00 PM – 5:00 PM
- After 9:30 PM

This project's MVP does not implement time-of-day windowing (out of scope for
the hackathon build) — noted here as a known gap for future work.

## Failure Reason → Retry Policy (as implemented in this project)

| Failure Reason         | Retryable? | Max Retries | Min Gap Before Next Retry | Rationale |
|-------------------------|------------|--------------|----------------------------|-----------|
| insufficient_funds      | Yes        | 3            | 1 day                      | Most common failure; aligns with NPCI's 4-attempt cap (1 original + 3 retries). Gap simplified to a minimum 1-day floor rather than the full 24h/72h/168h staggered sequence, for MVP scope. |
| bank_server_timeout     | Yes        | 3            | 1 day                      | Transient technical failure; NPCI 4-attempt cap applies. |
| daily_limit_hit         | Yes        | 3            | 1 day                      | Resets at midnight on the bank's side; next-day retry is sufficient. |
| other                   | Yes        | 2            | 2 days                     | Unclassified failure — treated conservatively with fewer retries and a longer gap. |
| mandate_expired         | No         | 0            | —                          | Cannot retry an expired mandate — requires a fresh mandate authorization from the payer, not a system retry. |
| account_frozen          | No         | 0            | —                          | Requires manual bank-side resolution; retrying against a frozen account is pointless and may trigger fraud flags. |

## Known Simplifications (documented honestly, not hidden)

1. **Staggered gap-day sequence not implemented.** Real NPCI-aligned systems use a
   24h → 72h → 168h staggered retry sequence. This MVP uses a single flat minimum-gap
   value per failure reason for simplicity. This is the single biggest deviation from
   real-world practice and is called out explicitly in the pitch.
2. **No time-of-day execution windowing.** The scheduler in this MVP does not restrict
   retry execution to NPCI's non-peak hours (before 10 AM / 1–5 PM / after 9:30 PM).
3. **NACH rules not separately modeled.** NACH re-presentment policies vary by lender
   (e.g., Bajaj Finance re-presents within 7–10 business days, up to 2 times per cycle)
   and are not governed by a single NPCI-wide retry cap the way UPI Autopay is. This
   MVP treats UPI Autopay and NACH mandates under the same unified rule set for scope
   reasons — a production system would need separate rule tables per rail.