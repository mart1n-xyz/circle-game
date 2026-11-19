# Game plan

**State:** the user subsequently authorized the build. P1 is implemented as a private browser board game with one player and five bots. See [build notes](build-notes.md) for actual coverage and checks. P2–P4 remain the delivery roadmap below. The [decision register](review-decisions.md) explains the choices; the [v0 scenario](scenario-v0.md) specifies them.

## Product brief

Build a playable browser demonstration of the Neo-Mutual Organisation savings-and-loans model from an individual member's perspective. The player is already in a functioning circle with other members, a paid-up share, money allocated to the circle, an ongoing monthly contribution, and personal savings held aside.

Outside opportunities require upfront investment and offer uncertain future cash flows. The player can fund them personally or apply for a circle loan, hoping project returns will service that loan and produce a personal profit. Other members have comparable opportunities and apply to the same pool. The player assesses their applications through incomplete information, votes, and can stand surety. Everyone follows the same institutional rules and appears on a leaderboard.

The experience should reveal how the model operates through decisions and outcomes. It should make normal saving, useful borrowing, successful repayment, collective capital, rewards, and growth playable. Stress and manipulation are possible outcomes, not the premise of every scenario.

## Requirements established by the conversation

| ID | User requirement |
| --- | --- |
| U01 | Run in the browser as a playable game. |
| U02 | Demonstrate the whole supplied model, rather than primarily highlighting its weaknesses. |
| U03 | Start inside an existing circle with other members, existing allocated funds, monthly contributions, and separate personal saving. |
| U04 | Offer external projects requiring upfront investment, with different risks and passive returns. |
| U05 | Permit borrowing from the circle to finance projects; investment proceeds can be used to repay loans. |
| U06 | Present other members' borrowing proposals for assessment and collective decision. |
| U07 | Use credibility to affect uncertainty in risk estimates; borrowers may strategically obscure risk. |
| U08 | Let players rebalance circle contributions and their own savings. |
| U09 | Give participants the same game rules and a leaderboard. |
| U10 | Create a private repository containing the plan and implementation notes; wait for a subsequent build request. |

The shared-room format, season length, starting balances, ranking formula, and credibility algorithm are selected game assumptions. They have not been specified by the institutional blueprint.

## Starting position and player authority

The selected first scenario has six member seats, initially active, in one established circle. Six seats, 24 decision months, and seven run-off months are versioned demonstration settings, not model requirements. Bots fill a P1 practice room; P2 supports people in the same room.

The starting ledger includes member shares, optional circle savings, cash, existing loans, and retained capital. Every balance has a recorded opening counterpart or prior transaction; no unexplained reserve is added. A sponsor and higher unit can exist in the scenario before the player arrives. Their obligations and permissions must be consistent with the chosen scenario's history.

Each player manages three separate buckets:

| Bucket | Purpose and treatment |
| --- | --- |
| Personal cash / savings outside the circle | Available for expenses, projects, and voluntary repayments. Not an asset of the circle. |
| Membership share, including recurring contributions | Member-owned funds committed while membership continues; relevant to collateral and the borrowing ceiling. |
| Optional savings deposited in the circle | A claim on the circle, distinct from personal cash and the membership share; withdrawal follows the selected disclosed policy. |

Recurring contributions are saving, not a membership fee or a donation. The player can adjust them within the scenario's floor and lapse rules. A lapse costs active status, not membership. The ability to borrow must follow the source's ceiling and surety conditions, rather than automatically disappearing because the player no longer votes.

The player is one member. They do not approve their own loan unilaterally, direct other members' portfolios, or command a federation. Each active member counts once regardless of wealth. Unit decisions need the selected threshold and eligible voters.

## Monthly play loop

Monthly rounds are the requested game pacing. Admission, active status, check eligibility, reward vesting, and sustainability still turn on defined events rather than an invented number of months served.

1. **Open the round.** Resolve due outside income, expenses, scheduled project receipts, and existing obligations in the published order. Show the previous period's results and the member's available cash.
2. **Budget and discover.** Set contribution and saving instructions. Inspect private opportunities and cash needs. Earmark funds so the same money cannot be spent several times.
3. **Apply and disclose.** Choose self-funding, a loan application, or a combination. State the permitted purpose, requested amount, evidence, forecast, and proposed surety backing. Borrowers have better information about their own projects than others do.
4. **Assess and decide.** Review applications, request available evidence, decide whether to pledge, and vote. A request must satisfy source rules and have funding; a favourable score or vote is not a guarantee of disbursement.
5. **Execute.** Settle eligible withdrawals, approved loans, contributions, and investments under the rule set. Requests competing for insufficient cash use a published allocation rule, not network arrival speed.
6. **Close and inspect.** Close the books, allocate any actual surplus in the model's order, update justified reputation observations, and show what changed. Newly funded investments first produce receipts in a later round.

The selected timing and appropriation rules are fixed for a room and shown before players commit funds. Paid contributions affect that round's ceiling; active-status changes affect the next voter snapshot.

## Investment opportunities

Each fictional project defines an upfront cost, permitted purpose, duration, payout schedule, failure/underperformance process, recovery value, and exposure to shared conditions. Passive returns arrive through scheduled events, rather than a repeated clicking task.

Opportunities need more than a single risk/reward number. A higher total return may arrive too late for the proposed loan schedule. Some projects have steady receipts; others have delayed or variable receipts. Several projects can depend on the same external conditions.

Members undertake these outside projects personally. The circle itself only lends to admitted members and holds money within the network, as the blueprint requires. There is no automatic security over a member's outside project or bank balance.

A project failing does not instantly cancel its loan or prove its borrower dishonest. Members can voluntarily cover payments with other personal resources. Default, set-off, loss recognition, borrowing restrictions, and any release of an obligation are separate events.

## Credibility, evidence, and strategic ambiguity

Keep four concepts separate:

- **Underlying project risk:** the simulation's hidden state.
- **Private borrower information:** a more informative signal, not necessarily perfect foresight.
- **The applicant's presentation:** selected disclosures, forecasts, and omissions.
- **The assessor's estimate:** an interval derived from available evidence and credibility.

Example card language: "Estimated project-failure probability over its full life: 15–35%; evidence confidence: moderate." All numbers are illustrative. Probability horizons must be explicit.

Credibility should affect uncertainty and the weight assigned to claims. A credible person can present an openly risky project. An applicant with weak evidence may face a wide estimate even for a sound project. The interval is an inference, not a certified bound containing the hidden truth.

Borrowers can withhold optional information or make optimistic claims. These choices change what peers can infer and can affect later trust when evidence becomes available. Missing information must not automatically make a proposal look safer. Other members can refuse, seek more evidence, or require backing within the rules.

Use structured disclosure choices in the first version so their information effects are inspectable. Free-form persuasion and chat can follow later. Avoid a language-model service as a prerequisite for core game rules. Bots cannot inspect other borrowers' hidden information.

The game may display a credibility score, but it does not replace the blueprint's contribution- and repayment-based loan ceiling. Distinguish repayment reliability, supported disclosure history, and confidence in a small sample.

## What players can inspect

| View | Main questions it answers |
| --- | --- |
| My position | What can I spend now? What have I committed? What is due? How much can I request? |
| My opportunities | What does this cost, when might it pay, and how uncertain are the outcomes? |
| Circle applications | What is being requested, what evidence is visible, and what would my vote or pledge do? |
| Circle treasury | How much cash is available, where are assets deployed, what is owed, and how large is collective capital? |
| Members | Who is active, what repayment/disclosure history is visible, and what exposures am I taking? |
| Activity and explanation | Which transactions, votes, and outcomes changed balances and rights? |
| Standings | Where do I stand under the room's scoring rules, and how is the circle doing? |
| Network | Which units hold or lend money, who sponsors whom, and what checks or growth events are relevant? |

Use a whole-page game layout with a member circle, a clear personal position, and decision cards. Keep cash and reserves visually distinct. Expandable explanations show obligations before an action, and a transaction trail afterward. Information outside a member's circle follows the source's privacy principle.

## Scoring and season completion

Use final personal net wealth as the primary within-room ranking, with equal starting endowments and an explicit common rule set. Show contribution, repayment, return, surety losses, and circle health alongside it rather than hiding them inside an unexplained moral score.

The primary leaderboard is a game addition, not a mutual governance right. Rank gives no extra vote, lending entitlement, or right to collective reserves. Wealth-maximising play may produce aggressive risk-taking; the model determines its consequences.

Stop new commitments after round 24. Resolve remaining projects, debts, pledges, claims, and withdrawals through round 31 under the selected run-off policy. A write-off does not forgive the borrower's unpaid obligation in this game; it still reduces the score, without adding rights to seize outside assets. Do not rank borrowed cash as free wealth or assume illiquid circle claims can be withdrawn at face value.

Separate unverified local practice from server-verified multiplayer results. Cross-room comparisons need compatible rules, endowments, season lengths, and opportunity conditions. Start with a room leaderboard rather than a misleading universal ranking.

## Coverage of the wider model

The member-focused opening is an entry point to the complete designed backbone. Later stages must demonstrate member admission and vouching; referral accrual; founding advances and claims; sponsor charges after sustainability; units joining units; lending and spare savings across layers; sampled checks and audits; and member-directed use of discretionary surplus.

Expose these through events and choices in an existing world. For example, a member is asked to vouch for a newcomer, the circle seeks federation funding, or members vote to sponsor another circle. Starting the player as an experienced member must not silently delete the institutional mechanisms.

The optional social programme can supply community purposes and discretionary surplus choices. The blueprint's future bank, building society, healthcare provider, and insurer are ambitions with undesigned operating rules; they are not invented playable financial products in this plan.

## Delivery stages after authorization

| Stage | Deliverable | Completion criterion |
| --- | --- | --- |
| P0 — Review repository | This plan, source snapshot, mapping, decisions, and implementation notes | Documents are available privately; no application has been started. |
| P1 — Local member loop | Deterministic engine and a playable established-circle season against bots | Budgeting, private opportunities, applications, pledges, votes, repayments, losses, surplus, and honest standings all work. This is an intermediate prototype. |
| P2 — Shared circle | Authoritative rooms for human members, reconnect, phase deadlines, and verified results | Multiple people can play the same circle without hidden-state leaks, duplicate actions, or host-controlled outcomes. |
| P3 — Complete backbone | Referrals, admission, sponsor charges/advances, federation finance, checks/audits, and formation of another unit | Every required source mechanism in the mapping is implemented or explicitly resolved by the user; the ordinary game remains member-led. |
| P4 — Balance and presentation | Playtesting, scenario variety, explanation polish, and comparable challenge runs | The model is understandable in play, several strategies are usable, and parameters are identified as illustrative rather than empirical forecasts. |

Each implementation milestone should produce a playable increment when requested. P1 or P2 alone must not be described as a demonstration of every mechanism in the full source.
