# Implementation notes

These are design notes for a future build, not an application scaffold. Read the [plan](plan.md), [source mapping](model-map.md), and [decision register](review-decisions.md) together. Unresolved economic policies are not filled in by library defaults or interface shortcuts.

## 1. Separate institutional rules from the game economy

Use four boundaries:

1. **Institutional engine:** membership, active status, contributions, savings, encumbrances, ceilings, votes, loans, losses, surplus, rewards, and recursive units.
2. **Household/project economy:** personal income, expenses, outside opportunities, project ownership, stochastic payouts, recoveries, and private observations.
3. **Game coordination:** rounds, action windows, bot decisions, scenario history, room rules, run-off, and standings.
4. **Presentation and transport:** browser screens, permitted views, server requests, persistence, and replay explanations.

Project failure feeds the member's financial position; it must not directly debit the circle reserve. A separate loan event connects the member's repayment failure to the circle's waterfall. Similarly, credibility influences an assessor's beliefs but cannot bypass institutional approval or the contribution-based ceiling.

The later implementation should keep a deterministic domain engine callable both from a local practice harness and the authoritative multiplayer service. UI components must not contain a second set of economic rules.

## 2. Proposed domain objects

| Object | Essential state |
| --- | --- |
| Room / season | Rules version, scenario version, phase, round, deadlines, participant seats, authoritative state revision, seed commitment, completion status |
| Person / household | Private cash, authorised income/expense schedules, personal projects, private observations; distinct from circle membership |
| Unit | Treasury accounts, retained capital, current period accounts, members, governing policy, upstream memberships, sponsor, check status |
| Membership | Person-or-unit identity, share balance, optional savings, active status, contribution instruction, own repayment record, vouchers, eligibility history |
| Encumbrance | Underlying account/funds, amount, beneficiary, purpose, priority, release event; includes loan liens, voucher/surety pledges, and advance/checker claims |
| Loan application | Borrower, purpose, amount, term, requested schedule, submitted evidence/claims, required cover, proposed sureties, frozen decision version |
| Loan | Lender/borrower, principal, accrued/due interest, repayment schedule, actual payments, backing allocations, carried lender conditions, arrears/default/resolution status |
| Opportunity / project | Upfront outlay, ownership, permitted purpose, cash-flow schedule, latent risk/recovery process, shared-factor exposures, private signals, remaining life |
| Evidence / reputation observation | Who may see it, when it became available, provenance, which claim or repayment it bears on, uncertainty/sample size |
| Vote / resolution | Eligible-voter snapshot, exact proposal revision, votes, quorum result, adopted action, conditions, executed/rejected status |
| Reward / founding charge | Source membership/unit, attributed surplus, recipients, rate/cap, paid-to-date, qualifying event, lapse status, related advance claims |
| Check / audit | Unit, epoch, random sample, eligible checker draw, passage results, fee claim, audit result, qualification effects |
| Withdrawal / exit request | Amount, account, notice/due phase, encumbrance check, debt-coverage check, paid/queued amount, cancellation and departure status |
| Journal / game event | Stable ID, effective phase, command and actor, entries, state revision, random-draw references, source-rule/decision references, permitted explanation |

Keep a person's memberships separate from their identity. A unit's accounts are also separate from its members' accounts. These boundaries allow several memberships and recursive units without merging cash or counting assets twice.

## 3. Accounting and money movement

Use integer minor units and a declared rounding rule for money. Represent rates and periods explicitly; do not use floating-point balances. Preserve event IDs and balanced journal entries so retries do not create money.

At a fully closed period, reconcile the source identity:

`cash + net loan assets + holdings in other units = member shares + optional savings + money borrowed + reserve`

If a period is open, show current earnings, losses, and pending appropriation in explicit clearing accounts rather than manufacturing a second reserve. Resolve current-period surplus before publishing the closed-period identity. Cash and net capital must remain independently observable.

| Event | Required accounting effect |
| --- | --- |
| Member contributes or deposits | Personal cash falls; unit cash and the appropriate member claim rise by the same amount. This is not unit income. |
| Unit disburses a loan | Unit cash falls and its loan asset rises; borrower cash and debt rise. No participant has earned the principal as profit. |
| Member buys a project | Personal cash falls and personal project exposure is created. The circle holds a loan to that member, not the outside project. |
| Project pays | An external project counterparty funds personal cash. Record the external flow and project progress; do not invent a circle receipt until the member pays it. |
| Borrower repays principal | Borrower cash/debt and unit loan principal decline together; unit cash rises. Principal is available to lend again but is not income. |
| Borrower pays interest | Borrower cash falls; unit cash and recognised interest income rise. Only earned/recognised amounts enter the selected surplus process. |
| Saving interest/dividend is credited | Increase the named member claim and charge the appropriate earnings/distribution account. Crediting is not automatically a cash withdrawal. |
| Surplus is retained | Appropriate earnings to collective reserve. Do not add cash a second time; the assets backing the earnings already exist. |
| Withdrawal is paid | Unit cash and the member claim fall; personal cash rises. A queued request is still a claim, not a second claim or a completed payment. |
| A share is set off against a loan | Reduce the eligible claim and the associated obligation/loan asset. Set-off is not new cash for the treasury. |
| A pledge is made or released | Change the available/encumbered allocation, not total wealth. Loss occurs only when the pledge is actually called. |
| Unit borrows upstream | Receive cash and create debt in the borrowing unit; reduce cash and create a loan asset in its lender. Apply its lender's conditions. |

Unearned advances need matched cash transfers, sponsor receivables, and recipient obligations/encumbrances. Earned amounts release the appropriate claim under the selected source interpretation. They are not simultaneously an unrestricted gift and fully earned referral income.

Distinguish available cash from earmarked cash; unencumbered claims from encumbered claims; and posted contributions from merely promised future contributions. New lending and guarantees must validate all existing and simultaneously submitted commitments.

### Loss accounting

Preserve the source's order and resolve D04/D06/D07 before coding it. The ledger must recognise each economic loss once. Do not subtract the same loss from both net surplus and reserve as independent charges merely because both source formulas mention losses.

An illustrative closed-period check, not a recommended lending policy: start with assets of 120, member claims of 100, and reserve of 20. Assets include a 60 loan that becomes entirely unrecoverable and 60 of remaining cash/assets. Apply 10 of genuinely available borrower/surety claims, consume 20 of reserve, and write down 30 of other member claims. End with assets of 60, remaining member claims of 60, and no reserve. The collateral set-off never creates 10 of cash. Assume no other flows and that the selected ceilings allowed this exposure.

A person cannot have outside assets involuntarily seized merely because the engine can see them. Voluntary payments are allowed. A unit's wider asset reach and upstream creditor priority are separate source rules. A lender's accounting write-off and cancellation of the borrower's obligation must not be conflated; terminal scoring follows the selected resolution event.

## 4. Atomic monthly state transitions

Use named phases, an immutable rules version, and a state revision. Commands have an idempotency key, actor, phase, and expected revision. Reject actions that are late, duplicate, unauthorised, or based on a materially changed proposal.

Proposed ordering for review:

1. Open with the previous closed ledger. Resolve scheduled external income and project receipts, then required household expenses and existing loan dues using disclosed payment instructions.
2. Recognise arrears/default events due under the agreed policy. Produce the current public observations and new private opportunities. Snapshot active voting eligibility according to D03.
3. Collect contribution, saving, withdrawal, project, application, evidence, and surety instructions. Earmark cash and encumbered claims. Confirm contributions only when actually funded.
4. Freeze application terms and disclosure versions. Resolve evidence requests and record eligible votes/pledges. An amended amount, purpose, or term requires a new decision version.
5. Compute available funding after due withdrawals and existing obligations according to D05. Admit approved loans only if their ceiling, backing, cash, and lender terms still hold. Resolve competing approved requests by a predeclared allocation rule; do not silently make partial loans unless the application allowed them.
6. Atomically disburse loans and execute committed project purchases. Newly funded projects first produce returns next round. Close period income/loss/distribution accounts under D07 and publish only the permitted views.
7. Update future active status and qualifying-event transitions. Persist the closed ledger and replayable outcome before advancing the room.

Settlement is all-or-nothing at each defined transaction boundary. A crashed host, repeated request, or reconnect must not execute a payout twice. Re-evaluate cash and collateral at execution even if an earlier UI preview said an action was feasible.

This phase ordering is a proposed game policy, not a newly discovered rule in the blueprint. Resolve whether a particular month's contributions qualify for that month's loan ceiling and document it. Existing claims cannot be silently rewritten by changing a slider mid-round.

## 5. Risk, private information, and disclosure

### Project generation

Generate underlying projects and private/public signals separately. A project has actual future outcome logic; an application contains claims about it. The assessor's interval must be computed from observations they are entitled to use, not centred directly on a hidden true parameter.

Each failure probability names its horizon. If a simple constant monthly hazard represents a lifetime probability `p` over `T` months, use a consistent conversion such as `h = 1 - (1 - p)^(1/T)` in that simple model. Do not apply a lifetime probability independently every month. Shared shocks and varying hazards require their own explicit conditional model.

Provide project receipts, losses, and recoveries that correspond to actual project states. Promised passive income is a forecast, not guaranteed money or an unconditional right to refinance. Purpose restrictions still apply to every circle-funded project.

### Credibility and inference

Record repayment reliability separately from supported disclosure accuracy. Recent defaults can affect lending judgement without implying fraud. Honest forecasts can be wrong, particularly with few observations. A single unlucky result is not proof that a range was deliberately misleading.

Structured disclosure controls can expose or omit pieces of evidence and allow optimistic forecasts. They should change the inference problem without editing the hidden risk generator. Misleading claims can be challenged by later available evidence. Avoid an honesty oracle that tells other players whether someone is lying before any evidence exists.

The displayed interval should be labelled an estimate with a named probability horizon. Its coverage and usefulness must be evaluated across simulated observations. High credibility can narrow uncertainty given appropriate evidence; it does not guarantee a favourable centre. Missingness can itself be informative, so a bot must not mechanically treat every wide interval as safer.

The credibility score is a game addition. Source §6.1 still uses the borrower's own paid-in funds and repayment record for the formal ceiling. Do not make good disclosure a substitute for a share, sureties, a vote, or liquidity.

### Information permissions

Project truth, unreleased random draws, other households' private portfolios, private signals, and undisclosed evidence stay outside ordinary client payloads. Hidden HTML, disabled controls, obfuscated JavaScript, and browser storage are not access controls.

Expose separate projections for the member's own position, peers' permitted observations, the circle treasury, and upstream aggregates. Other units need eligible summaries rather than member identities. The ordinary leaderboard should not inadvertently reveal private project parameters; propose within-room standings with appropriately limited intermediate detail and full permitted settlement results.

Practice mode may offer an explicit post-game reveal. Multiplayer reveal must respect the room's stated visibility policy. A public replay must not be a download of every participant's private state.

## 6. Bots, randomness, and multiplayer authority

Bots use the same permitted view and command validation as human players. Different policies can prefer liquidity, growth, diversification, or caution, but no bot gets privileged knowledge of another member's project or future random draws. Bots do not guarantee enough lending, funding, or honest votes to rescue the player.

Store one authoritative game state and journal per room, with transactional updates and phase deadlines. The room host can coordinate the session but cannot inspect hidden state or award themselves cash. Reconnect returns the correct role projection, not a full server snapshot.

Use stable keyed random draws by room, opportunity, actor, round, and event kind. Separate opportunity, project-outcome, shared-shock, and bot-behaviour streams so taking an unrelated action does not accidentally reroll another project's outcome. Make scenario/rule changes explicit in comparisons.

For ranked rooms, keep the seed and unreleased outcome state on the server. A seed commitment at start and permitted reveal after completion can support reproducibility without exposing future results during play. The server computes outcomes and scores; it never accepts client-submitted net wealth as authoritative.

At a deadline, apply only the published timeout policy: for example abstain from new proposals while continuing previously authorised payment instructions where funded. Timeouts must not forge new pledges, disclosures, guarantees, or loans on a player's behalf. Each participant should be able to inspect why an automatic action happened.

## 7. Leaderboard and terminal settlement

Proposed personal net wealth at a resolved endpoint:

`personal cash + realised project residuals + recoverable member claims - outstanding personal obligations`

Account for amounts already settled so they are not counted again. A called guarantee reduces the relevant claim once. Collective reserve is never added to a member's wealth. An unearned advance remains an obligation until the model's earning/recovery event resolves it.

Borrowing transfers cash and creates debt, so it does not create net wealth. Entering a project converts cash into project exposure, so it does not create immediate profit either. Provisional standings must distinguish estimated project/claim values from final realised results.

Plan a funding cutoff and a finite run-off. Continue existing repayments, project outcomes, defaults, claims, and applicable charges until a known terminal resolution policy applies. If the circle cannot pay a withdrawal, do not convert that claim into personal cash for ranking. If claims remain at the endpoint, show their specified recoverable valuation and keep results provisional where required. Winding up must follow the source's reserve destination rather than distribute common capital to the richest players.

Compare participants within the same room first. For later cross-room boards, separate rules/scenario versions, starting resources, duration, and verified/practice status. Reputation and rank must never change voting weight. Show circle outcomes alongside the personal ranking rather than secretly altering the score to make cooperation win.

## 8. Wider-model implementation

Start with generic member/unit and account primitives even while the first screen contains one circle. Adding the federation should create actual upstream deposit claims and loan assets/liabilities, not a liquidity button that mints money.

P3 must include the source sequence for admission, vouching, qualifying checks, eligibility for above-cover credit and upstream voting, sustainability, bounded sponsor charges, reward accrual, advances, and further sponsorship. An initial established circle can already have some of these events in its recorded scenario history; later events remain inspectable and playable.

Model the three organiser payment types separately. Pay ongoing work only from the source-permitted discretionary surplus. Never count a founding charge as senior debt or make referrals payable from arbitrary treasury principal.

Identity checks/audits are simulated events with the source's random sampling and exclusions. They do not certify credit risk. A player's credibility score must not replace a unit's check status. Fees, fee claims, and failed audits have real accounting consequences. Extra checker bonds, blanket deposit insurance, automatic bailouts, or reward clawbacks are variants only if explicitly selected.

Multi-parent holdings, sureties, and inter-unit loans need aggregate exposure tracking. A stress outcome is evidence about a configured game, not proof of universal failure or safety of the source model.

## 9. Proposed technical structure and sequence

Recommend a TypeScript domain engine, a browser UI, a server coordinator, and durable transactional storage. A component-based UI can support member cards, applications, timelines, and network views. Choose framework, exact package versions, hosting, and authentication when the build is authorized; no dependency installation is part of this repository phase.

Conceptual modules for the later build:

| Module | Responsibility |
| --- | --- |
| Domain | Pure commands/events, ledger, memberships, loans, collateral, governance, rewards, units |
| Economy | Opportunities, household flows, project outcomes, observations, inference |
| Rules/scenarios | Versioned parameters, initial histories, decision-policy selections, source mapping |
| Coordinator | Room/phase lifecycle, transactions, idempotency, deadlines, authorisation, persistence |
| Views | Role-filtered projections, explanations, provisional/final standings |
| Bots | Policies operating only on the ordinary command/view boundary |
| Browser | Responsive whole-page game, choices, voting, detail inspection, reconnection |
| Validation | Invariant tests, worked examples, integration/replay checks, browser flows |

Prototype the engine and a complete local member season before adding shared rooms. Local hidden information is inspectable by the local user, so local practice cannot establish competitive multiplayer integrity. P2 requires server authority and durable state, not just a shared client-side leaderboard.

If a hosting service is selected later, preserve private access by default and follow the user's build/publication instructions. This task creates no site or running service.

## 10. Explainability and implementation handoff

Every action preview should identify required funds, backing, approvals, immediate changes, and continuing obligations. Every settled event should explain the corresponding money movement and any eligibility change in plain language.

Store the applicable B/U requirement and decision IDs with rule implementations and meaningful tests. Keep the source snapshot unchanged; update the mapping, selected rule set, and decision history if a reviewed variant changes behaviour. The next implementation session should start from this repository rather than reconstructing requirements from the earlier risk discussion.
