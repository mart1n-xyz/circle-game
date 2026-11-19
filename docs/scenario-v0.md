# Selected v0 scenario and analysis

This is the operational baseline selected under the user's instruction to make sensible assumptions after analysis. It supplements the [decision register](review-decisions.md); it does not replace the [original blueprint](blueprints/neo-mutual-organisation.md). All amounts are fictional credits, divisible into 100 minor units. This document specifies a future game; it contains no implementation.

## 1. Opening position and household budget

Six members start active, with identical financial positions and recorded admission/active passages. Each has completed two qualifying loans in the scenario's prior history. Their earlier voucher pledges and referral caps are resolved; no undisclosed founding advances remain.

| Each member starts with | Credits / instruction |
| --- | ---: |
| Personal cash outside the circle | 1,500 |
| Membership share | 1,000 |
| Optional circle savings | 500 |
| Remaining cost basis of an existing starter project | 600 |
| Principal still owed on its existing circle loan | 600 |
| Monthly outside income / household expenses | 1,000 / 700 |
| Default monthly share contribution | 100 |
| Minimum contribution to maintain active status | 50 |
| Default additional circle-savings deposit | 0 |

The starter project has three receipts of 220 remaining, one at each of the next three openings. These particular receipts are certain in the introductory scenario. Its remaining principal instalments are 200 each, with interest of 6, 4, and 2. The loan is performing and secured by an exclusive 600 allocation of its owner's share. No other initial encumbrances exist.

This makes the player an established participant with an existing investment and repayment schedule. New opportunities carry risk. Starting personal wealth at remaining cost is 3,000: cash + share + savings + project cost basis − loan principal. The projected project receipts are not also added as cash.

The circle opens with 6,300 cash and 3,600 in performing loans, against 9,000 in member claims and 900 collective reserve. The reserve comes from recorded prior retained earnings, not a new grant. The opening journal and scenario history must reconcile these balances. At P3, a 1,000 upstream membership share replaces 1,000 of that cash, with a matching claim/liability in the parent; it is not an extra asset. The P3 opening history includes the circle's valid check, sustainability event, and fully paid founding charge, so it can consider sponsoring another unit.

After expenses, a member ordinarily has 300/month to allocate between contributions, personal saving, and investment/debt needs. The default contribution leaves 200 in personal cash before project and loan flows. Players may increase, reduce, or stop contributions. Missing the 50 floor removes active permissions at that round's close, for subsequent voting and new pledges; membership and existing obligations persist. Reactivation requires a new simulated active passage and a funded qualifying contribution, not payment alone.

## 2. Lending, collateral, and votes

### Capacity and contracts

Let E be the member's current posted share plus optional savings, less amounts already reserved for another person's loan, an advance/checker claim, or a withdrawal. Own-loan liens remain part of E: subtracting them again would count the same debt constraint twice. Losses and withdrawals reduce E; credited owned earnings increase it. Collective reserve and promised future contributions never enter E.

Let n be the number of completely repaid, never-late qualifying loans in that membership's record. A qualifying loan originated for at least half the admission share minimum (500 in this scenario) and had at least three scheduled instalments. Prepayment is allowed and counts on complete repayment; splitting tiny loans cannot create unbounded capacity.

`principal ceiling = E × (1 + 0.25 × min(n, 4))`

Apply this to **all outstanding principal plus accepted commitments**, not to each application separately. Current contributions count after cash has actually transferred. Initial n = 2 gives a 1.5 multiplier; the maximum is 2. Neither an honesty score nor somebody else's repayment record changes it. Falling below a ceiling after a haircut prevents additional borrowing; it does not by itself accelerate a performing loan.

Use 3- or 6-instalment loans, matched to an approved project plan, with equal principal payments and 1% monthly interest on opening unpaid principal. Interest does not compound; no origination or late fee applies. Early principal repayment is free. The published outer monthly rate bounds are 0–2% for borrowing and 0–1% for saving; the default saving rate is 0.1%. No minimum spread is imposed. A local majority can change future contract rates within applicable lender/protocol bounds; existing loan rates remain fixed.

Every person may submit one new project application per round. Loan proceeds and the person's committed co-funding purchase the named project atomically. There is no personal cash-out, loan-funded deposit, or refinancing product in v0. This is a game use-of-proceeds abstraction, not a claim that the original contract can control money outside the network. Withdrawing and redepositing owned money cannot raise E above the resulting net claim.

### Backing

Reserve own share first, then own optional savings, against principal. Above the aggregate own cover, require one or more active sureties to pledge at least 25% of the uncovered principal. The remainder is genuine circle credit exposure. Nobody is forced to stand surety, and a member's other free funds are not a general guarantee of someone else's debt.

Each allocation belongs to a specific exposure. Voucher cover can be assigned to a newcomer's loan within its stated scope, but cannot also cover a second loan at full face value. One share cannot simultaneously back its owner's loan, somebody else's loan, and an advance. Repayment releases the corresponding own lien; surety cover reduces with its covered excess and is fully released when the loan resolves.

A later deposit made while a member is in arrears/default is applied to recorded obligations before creating a freely withdrawable new claim. This reaches only money voluntarily paid into that unit. Outside cash and projects are never swept.

### Voting and scarce cash

Snapshot active voters at round opening. Freeze the amount, term, disclosures, and backers before voting. Exclude the borrower and any member whose existing or proposed pledge backs the application. With N eligible voters, require `max(2, floor(N/2) + 1)` yes votes. Zero or one eligible voter cannot approve; a tie or insufficient participation fails. New terms or a changed backer require a new decision version.

For ordinary policy, admission, and surplus decisions, use the same strict-majority/minimum-two rule on the applicable active electorate. Admission excludes the applicant; expulsion excludes its subject. No extra exclusions based on inferred friendships or political affinity are invented.

After due withdrawals, sort otherwise valid approved loans by a seeded uniform draw over unique applicant IDs, then fund each whole affordable application in that order. Skip one that cannot be fully funded and consider the next; do not silently lend a smaller amount. Approval expires at round end. One application per member prevents gaining draw tickets by splitting requests. Pledges and own funds for unfunded applications are released.

## 3. Liquidity, withdrawals, and exit

Optional-savings withdrawals requested in round t become due in t+1. Earmark the requested claim immediately; it cannot also back new borrowing. Encumbered funds cannot enter the withdrawal queue. If reducing E would breach existing principal capacity, only the capacity-preserving amount can be earmarked.

First settle due external/unit obligations and protect cash for the next scheduled upstream debt service. From the remaining cash, pay **all due withdrawal requests pro rata by amount**, including requests left over from earlier rounds. Aggregate requests by member so splitting does not change treatment. Unpaid portions remain claims in the queue.

For new lending only, additionally retain cash equal to 10% of remaining member shares plus optional savings. This is a cash-management rule, not collective reserve or a guaranteed withdrawal fund. Due withdrawals may use that cash; new loans may not. A positive reserve with no available cash still means withdrawals wait.

At every payout, a borrowing unit must retain sufficient net assets to cover its outstanding upstream obligations. Apply this coverage check to both share exits and optional savings in the game. Neither a loan vote nor a withdrawal instruction overrides existing creditors.

Share withdrawals require departure. On an exit instruction, stop future new commitments, set off own debt and unearned advances, and lapse accruing referral rights. Free claims join the same one-round notice process. Existing guarantees remain attached until their exposure resolves; the membership record stays in an exiting state while claims/obligations remain. There is no exit fee or payout of reserve.

## 4. Arrears, default, and surplus

### Failure and recovery

Project failure only changes the household's receipts and recovery cash. An authorised payment instruction may still pay the loan from other available personal cash; the player may change that instruction before its next execution. Required household expenses precede authorised loan payments, then contributions and new spending.

An unpaid instalment at its due date creates arrears and stops new credit. A borrower has until the next due-date settlement to clear arrears. If anything from that older due date remains unpaid, default all that borrower's loans in the same circle together; accelerate principal, stop further interest, and cancel undisbursed commitments. Future unearned interest is not a debt. Payment instructions allocate to oldest due interest and principal first, with interest before principal within a due date.

Set off the borrower's own eligible share, then eligible optional savings, then the assigned voucher/surety pledges. Respect funds already exclusively encumbered for another beneficiary. Called pledges reduce the covered borrower obligation; the baseline creates no new reimbursement loan from borrower to surety. Allocate limited shared cover pro rata across the covered defaulted loans. Collateral settlement cancels principal first; any earned unpaid interest actually settled from a funded claim is recognised once as noncash interest collection. Unrecognised interest is not also written off as a loan-asset loss.

Recognise the remaining loan-asset loss once. Current net operating earnings absorb it; any deficit consumes reserve, then member share claims pro rata, then optional-savings claims pro rata. A haircut reduces even encumbered claims' backing value; an encumbrance does not insure the underlying claim. Recalculate all resulting exposures.

A lender write-off removes an asset from its books, **not the unpaid balance from the borrower's record**. The residual principal and earned unpaid interest remain a personal obligation for scoring; no new interest accrues. No new loans follow a default during that season. Expulsion remains a separate vote. This is the selected interpretation of the source's unstated discharge policy, with no extra right to collect outside the unit.

Voluntary later recoveries reduce that residual obligation. For principal previously written off, first restore the member claims actually cut for that exposure, then the reserve used for it. Only any genuinely additional interest is income. Keep a recovery register so original losses, restorations, and scoring are not counted twice.

### Closing the books

Credit 0.1% saving interest on the portion of opening share/savings balances still held before appropriation; new deposits begin earning next round. Amounts withdrawn, set off, or cut during the round do not earn for that round. This conservative snapshot convention also supplies the base for default share dividends. Use the same convention consistently in previews and attribution.

Calculate interest actually received + permitted fee/charge income − saver/lender costs − applicable expenses − recognised residual loan losses. Interest merely hoped for is not income. Retain 25% of a positive result. A negative result follows the deficit waterfall above; do not subtract it independently from reserve a second time.

After required retention and bounded growth allocations, the initial member-approved policy credits the discretionary remainder to optional savings in proportion to eligible opening shares. Members may vote prospectively to use future discretionary surplus for work, community purposes, or sponsorship. Retained capital is never distributed. Share dividends can change relative owned balances if contributions differ; voting remains one active member, one vote.

Round rates/contract amounts to the nearest minor unit, half up. Round required minimum backing upward. Allocate pro-rata residual cents by largest remainder, with stable seeded ties; all allocations must sum to the actual available amount.

## 5. Opportunities, evidence, and credibility

### Project menu

Two offers arrive privately per member per decision round, drawn without replacement from three families. Each member may start one. Offers expire that round; declining does not reroll them. Offer generation and outcomes use stable event keys, independent of unrelated actions.

| Family | Upfront cost | Receipts if it survives | Prior weights over lifetime failure risks [5%, 15%, 30%, 50%] |
| --- | ---: | --- | --- |
| Equipment lease | 1,200 | 240/month for 6 months | [0.60, 0.30, 0.10, 0.00] |
| Seasonal order | 1,200 | 0, 0, then 1,560 over 3 months | [0.15, 0.45, 0.30, 0.10] |
| New venture | 2,400 | 540/month for 6 months | [0.05, 0.15, 0.45, 0.35] |

The server draws the latent lifetime failure risk p from that family's prior. Over T months, the conditional monthly hazard is `1 - (1 - p)^(1/T)`. Test failure before that month's receipt. Failure cancels all future receipts and pays a one-off recovery of 20% of remaining straight-line cost: `0.20 × cost × (T - t + 1) / T` at project age t. There is no extra terminal salvage after successful scheduled receipts.

Projects in the same family share a sector factor. In each month, independently, a sector uses a common uniform failure draw with probability 30%; otherwise each project uses an independent uniform draw. Compare the applicable draw with its own hazard. This produces correlated failures while preserving each project's marginal lifetime failure probability; it does not add another disaster probability on top.

### What the applicant and peers know

The applicant sees a private inspection signal in the four risk bands, not the true p. An inspection identifies the actual band with 70% probability; otherwise it chooses an adjacent band, splitting the remaining 30% equally between neighbours where there are two. Edge bands have one neighbour.

Peers always see the real family, cost, payout timetable, requested contract, committed co-funding, and relevant existing circle exposures. The applicant chooses one of three presentations:

1. Attach the verified inspection: peers receive its exact signal.
2. Claim that the inspection reported a chosen band, without attaching it. The claimed band may differ from the actual signal.
3. Withhold the inspection and its claimed band.

This gives strategic optimism a specific meaning rather than an arbitrary “lie” button changing project truth. Verified disclosure supplies evidence; attaching it does not itself farm extra honesty points.

### Inference and later verification

Display a posterior mean and central 80% estimated interval over lifetime failure probability, naming the horizon. Start from the family prior. A verified inspection uses the known signal likelihood. An unverified claim j uses likelihood `q × P(signal=j | risk band) + (1-q)/4`, where q is the borrower's disclosure reliability estimate.

Use a Beta(2,2) initial disclosure record: `q = (2 + verified_matches) / (4 + audited_claims)`. The visible score is 100q, accompanied by audit count and evidence type. Every funded project with a public application independently has a 50% chance of a disclosure audit on completion/failure that reveals its original inspection to its circle. An unverified claimed band matching that record adds a match; a different band adds a mismatch. A mere project failure changes neither count. Omitted claims and already-verified attachments have no new truthfulness result. Purely self-funded private projects do not acquire public inspections through this process.

Withheld evidence uses the family prior reweighted by [1, 1.25, 1.5, 2] from lowest to highest risk. This is an explicit initial assumption about strategic selection, not secret access to the applicant's signal. High credibility cannot cancel missing evidence. The model may still be misled by selective claims; intervals are inference under a stated model, not guaranteed bounds. Log omission frequency separately.

Human and bot assessors can inspect the evidence and disagree with the displayed estimate. Higher q places more weight on an unverified claim; it can narrow uncertainty or move the estimate toward a higher risk. Verified evidence can be informative even for someone with little history. Keep disclosure reliability, repayment performance, and sample size separate throughout.

Project disclosure audits are game evidence events. They are separate from the blueprint's unit identity checks and audits described below.

## 6. Competition and completion

Run rounds 1–24 normally. No new projects, loans, guarantees, admissions, sponsor advances, or additional voluntary circle deposits are accepted in rounds 25–31. Run-off continues common household income/expenses, previously authorised standing contributions, existing payments, project outcomes, withdrawals, checks needed for existing claims, losses, and allocations. Payment, contribution-cancellation/reduction, withdrawal, and exit instructions remain available for settling existing positions. Contributions cannot be increased during run-off. Active status continues to follow actual funded contributions; existing guarantees and obligations persist. There are no fresh discretionary governance decisions.

Projects and ordinary loans last at most six months, so a position funded in round 24 has its last receipt/instalment in round 30; the final grace/default settlement occurs in round 31. Existing advances settle by their earning or exit-set-off event at the endpoint. No automatic refinancing or new commitment may extend the horizon.

Final score is personal cash + remaining recoverable member claims − residual personal obligations. All project receipts and recoveries have already become cash; add no separate project value again. Include defaulted unpaid obligations and unearned advances still unresolved. Never include collective reserve or an imagined share of future circle profits.

Using the full recorded unpaid obligation is a conservative scoring convention: its lender may have recognised little or no recoverable value. It discourages taking a default solely to improve the finish. It is not a claim that the blueprint grants recovery against outside assets or explicitly forbids debt discharge. Show the unpaid balance separately, and do not use the sum of these individual scores as the network's consolidated wealth or loss.

At the endpoint, resolve unit claims bottom-up through the stated loss/creditor rules. In the single-circle scenario, performing loans have finished or been written off and the surviving claims are cash-backed. A claim pending withdrawal can count at its reconciled recoverable amount, but remains labelled a claim rather than cash. If a network resolution has not converged or a material exposure lacks a value, keep the result provisional; do not assign face value to finish a leaderboard.

Intermediate standings are explicitly provisional, using remaining project cost basis and currently recognised claims/debt. Do not publish other players' hidden inspections or latent risk parameters. Exact numerical ties share a rank. Cross-room ranking is deferred; offline practice is labelled unverified.

## 7. Network and growth defaults for P3

The same rules apply recursively, with these choices for gaps in the source. This section is selected scope for P3, not a reason to build those systems during planning.

- **Admission and passages:** require a 1,000 paid-up share and two active vouchers, each pledging 100, before an admission vote. Simulate the relevant in-person passage. Each voucher pledge releases when the newcomer completes a qualifying loan or contributes another 500 after admission, provided no loan still relies on that pledge. Reactivation needs the corresponding active passage. For the founding bootstrap only, at least three founders jointly ratify the founding passage, funded shares, mutual voucher pledges, and initial active memberships in one transaction. This is a selected game interpretation; it does not bypass parent admission or the independent first check.
- **Sponsor identity:** name one direct sponsor at initial admission, even if several memberships are agreed together. Other memberships create their own funds, loans, checks, and creditor claims, not additional founding charges.
- **Referral attribution:** use one internal rate at the midpoint of current saving/borrowing policy rates (initially 0.55%). Start from borrower interest actually received less the internal-rate charge on opening principal, plus the saver spread on eligible held balances, less residual losses on that member's loans. Carry negative attribution against that member's future positive attribution. Scale positive credits to total post-loss/post-retention surplus; unallocated positives are not debts or arrears.
- **Referral payout:** from the first qualifying positive attribution, allocate 20% of that member's scaled credit to the direct newcomer/vouchers, capped in total at 10% of the admission share. Half goes to the newcomer and half to the direct vouchers in proportion to their original pledges. Fix rates, recipients, and caps at admission; no downstream referral tree.
- **Sustainability and charge:** sustainability occurs on a valid check pass, positive post-cost/post-loss operating result, and reserve reaching 10% of member claims. Thereafter allocate 20% of available post-retention surplus as founding charge until the admission-agreed cap of 50% of the unit's share paid into its sponsor. Pause without surplus and lapse on closure. This is an event threshold, not a minimum age.
- **Competing growth allocations:** compute referrals and the founding charge against the same available surplus, honour individual caps, then scale their current allocations proportionally if necessary. No senior debt, unpaid-reward receivable, or automatic carry-over is created. Distribute only what actual surplus funds.
- **Advances and organiser pay:** a sponsor may vote to fund the initial 20% of the referral cap as an advance on the paid-up-share/admission event, and the remaining 80% on the additional-500-contribution event before the new unit has its own surplus. Split between recipients as above and reserve each recipient's own share against their unearned amount. These are optional founding costs. The applicable recipient's referral entitlement clears their advance first, instead of paying a second reward; any per-member organiser advance releases proportionally with the associated newcomer advance. Organisation-work pay remains a separately approved sponsor expense. No advance exceeds the recipient's free share or the admission-agreed cap.
- **Checks:** each parent draws each member unit for a check with probability one-third per monthly epoch. Draw the common meeting window, eligible checker, and a sample of `min(active_count, max(3, ceil(sqrt(active_count))))`. Require every sampled identity to appear and pass; an empty active set cannot pass. Organisers, vouchers, and sureties cannot check their dependent unit.
- **Pass validity:** a pass remains valid until a contrary check/audit or a change affecting at least 25% of the recorded active roster. Invalidity suspends new above-own-cover credit, upstream voting, and unreleased sponsor payments; it does not cancel debts or force a performing loan into default. A new valid check restores those permissions. Distinct parents check separately.
- **Audits and fees:** audit 25% of checks, independent of prior pass rates, with the source's layer-above exclusions/termination. A parent pays its checker 10 from its spread or a voted member fee; credit it to the checker's share and hold that fee itself until the next audit-window resolution. Contradiction reverses that fee. The auditing layer pays an auditor 5 on the same held-fee basis. Require funding and an eligible checker/auditor rather than inventing a pass. No additional checker bond is imposed.
- **Offices and internal oversight:** members elect a facilitator for six rounds using the ordinary threshold, with recall by the same threshold. The facilitator schedules passage/proposal events but gets no extra vote, hidden information, or treasury authority. Members receive the permitted ledger, commitment, and decision trail and can request available evidence. This supplies a minimal form for the source's retained elected offices; it is not a separate enforcement office over other units' money.
- **Multiple creditors:** settle uniquely assigned secured claims once; allocate the defaulting unit's remaining estate pro rata among its remaining upstream creditor claims, before its own members. Only then call the relevant upstream sureties and lender loss waterfalls. A pledge is not counted twice as an estate asset and an additional recovery. Network resolution must reach a consistent final set of recoverable claims.
- **Closure:** remaining collective capital goes to the agreed parent selected at admission. Where no parent exists, retain it in a closed collective estate with no individual beneficiary. This explicitly fills the source's orphan-unit gap; do not turn it into a member dividend.

Network scenarios must seed enough independently eligible units for checks and supply balanced histories, funding, and actual exposures at each layer. No pool grant or unexplained liquidity injection is part of the default. Later institution-specific products remain outside the supplied design.

## Worked analysis

These are arithmetic checks of the selected rules, not simulation or playtest results.

**Opening solvency and an ordinary month.** Assets are 6,300 + 3,600 = 9,900; liabilities plus reserve are 9,000 + 900 = 9,900. With no new investments/withdrawals, six starter loans pay 1,200 principal and 36 interest in round 1; contributions add 600. Saver interest is 9. Net surplus is 27, of which 6.75 is retained and 20.25 credited as dividends. The close has cash 8,136 + loans 2,400 = claims 9,629.25 + reserve 906.75. Principal and contributions generated no profit.

**Why useful lending is feasible.** After that member's first 200 repayment and 100 contribution, E is 1,600 and the 1.5 multiplier permits 2,400 total principal. With 400 still owed, up to 2,000 of new lending is possible. Own available cover for it is 1,200; its 800 excess needs at least 200 in surety pledges. Funding a 2,400 venture would also need 400 of personal co-funding. The voter threshold still applies.

**Why a payout schedule matters.** A fully borrowed 1,200 seasonal order on a three-month loan owes 412 and 408 in the first two months, while the project pays zero. The default household budget leaves 200/month after expenses and contributions, so at least 420 of additional personal cash is needed across those two dates. A profitable terminal forecast is insufficient by itself.

**Indicative project economics.** Expected receipts below average the stated risk bands, hazards, and recoveries analytically. Loan interest assumes every scheduled payment is made; this is not a forecast of a limited-recourse default strategy, nor a full personal return including circle interest/dividends.

| Family | Prior expected total receipts | Upfront cost | Full-loan scheduled interest | Receipts less cost and that interest |
| --- | ---: | ---: | ---: | ---: |
| Equipment lease | 1,364.60 | 1,200 | 42 | 122.60 |
| Seasonal order | 1,260.38 | 1,200 | 24 | 36.38 |
| New venture | 2,662.16 | 2,400 | 84 | 178.16 |

An inspection can materially change those expectations. The seasonal order converts capital more quickly but needs a cash bridge; the venture needs more funding and exposes more money. The table alone does not establish equally strong strategies.

**Saver cost and liquidity.** On the opening 9,000 member claims, 0.1% saving interest costs 9/month. At a 1% lending rate, 900 of performing principal earning a full payment covers that cost before losses/other expenses. Idle funds and defaults can therefore produce a deficit. Separately, if due withdrawal requests total 1,200 but payout capacity is 300, every request receives 25% and 900 stays queued. Neither a positive net surplus nor a large reserve promises immediate cash.

**Fairness and end conditions.** A six-seat loan with the borrower and two sureties recused has three eligible voters and needs two yes votes. Everyone faces the same threshold and random funding policy. Six-month final commitments end by round 30, with default resolution in round 31. Borrowing 1,000 adds 1,000 cash and 1,000 debt, hence zero score. A subsequent write-off alone changes neither that unpaid obligation nor the rule excluding reserves.

Before calling the game balanced, the authorised build must test interest/claim rounding, queue and collateral interactions, interval behaviour under strategic disclosure, long-run strategy outcomes, and recursive loss resolution. Those are engineering/playtest work, not decisions still waiting for the user.
