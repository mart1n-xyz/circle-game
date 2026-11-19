# Working in this repository

The user explicitly requested implementation: “ok build this out as in browser board game.” The documentation-only gate is satisfied. P1 is now a playable local practice season in the browser, with private Sites hosting. Continue ordinary implementation and fixes within that authorization; do not ask for the same permission again.

Before implementing, read README.md, docs/plan.md, docs/model-map.md, docs/implementation-notes.md, docs/review-decisions.md, and docs/scenario-v0.md. Consult the source sections in docs/blueprints/neo-mutual-organisation.md for the mechanics being changed.

- Preserve the uploaded blueprint unchanged. Its provenance and checksum are in docs/blueprints/README.md.
- Keep institutional requirements, user-requested game mechanics, source proposals, and implementation assumptions distinct. Record approved changes in the mapping and decision register.
- Start the player as a member of an established circle with existing funds and monthly contributions. Preserve the personal investment, peer assessment, and leaderboard experience.
- Do not turn the game into a stress-test tutorial, a founding-only campaign, an omnipotent treasury simulator, or a token-weighted voting system.
- Demonstrate the complete designed savings-and-loans backbone in the planned stages. Track deferred features explicitly rather than silently dropping them.
- The user delegated open choices after analysis. Use the selected defaults and worked examples when authorized to build; do not reopen routine decisions as permission requests. Surface genuine contradictions rather than inventing authoritative model rules.
- Treat credibility as a game information mechanism; it does not replace the blueprint's contribution/repayment-based ceiling or member approval.
- Separate member money, unit cash, outstanding loans, and collective reserves. Never create money through interest labels, duplicate collateral, or double-counted losses.
- Keep hidden project information and ranked multiplayer state on the authoritative server. Bots receive the same permitted observations and action rules as people.
- P1 stores its complete simulation in the browser and is explicitly unverified practice. It is not a secure multiplayer server. Do not advertise online rooms or protected hidden state until P2 actually supplies them.
- Keep this repository and the existing Site private. Reuse the project ID in `.openai/hosting.json`; never create a duplicate Site for this game.
- Run checks appropriate to the actual change. The planned implementation checks are in docs/validation-plan.md; documentation work does not require an application scaffold.
