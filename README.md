# Circle Game

A browser strategy game about being a member of a mutual savings and lending circle. Start with other members, money already committed to the circle, a monthly contribution, and personal savings. Invest in outside opportunities, request loans, assess other members' proposals through incomplete information, and compare results on a leaderboard.

The game demonstrates the Neo-Mutual Organisation model through ordinary participation. Benefits, tradeoffs, and failures emerge from the same rules; a campaign built around exposing problems is not the product brief.

**Status: planning complete with selected defaults; implementation has not started.** The user delegated the open choices after analysis. The private repository now records the plan, those choices, their reasoning, and worked accounting examples. The user will request the build after review.

Read in this order:

1. [Game plan](docs/plan.md): the agreed experience, monthly loop, screens, and delivery stages.
2. [Blueprint mapping](docs/model-map.md): requirements traced to the supplied model, with game additions and source gaps distinguished.
3. [Selected decisions](docs/review-decisions.md): defaults chosen under the user's delegation and their source boundaries.
4. [V0 scenario and analysis](docs/scenario-v0.md): starting balances, lending, voting, liquidity, risk information, settlement, and worked examples.
5. [Implementation notes](docs/implementation-notes.md): accounting, hidden information, settlement, multiplayer, and proposed architecture.
6. [Validation plan](docs/validation-plan.md): the checks a later implementation must satisfy.

The [original blueprint](docs/blueprints/neo-mutual-organisation.md) is preserved byte for byte. [Source provenance](docs/blueprints/README.md) records its checksum and the limits of the supplied material.

## The intended experience

You manage your own position, not everybody else's treasury. Keep cash available, contribute to the circle, build borrowing capacity, and choose investments with different payouts and risks. Other members make the same decisions. Their applications provide uncertain information; credibility and disclosure influence what you can reasonably infer. Vote on applications and decide whether to put your share at risk as a surety.

Loans remain obligations when projects disappoint. Successful lending can pay savers, build collective reserves, fund the model's bounded rewards, and support further activity. Your own money, the circle's collective capital, and your voting power are separate quantities.

The complete planned demonstration includes federations, checks, referrals, sponsorship, and growth. The opening scene is always an established circle; founding is a later activity rather than mandatory onboarding.

## Review and handoff

The latest user direction controls the product experience. The supplied blueprint controls the institutional rules unless the user explicitly requests a change. The selected gameplay defaults fill its gaps; they are not decisions made by the blueprint's author. Numeric balance and inference quality still need playtesting during the authorised build.

No application, dependency manifest, deployment, wallet connection, or real-money integration is included in this planning repository. A later explicit build request is the handoff to implementation.
