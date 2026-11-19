# Circle Game

A browser strategy game about being a member of a mutual savings and lending circle. Start with other members, money already committed to the circle, a monthly contribution, and personal savings. Invest in outside opportunities, request loans, assess other members' proposals through incomplete information, and compare results on a leaderboard.

The game demonstrates the Neo-Mutual Organisation model through ordinary participation. Benefits, tradeoffs, and failures emerge from the same rules; a campaign built around exposing problems is not the product brief.

**Status: P1 playable browser board game.** A single player and five bots can complete a 24-month investment season followed by seven settlement months. The supplied blueprint is unchanged; the game uses the selected defaults and tracks later model stages explicitly.

[Play the private game](https://circle-table-mart1n.mart1n-xyz.chatgpt.site) · [What is implemented and checked](docs/build-notes.md)

The table includes monthly budgeting, outside investments, personal co-funding and circle loans, disclosure choices, sureties, recused member votes, automatic and extra repayments, arrears/defaults, losses and recoveries, saver interest and dividends, withdrawals and exit, a portfolio, a ledger, and standings. Progress saves automatically in the current browser.

This is local practice. The five other seats are bots following the same institutional rules with distinct policies and permitted observations. There are no online rooms or verified rankings yet. Browser storage contains the simulation state; it is not a security boundary for hidden information. P2 adds multiplayer authority, and P3 adds the recursive network and growth/check machinery.

## Run locally

Use Node.js 24 and npm. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. The application has no API key, external model service, wallet, or real-money dependency. Fonts and illustrations are served locally.

```sh
npm test                 # Engine/accounting checks and 20 complete simulated seasons
npm run build           # Strict TypeScript check and production assets in dist/
npx playwright install --with-deps chromium
npm run test:browser     # Desktop + mobile controls, persistence, and complete seasons
```

The browser suite uses `playwright.config.ts` and starts Vite when needed. On Linux, Chromium needs its system libraries; the installation command may require administrator rights. Production hosting is configured in `.openai/hosting.json` and remains private.

## Original design documents

Read in this order:

1. [Game plan](docs/plan.md): the agreed experience, monthly loop, screens, and delivery stages.
2. [Blueprint mapping](docs/model-map.md): requirements traced to the supplied model, with game additions and source gaps distinguished.
3. [Selected decisions](docs/review-decisions.md): defaults chosen under the user's delegation and their source boundaries.
4. [V0 scenario and analysis](docs/scenario-v0.md): starting balances, lending, voting, liquidity, risk information, settlement, and worked examples.
5. [Implementation notes](docs/implementation-notes.md): accounting, hidden information, settlement, multiplayer, and proposed architecture.
6. [Validation plan](docs/validation-plan.md): the acceptance checks across all planned stages.

The [original blueprint](docs/blueprints/neo-mutual-organisation.md) is preserved byte for byte. [Source provenance](docs/blueprints/README.md) records its checksum and the limits of the supplied material.

## The intended experience

You manage your own position, not everybody else's treasury. Keep cash available, contribute to the circle, build borrowing capacity, and choose investments with different payouts and risks. Other members make the same decisions. Their applications provide uncertain information; credibility and disclosure influence what you can reasonably infer. Vote on applications and decide whether to put your share at risk as a surety.

Loans remain obligations when projects disappoint. Successful lending can pay savers, build collective reserves, fund the model's bounded rewards, and support further activity. Your own money, the circle's collective capital, and your voting power are separate quantities.

The complete planned demonstration includes federations, checks, referrals, sponsorship, and growth. The opening scene is always an established circle; founding is a later activity rather than mandatory onboarding.

## Design boundaries

The latest user direction controls the product experience. The supplied blueprint controls the institutional rules unless the user explicitly requests a change. The selected gameplay defaults fill its gaps; they are not decisions made by the blueprint's author. Numeric balance and inference quality still need playtesting during the authorised build.

The subsequent explicit build request authorized this implementation. [Build notes](docs/build-notes.md) distinguish completed P1 behavior, current validation, and deferred P2/P3 requirements. Playtesting should tune visible, versioned scenario parameters rather than silently changing the institutional model.
