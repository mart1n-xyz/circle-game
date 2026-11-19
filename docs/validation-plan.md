# Validation plan for the later build

This file specifies meaningful future checks. No game code or tests are being implemented during the documentation phase. Source B IDs refer to [model-map.md](model-map.md); D IDs refer to [review-decisions.md](review-decisions.md). Selected numeric fixtures and interpretation choices come from [scenario-v0.md](scenario-v0.md).

## Accounting and institutional invariants

| ID | Check | Expected result / requirement |
| --- | --- | --- |
| V01 | Reconcile every closed period and every unit | Cash, net loans, and upstream holdings equal member claims, borrowing, and reserve. Open-period clearing accounts also reconcile. B16/B17/B32. |
| V02 | Contribute, deposit, borrow, buy a project, repay principal, and withdraw | Transfers conserve value with named external counterparts; none is misclassified as earned interest or reserve creation. B07/B14. |
| V03 | Credit saver interest and retain surplus | Member liabilities and equity change correctly; no second cash inflow is invented. B16/B17. |
| V04 | Run the isolated 120-assets / 100-claims / 20-reserve accounting fixture | End with 60 assets, 60 claims, and zero reserve after the specified default; no duplicated loss or fictitious cash from set-off. This fixture does not assert a valid fresh v0 origination; integrated origination is checked separately. B19/D04/D06/D07. |
| V05 | Commit the same share to several liens, sureties, and an advance | Combined encumbrances cannot exceed available funds; concurrent requests cannot reuse collateral. Releases and calls affect each allocation exactly once. B13/B19/B25. |
| V06 | Apply for several loans at once or recycle borrowed proceeds into deposits | Validate total outstanding/committed debt and the selected eligible-cover definition; do not accidentally create unlimited borrowing capacity or profit. B13/D02. |
| V07 | Change savings balance while keeping active status | One active member still has one vote. Rank, wealth, and credibility confer no extra vote. B05/B10. |
| V08 | Miss an active contribution, then attempt to vote, pledge, or borrow | Apply the chosen lapse timing; lose future active permissions while keeping membership. Existing obligations remain. Borrowing follows own cover/ceiling/sureties rather than an invented attendance requirement. B05/B08/D03. |
| V09 | Request a loan within the ceiling but without approval, backing, or cash | No disbursement. Approval alone cannot override other constraints or lender terms. B13/B15. |
| V10 | Fail a project while the borrower has other cash | Loan remains due; voluntary repayment can prevent default. No automatic seizure of outside personal assets. B19/D06. |
| V11 | Issue 1,200 of due withdrawals against 300 payout capacity | Pay 25% of each aggregated request, leave 900 queued, and fund no new loans from cash due to withdrawals. Apply creditor protection and the separate new-lending cash buffer. Distinguish cash shortage from insolvency. B09/B17/D05. |
| V12 | Close or leave a unit with reserve and outstanding obligations | Apply set-offs, preserve other claims and creditor rules, and never pay members an individual slice of collective reserve. B03/B09/B17. |

## Information, incentives, and scoring

| ID | Check | Expected result / requirement |
| --- | --- | --- |
| V13 | Compare disclosed high-risk and low-risk signals, later audits, and project failures | Credibility changes the weight of unverified claims, not latent risk or formal ceilings. A failed project alone changes no honesty count. Audits compare the claim with the original inspection; verified attachments cannot farm score. U07/D08. |
| V14 | Evaluate risk intervals under honest, selectively omitted, and strategically false claims | Check central 80% posterior intervals against the stated inference assumptions, measure deviations under strategic play, and show their limitations. No direct leakage of hidden parameters, guaranteed bounds, or omission bypass via a high score. D08. |
| V15 | Apply a lifetime failure probability over several rounds | Observed outcome frequencies agree with the chosen horizon/hazard model; lifetime probability is not reapplied as a monthly probability. D09. |
| V16 | Share an external shock across projects | Outcomes exhibit the configured common exposure, with the same conditions for humans and bots. No scripted universal failure is required. D09/D16. |
| V17 | Inspect browser storage, requests, subscriptions, and replays | No unauthorised true risks, future draws, private portfolios, or undisclosed evidence are exposed in multiplayer. B04/D08/D16. |
| V18 | Give a bot and a human the same observed state | Both can take the same legal actions; the bot policy never receives hidden advantages or rescue funds. D11. |
| V19 | Take a large loan just before scoring | Cash is offset by debt; borrowed principal is not profit. Unresolved exposure prevents premature final ranking. U09/D10. |
| V20 | Complete a season with project residuals, unearned advances, guarantees, unpaid defaulted loans, and queued withdrawals | Final score includes recoverable claims and residual obligations, excludes reserve, and adds no project proceeds a second time. A write-off alone does not forgive debt. Unresolved network valuations keep results provisional. B17/B25/D06/D10. |
| V21 | Compare wealth with identical proportional reinvestment | Relative member balances remain unchanged absent other flows. Separately track changes caused by contributions, withdrawals, rewards, losses, and voting eligibility. U08/B05/B07. |

## Multiplayer and recursive model

| ID | Check | Expected result / requirement |
| --- | --- | --- |
| V22 | Duplicate a command, reconnect after a crash, or send a stale vote | Idempotent settlement; no repeated transfer; votes apply only to the exact approved proposal; a room resumes from persisted state. D03/D11/D16. |
| V23 | Simultaneous approved requests exceed available liquidity | The seeded draw over unique applicants resolves competition after withdrawals. No arrival-speed advantage, extra tickets from split applications, or unapproved partial loans. Released commitments cannot be counted twice. D03/D05. |
| V24 | Replay a room and compare a policy variant | Exact replay reproduces outcomes; stable keyed external draws make policy comparisons interpretable. D16. |
| V25 | Place A's spare savings in R and lend from R to B | Record real assets/liabilities at each layer, with bounded terms and no free liquidity. B18/B21/B23. |
| V26 | Default a unit with several obligations and pledged backers | Resolve the selected creditor/encumbrance priorities, member-first loss order, and upstream propagation without counting the same backing repeatedly. B03/B21/D12. |
| V27 | Run referrals, founding charges, and advances through earning, exit, and insufficient-surplus periods | Pay only permitted amounts, retain first, respect caps, avoid double rewards, recover unearned claims correctly, and never turn the founding charge into debt. B24–B27/D07. |
| V28 | Draw checkers, samples, and auditors; miss a sample or contradict a check | Apply exclusions, missing-member treatment, pass permissions, held fees, and audit consequences. No credibility-based substitution for identity checks. B28/B29/D12. |
| V29 | Sponsor another unit from an established-circle game | Follow vouching, share, admission, check, sustainability, and charge events with real funding. No reward simply for splitting or elapsed play time. B24/B30/B32. |

## Selected-scenario checks

| ID | Check | Expected result / requirement |
| --- | --- | --- |
| V30 | Close the first v0 round with default contributions and no new business | Cash 8,136 + loans 2,400 = member claims 9,629.25 + reserve 906.75. The 27 surplus contains interest less saver cost, not principal or contributions. D02/D07. |
| V31 | Compute first-round capacity and collateral after dues/contribution | E = 1,600; aggregate ceiling = 2,400; old debt = 400; maximum new principal = 2,000; own cover available for it = 1,200; minimum surety = 200. Another pledge or withdrawal reduces capacity before execution. D02/D04. |
| V32 | Vary eligibility, recusal, abstention, lapse, and frozen terms | Three eligible voters require two yes votes; four require three; zero/one cannot approve. Abstentions do not lower thresholds. Lapse affects the next snapshot, and changed backing requires a fresh decision. D03. |
| V33 | Finance the seasonal order entirely on a three-month loan | The first two dues are 412 and 408 against zero project receipts; the default 200/month post-contribution household budget leaves a 420 cash bridge. A positive expected terminal return does not imply interim affordability. D09. |
| V34 | Fund a six-month position in round 24 and miss its final instalment | Its final scheduled receipt/due date is round 30; grace/default resolves in 31. No new commitments extend the horizon. Standing contributions can continue or be reduced/cancelled, without manufacturing votes or losing existing guarantees. D06/D10/D11. |
| V35 | Earn rewards, then incur a late loss and make later recoveries | No ordinary reward clawback. Negative attribution offsets that member's future credit; written-off principal recovery restores the claims/reserve actually lost before being treated as distributable income. No double earning of an advance. D06/D07. |

## Product acceptance

- Start play inside the circle with existing funds and a contribution instruction. Do not require a founding tutorial.
- In one ordinary season, a player can adjust saving, inspect opportunities, request a loan, assess another member, vote/pledge, receive project proceeds, repay, inspect surplus, and finish with an understandable score.
- Show normal successful lending and saving as well as possible losses. Do not secretly force crises or give cooperative behaviour an undisclosed scoring bonus.
- Make cash, claims, encumbrances, loans, reserve, credibility, and voting status understandable and distinct.
- Verify action previews and resulting journals agree. Include readable focus states, keyboard-operable choices, and adequate text sizing in browser checks.
- At P2, several humans can finish the same room with correct private views and reconnect behaviour. Offline practice is not advertised as verified multiplayer.
- At P3, audit every B row for actual coverage. Features deferred during P1/P2 cannot disappear from the final model demonstration.

Run focused checks when each mechanism is implemented. Expand testing when a new mechanism, failure, or unresolved concern warrants it; avoid repeated broad runs without a reason.
