# Blueprint-to-game mapping

This is the traceability contract for a later build. References point to the [unchanged supplied blueprint](blueprints/neo-mutual-organisation.md). Stage names are defined in the [plan](plan.md). `P1+` means the rule begins in P1 and remains applicable; a later stage is deliberate staging, not permission to omit the feature from the complete demonstration.

Statuses:

- **Source:** required by the supplied model, with its stated degree of firmness.
- **Source proposal:** explicitly undecided in the source; choosing it is a documented game assumption.
- **User:** required by the user's game brief.
- **Game proposal:** a suggested playable interpretation or abstraction.
- **Open:** insufficiently specified; see the decision register.

## Institutional requirements

| ID | Source | Requirement and game treatment | Stage / status |
| --- | --- | --- | --- |
| B01 | §§3.1, 10 | A unit owns its treasury; members can be persons or other units. Represent these as the same membership/lending concepts. Other units are not branches commanded by the player. | P1 data model; P3 recursive play / Source |
| B02 | §§3.1, 3.4 | Units may belong to several units or none. Formation is open; admission and access to network funds still require consent and qualification. The first unit owns the starting pool. | P3 / Source |
| B03 | §§3.2, 4.5 | A borrowing unit cannot pay out member shares below what it owes. Apply unit-level obligations before extracting member value; operational coverage and liquidity tests require a selected rule. | P3 / Source + D05 |
| B04 | §§3.3, 3.5 | Contracts enforce books and money rules; identity, meetings, and project use are outside the ledger. Emulate contractual enforcement, proofs, and passage/check events in the game. Preserve private views across circles. | P1+ / Source; technology abstraction D14 |
| B05 | §4.2 | Guest, member, and active member are different statuses. Only active members vouch, stand surety, and count in decisions. Payment preserves active status after a passage; wealth never increases vote count. | P1+ / Source |
| B06 | §4.3 | Admission needs member vouching with pledged funds, a paid-up share, and local approval. No direct admission by a federation. Initial characters have a valid recorded history; later admissions are playable. | P1 initial history; P3 admissions / Source; ordering gap noted in D12 |
| B07 | §4.4 | Recurring contributions are member-owned saving into the share, not fees. Optional savings and voted fees remain separate accounts. Contributed money helps fund lending. | P1+ / Source |
| B08 | §§4.2, 6.1 | Active-status lapse does not end membership. Credit above own cover depends on ceiling and sureties, not meeting attendance or active status alone. | P1+ / Source |
| B09 | §§4.5, 18.4 | Departure sets off obligations and unearned advances; accruing rewards lapse. Withdrawal notice, payout order, and other exit terms are not specified. Never invent an unconditional instant exit. | P1+ / Source + D05 |
| B10 | §§5.1–5.2 | Admission, becoming active, and founding are passages; other activity can be remote. Unit decisions require a threshold/quorum of active members. | P1+ / Source; threshold D03 |
| B11 | §§5.2, 18.2 | Borrower and surety exclusion from loan voting is proposed, not decided. Keep it a visible configurable choice, with related-party scope separately specified. | P1+ / Source proposal D03 |
| B12 | §§5.3, 7.2 | Optional charter, permitted loan purposes, and member-directed surplus can support community goals. The draft mandates no social programme and pays nothing automatically for civic work. | P1 purposes; P3 optional community choices / Source |
| B13 | §6.1 | Lend only within the borrower's ceiling based on own contributions and own repayment record. Above own cover, require active-member sureties. Unit approval remains necessary for every loan. | P1+ / Source; formula and cover D02/D04 |
| B14 | §6.1 | Principal returns to the lending fund; interest is income. On nonpayment, apply defined set-offs and stop further loans; expulsion is a separate vote. | P1+ / Source; timing/resolution D06 |
| B15 | §§6.2, 6.3 | Lending uses member funds and chosen upstream borrowing. No nonmember deposits or automatic pool grants. Unit rates sit within lender terms within protocol bounds; no protocol fee or fixed protocol spread. | P1 local; P3 upstream / Source |
| B16 | §§7.1–7.2 | Calculate surplus after savers/lenders, loan losses, and applicable fees. Keep the required share first; then apply bounded referrals/founding charges; members decide remaining surplus. | P1 local surplus; P3 rewards/charges / Source; D07 |
| B17 | §7.3 | Reserve is collective net capital backed by assets, including loans. No member can withdraw it as a dividend or on exit. Residual assets on winding up go to a unit the circle belongs to, not individual members. | P1+ / Source; terminal edge cases D10/D12 |
| B18 | §§7.4–7.6 | Fees require member decision. Spare money may be placed in an upstream unit. The unit itself places no money outside the network; personal member projects are distinct. | P1+; P3 placements / Source |
| B19 | §8 | Personal-loan loss sequence: borrower funds and pledged cover, unit reserve, then other member claims. A person's reachable liability is limited to paid-in/pledged funds; do not seize external personal assets automatically. | P1+ / Source; exact account priority D04/D06 |
| B20 | §§8, 18.2 | Shares losing before optional savings is a proposal. Preserve it as a selected assumption rather than an unconditional blueprint rule. | P1+ / Source proposal D06 |
| B21 | §8 | Between units, a defaulting unit's share and all its assets/member value lose before upstream lender exposure; then applicable sureties, lender reserve/member claims, and further layers. Creditors and overlapping obligations require explicit accounting. | P3 / Source + D12 |
| B22 | §9 | Routine work is unpaid; optional rewards come from surplus after losses and retention. No per-loan pay or payment from interest as it arrives. Organising pay has its own source rules. | P1+ / Source |
| B23 | §10 | Units hold spare funds, lend to admitted units, check, and sponsor. Each funding layer has its own actual cost and permitted spread; loans carry enforceable terms. | P3 / Source |
| B24 | §§11.1–11.3 | Sponsor funds organising; admission includes vouching and a share. Founding charge starts at a sustainability event, is paid only from surplus, has an agreed bound, reaches the direct sponsor, and stops at its total. It is not debt. | P3 / Source |
| B25 | §§11.3–11.5 | Optional early rewards and per-member organiser pay are bounded claims against the appropriate recipient's share until earned. Exit recovers unearned advances; the member does not earn the same reward twice. Distinguish the organiser's three payment types. | P3 / Source; claim details D07 |
| B26 | §12.1 | Referral rewards go to newcomer and direct pledged vouchers, only from attributed post-loss surplus after retention. Accrue to a cap, pause without surplus, lapse on departure, and never create an unlimited referral tree. | P3 / Source |
| B27 | §12.2 | One internal rate allocates saver and borrower contributions; scale credits down to available surplus. Keep source credit, reward allocation, and actual cash payment separate. | P3 / Source; attribution governance D07 |
| B28 | §§13.1–13.3 | Draw check timing, active-member samples, and eligible checkers; exclude organiser/vouchers/sureties. Pass opens unit credit above own cover, its count upstream, and founding payments. Missing sampled members count against it. | P3 / Source; pass lifetime/failure effects D12 |
| B29 | §13.4 | Upstream audits repeat a random share; audit share does not shrink with pass rate. Checker fee is held and can be lost. Additional checker bonds are a held-back fallback, not baseline. Identity checks do not certify project quality or political independence. | P3 / Source |
| B30 | §§14.1–14.2 | Growth includes more members and more units. The protocol fixes no unit-size cap. No reward is due merely for splitting a unit. A six-seat game room is a scenario choice, not a protocol constraint. | P3 / Source |
| B31 | §§3.1, 5.2, 15.3 | The first unit controls protocol changes and ends the audit chain. Its governance/capture remedy is not designed. A season's frozen rules are a game convention, not a claim that the source solves this issue. | P3 / Source + D12/D16 |
| B32 | §§16.3–16.8 | Preserve stocks, flows, and closed-period accounting identities. Growth and eligibility are event-based. Monthly turns implement user pacing, not arbitrary time-served unlocks. | P1+ / Source + User |
| B33 | §§14.3, 18 | Bank, building society, healthcare, insurance, and several governance details remain undesigned. Do not implement invented institutional rules as if they were in the blueprint. | All stages / Source boundary |

## Game additions and their boundaries

| Addition | Basis | Boundary |
| --- | --- | --- |
| Established-member start | U03 | Opening balances and rights must have a valid scenario history; do not force founding onboarding. |
| Monthly income, expenses, personal saving | U03/U08 | External household economy is a game layer; circle contributions remain member claims. |
| Personal investment opportunities and payouts | U04/U05 | Unit purpose rules, ceilings, approval, and liability still apply. Circle treasury does not directly speculate outside the network. |
| Credibility-dependent intervals and strategic disclosure | U07 | This models information and judgement. It is neither source-defined underwriting nor a replacement for identity checks or own-record ceilings. |
| Shared multiplayer room and bots | U09 + game proposal | Humans and bots obey the same action constraints; room size, timing, and bot policy are settings. |
| Leaderboard and a finite season | U09 + game proposal | Rank has no governance rights; collective reserve is excluded; residual obligations cannot be ignored. |
| Automated passage/check events | Game proposal | A browser simulation does not prove real-world identity, attendance, or physical meetings. |
| No actual blockchain or money in the prototype | Game proposal | Emulate source contract semantics; do not represent the prototype as a financial deployment. |

## Handling changes and omissions

Every implemented rule should identify its B/U requirement or a decision ID. A missing source mechanism belongs in the staged backlog and release coverage report. Changing a decided institutional rule requires a recorded user-requested variant. The earlier economic review supplies useful validation cases; proposed safeguards from that review are not automatically adopted model rules.
