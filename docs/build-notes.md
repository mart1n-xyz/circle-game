# P1 browser game — implementation record

The user’s subsequent instruction, “ok build this out as in browser board game,” authorized implementation after the planning phase. This release implements the P1 member season defined in the delivery plan. It was first delivered to a private repository and owner-private Site. The later instruction, “Make tre repo public and deploy on GitHub pages,” authorizes the public repository and Pages release.

## Playable behavior

- Start in the established six-member Alder Circle, with the exact opening cash, claims, reserve, loans, projects, income and expense fixture from `scenario-v0.md`. Month-one receipts and dues resolve before the first decision, so the initial personal cash displayed is **1,814**, with **400** principal remaining.
- Play Budget → Opportunity → Backing → Vote → Results for 24 months. Continue manually through the seven settlement months or finish them together, using the standing contribution instruction.
- Budget personal cash between membership share and optional circle savings. Lowering the funded contribution below 50 changes active status at close; a later funded 50 plus a passage attested by two active members restores future voting.
- Receive two different project-family opportunities each month. Choose one, co-fund with outside cash, request a purpose-bound loan, or pass. The project drawer compares receipts and loan payments in the same months.
- Attach a noisy inspection, make an unverified band claim, or withhold evidence. Public estimates depend only on disclosed information and the selected credibility model. A project’s outcome alone never changes the honesty count.
- Back peer applications with an available part of your share; committed funds are exclusive. Borrowers and sureties are recused. Vote yes/no/abstain under the frozen electorate and threshold. Whole approved requests compete for cash in a stable seeded draw after due withdrawals and the lending buffer.
- Existing projects pay, fail, recover, finish, and may trigger a disclosure audit. Loans receive automatic or extra payments. Arrears, default, own-fund setoff, guarantee calls, residual write-offs, the loss waterfall, and later restoration of actual claim/reserve losses are implemented.
- Credit saver interest and distribute the positive net surplus after the selected collective retention. Treasury cash, performing loan assets, member claims, collective reserve, and open earnings remain separate.
- Request optional-savings withdrawals, with one month’s notice and proportional payment when cash is short. Exit sets off obligations and queues eligible free claims, while guarantees stay attached and reserve stays collective.
- Inspect member profiles, the personal project/loan portfolio, public circle events, your own private events, and season standings. Browser-local autosave, new table seeds, keyboard dialogs, and a JSON inspection export are available.

## Code and state boundaries

| Path                             | Role                                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `app/src/types.ts`               | Versioned state, obligations, claims, applications, events, and permitted policy observations                                      |
| `app/src/economy.ts`             | Project families, keyed random streams, inspection likelihoods, public risk inference, payment previews, and bot decision policies |
| `app/src/engine.ts`              | Clone-and-validate command transitions, collateral and capacity checks, financial settlement, journal snapshots, and invariants    |
| `app/src/App.tsx`                | React table, phase controls, cards, account management, portfolio, standings, and rulebook                                         |
| `app/src/Art.tsx`                | Original project-card vector illustrations                                                                                         |
| `app/src/styles.css`             | Tabletop presentation, responsive layouts, focus states, and reduced-motion handling                                               |
| `app/tests/engine.test.ts`       | Accounting, policy, information-boundary, risk-horizon, and full-season checks                                                     |
| `app/tests/browser/game.spec.ts` | Real desktop/mobile browser journeys, reload persistence, and complete seasons                                                     |

Amounts are integer minor units. Each accepted command runs on a cloned state and must reconcile `cash + performing loans = claims + reserve + open earnings`; rejected commands cannot leave partial mutations. Journal events include rule/decision references and balanced snapshots. Loan principal rounding goes into the final scheduled instalment. This avoids extending a position past the intended season because of leftover cents.

Random draws are keyed by seed, member, round, project, sector, and event. Bot project choices receive only a `BotView`; backing/vote policies receive public application observations, their own financial limits, and public default history. Policies do not receive the full `Game` or latent project types. The current policies choose contributions, investments, disclosures, backing, votes, and ordinary automatic repayments. Other legal actions—withdrawal, exit, reactivation, and extra repayment—are available to a human but are not actively explored by these first bot policies. They receive no rescue funds or special credit exceptions.

The full local state is saved under `circle-table-v1` in localStorage. This is deliberately a practice implementation: browser inspection can reveal hidden state, future keyed draws can be computed, and local scores can be edited. The UI exposes no project’s latent risk and labels the mode as unverified local practice. A JSON export is an inspection record, not a secure multiplayer replay or an import/backup feature. Clearing browser data removes the current save.

## Validation performed

The focused engine suite has **15 tests**, including **20 full deterministic 31-month simulations** across balanced, bold, and careful policies. It covers:

- Exact opening identity and the isolated all-100-contribution first-close fixture: **8,136 cash + 2,400 loans = 9,629.25 claims + 906.75 reserve**. Bot budget changes and new applications are excluded from this reference fixture; their actual discretionary policies can change the live first close.
- The first-round **2,000 capacity / 1,200 own cover / 200 surety** example.
- Proportional withdrawals: **1,200 due against 300 cash**, paying 25% to each request and leaving 900 queued.
- Atomic rejection of invalid commands, frozen terms, borrower/backer recusal, active-status lapse/reactivation, and exit without a reserve payout.
- Integer allocation conservation, the seasonal **412 / 408 / 404** loan schedule and **420 cash bridge**, and final-instalment rounding.
- A stressed default that reaches guarantees, reserve and member shares, followed by repayment restoring the actual recorded haircut.
- Private observation objects without latent types, normalized posterior weights, outcome-independent credibility, and empirical lifetime failure frequencies consistent with the monthly hazard conversion.
- Deterministic replay, balanced closed states **and every recorded event snapshot**, no unresolved running projects or performing loans at month 31.

Playwright checks Chromium at desktop and iPhone-sized viewports. The journeys cover project financing, circle voting and settlement, portfolio/ledger/standings views, account withdrawals, a reload with the current season intact, keyboard dismissal of dialogs, a new seed, and a complete 24-decision-month season plus runoff using visible controls. TypeScript strict checking and the Vite production build are separate release checks.

These checks establish implementation behavior, not economic calibration. Strategic disclosure’s posterior coverage, policy balance, and how often cash shortages arise still need human playtesting. The credibility-weighted posterior is the selected inference assumption; the displayed interval is not a certified bound on the true risk.

## Model coverage and later work

| Stage                             | State                                                                                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1: single-circle member season   | Implemented, with the controls and accounting above                                                                                                                                                                       |
| P2: human rooms and authority     | Deferred: server-held hidden state and seeds, seat access, transactional persistence, idempotent command IDs/revisions, deadlines, reconnect, verified standings and permitted replays                                    |
| P3: recursive model demonstration | Deferred: real upstream memberships/borrowing/holdings, cross-unit creditor propagation, referrals and bounded rewards, advances and clawback claims, founding/sponsorship, negotiable checks, random checkers and audits |
| P4: balance and polish            | Initial responsive presentation is implemented; broader accessibility review, calibrated policies/inference, additional scenarios, and sustained human playtesting remain                                                 |

The founding/referral reward caps are treated as settled opening history, as selected in the scenario; no active reward stream is invented in P1. Passage renewal uses the selected simulated attestation and is not a substitute for P3’s full check machinery. The unit network, identity-check audits, and credibility audits remain distinct concepts.

The original uploaded blueprint is unchanged. SHA-256: `cc441e18ead23d05ddac5ec872cb316f1967504f0334ce522f588198a902bba7`.

## Delivery

The root package builds the application to `dist/`. The public game is published at <https://mart1n-xyz.github.io/circle-game/> by `.github/workflows/pages.yml`. Pushes to `main` and manual dispatches run the engine tests, build with the Pages base path, upload only `dist/`, and deploy through the `github-pages` environment. GitHub Actions are pinned to verified commit SHAs, with read permissions for the build and Pages/OIDC write permissions for the deployment job.

The base-path configuration follows the [Vite deployment guide](https://vite.dev/guide/static-deploy#github-pages); publication uses [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). The production build must be checked at `/circle-game/`, including its font and JavaScript requests. Source documentation and the uploaded blueprint are available in the now-public repository; the Pages artifact contains only the built application and its static assets.

`.openai/hosting.json` retains the identity of the separate owner-private Sites deployment. No runtime environment secrets or external finance service are required. Browser-local saves do not transfer automatically between the two hosting origins.
