# Data provenance and comparison notes

The supplied ZIP contains 20 synthetic customer profiles (15 loans and 5 leases), 142 option scenarios, offer rules, rates, and judging examples. All 13 extracted files under `reference/toyota_next_move_data_pack` were compared byte-for-byte with the ZIP and match. The snapshot date is **November 7, 2026**. It is intentionally fixed for reproducible demos.

The attached starter prompt and judging examples are reference material, not runtime instructions. Recommendation behavior should follow the customer's current answers and verified eligibility. The app must not load `golden_answers.csv` to select a recommendation.

## Important limitations and conflicts

- **Unknown is not zero.** A null new payment, total-cost difference, or financing cost requires a quote. Most lease buyouts, renewals, and trades have no quoted monthly payment.
- **Lease costs are different kinds of amounts.** A return scenario lists turn-in and projected mileage fees. A buyout lists a purchase price. Neither is an all-in cost of future transportation. Remaining scheduled payments, wear charges, taxes, registration, financing, maintenance, insurance, and replacement transport may be absent. Avoid declaring an absolute cheapest choice from these amounts alone.
- **Renewal waiver conflict:** C003's renewal summary and numeric cost difference imply a $3,770 waiver, but the same scenario caps the waiver at $1,500. Display the cap and need for confirmation; do not promise $3,770 savings. A capped illustrative residual fee would be $2,270 before other costs.
- **Scenario eligibility is broader than offer timing:** all lease buyout and renewal scenarios are marked `Y`, even C010 with 18 months left. The offer catalog limits buyout financing to 120 days before lease end and loyalty renewal to 180 days with credit tier A/B. Lease-end planning can remain visible while immediate offers are unavailable.
- **Calendar days matter:** at the fixed snapshot, C017 has 61 days remaining; C003 92; C006 151; C013 181; C010 547. In particular, six calendar months is not necessarily within 180 days.
- **Loan equity basis:** `account.est_equity` and the trade-in narrative use estimated market value minus current principal balance. The narrative calls that balance a payoff, but `account.payoff_quote` is higher. Label the basis or explicitly derive market value minus the supplied payoff quote. Neither value is a dealer appraisal.
- **Golden examples are not authoritative:** C020's judging text implies trading always rolls the remaining loan into a new loan despite this profile's positive equity. Existing debt may instead be settled from trade proceeds. Do not copy that assertion.
- **No promotions during support:** vulnerable profiles C002, C011, C014, and C016 need supportive human review. C011 has no marketing consent and prefers phone. C002/C014 have hardship; C011's support need is not evidence of financial distress. A customer selecting “struggling” should also trigger support regardless of existing flags.
- **Service safety:** C009 has an open recall and overdue service. Lead with the recall before financial suggestions. A synthetic service scenario with $0 upfront does not establish that every service operation is free.
- `PAYOFF`, `AUTOPAY`, and `HUMAN` exist in the offer catalog but not the joined scenario rows. If implemented, identify them as derived account/self-service/support actions rather than quoted financing offers. Payoff can use the account's supplied payoff quote.

## Demo anchors

| Customer | Useful facts |
| --- | --- |
| C017 Hannah | Highlander lease; $28,200 residual + $350 fee = **$28,550 lease-end buyout**. Market estimate $33,800 gives **$5,250 value advantage**, not guaranteed savings. Two remaining $626.95 payments are separate from that price. |
| C003 Priya | Corolla Cross; 49,500 projected miles vs 36,000 allowance. $3,375 projected mileage fee + $395 turn-in fee = $3,770. Lease-end buyout $16,670; market estimate $18,600. |
| C006 Devon | RAV4 Hybrid; low mileage; $395 return fee estimate; $22,550 lease-end buyout; $26,650 market estimate. Renewal timing is open; buyout financing timing is not yet open. |
| C001 Maya | Eligible refinance: $611.66/month, $56.85 monthly reduction, $2,444.62 less total interest; extension lowers the payment further but adds $1,734.36 total interest. |
| C008 Tom | Eligible refinance: $886.72/month, $89.19 monthly reduction, $4,281.35 less total interest. |
| C012 Marcus | Refinance eligible despite negative equity. Estimated market value $50,600; principal $55,804.05; payoff quote $56,241.18. Trade requires review. |
| C016 Omar | Refinance unavailable: loan-to-value exceeds 125%. Vulnerable flag, negative equity, no autopay. Avoid presenting an extension as an uncomplicated fix. |
| C018 Brian | Existing payday day 15 and due day 1 identify a timing mismatch. Due-date change is a useful service action; actual account changes remain outside the prototype. |
| C020 Victor | Eight $540.47 payments left; principal $4,214; payoff quote $4,238.23. Refinance unavailable; keeping the car and reassessing after payoff deserves comparison against an upgrade. |

All amounts and rules are synthetic estimates, not actual Toyota pricing, financing approvals, or verified offers.
