import test from "node:test";
import assert from "node:assert/strict";
import {
  act,
  apportion,
  applications,
  assertGame,
  balance,
  botView,
  canBorrow,
  capacity,
  createGame,
  debt,
  freeFunds,
  initialGame,
  member,
  PLAYER,
  requiredVotes,
} from "../src/engine.ts";
import {
  botChoice,
  credits,
  credibility,
  estimate,
  generateOffers,
  ownOffer,
  random,
  repaymentSchedule,
  RISKS,
} from "../src/economy.ts";
import type { Game } from "../src/types.ts";

function pass(g: Game): Game {
  if (g.phase === "budget")
    g = act(g, {
      type: "budget",
      contribution: Math.min(
        member(g).cash,
        g.round > 24 ? member(g).contribution : credits(100),
      ),
      deposit: 0,
    });
  if (g.phase === "opportunity") g = act(g, { type: "backing" });
  if (g.phase === "backing") g = act(g, { type: "freeze" });
  if (g.phase === "vote") {
    for (const app of applications(g).filter((a) =>
      a.eligible.includes(PLAYER),
    ))
      g = act(g, { type: "vote", application: app.id, vote: "yes" });
    g = act(g, { type: "settle" });
  }
  return g;
}
function invest(g: Game, style = "balanced"): Game {
  g = act(g, {
    type: "budget",
    contribution: Math.min(member(g).cash, credits(100)),
    deposit: 0,
  });
  if (g.phase === "opportunity") {
    const view = botView(g, PLAYER);
    view.style = style as typeof view.style;
    const choice = botChoice(view, random(g.seed, "player-choice-" + g.round));
    if (choice) g = act(g, { type: "select", ...choice });
  }
  return pass(g);
}

test("opening assets reconcile, and month one pays the existing project and loan", () => {
  const opening = initialGame();
  assert.deepEqual(balance(opening), {
    cash: 630000,
    loans: 360000,
    claims: 900000,
    reserve: 90000,
    earnings: 0,
  });
  const g = createGame();
  assert.equal(member(g).cash, 181400);
  assert.equal(debt(g, PLAYER), 40000);
  assert.equal(g.cash, 753600);
  assert.equal(g.earnings, 3600);
  assertGame(g);
});

test("specified all-100, no-new-loan first close matches the planning fixture exactly", () => {
  let g = createGame();
  // Isolate the reference accounting fixture from discretionary bot policy.
  g.members.forEach((m) => (m.style = "balanced"));
  g = act(g, { type: "budget", contribution: 10000, deposit: 0 });
  g.offers = Object.fromEntries(g.members.map((m) => [m.id, []]));
  g = pass(g);
  assert.deepEqual(balance(g), {
    cash: 813600,
    loans: 240000,
    claims: 962925,
    reserve: 90675,
    earnings: 0,
  });
  assert.equal(g.history[0].saverInterest, 900);
  assert.equal(g.history[0].dividend, 2025);
});

test("rejected commands are atomic; phase, negative amounts and own-vote checks apply", () => {
  const g = createGame(),
    before = JSON.stringify(g);
  assert.throws(
    () => act(g, { type: "budget", contribution: -1, deposit: 0 }),
    /non-negative/,
  );
  assert.throws(() => act(g, { type: "settle" }), /another part/);
  assert.throws(
    () => act(g, { type: "budget", contribution: 999999, deposit: 0 }),
    /available cash/,
  );
  assert.equal(JSON.stringify(g), before);
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6].map(requiredVotes),
    [2, 2, 2, 2, 3, 3, 4],
  );
});

test("withdrawals reserve claims immediately and pay after one month, before lending", () => {
  let g = createGame();
  g = act(g, { type: "withdraw", amount: 10000 });
  assert.equal(freeFunds(g, PLAYER).savings, 40000);
  assert.equal(g.withdrawals[0].due, 2);
  g = pass(g);
  assert.equal(g.withdrawals[0].amount, 10000);
  g = act(g, { type: "next" });
  g = pass(g);
  assert.equal(g.withdrawals.filter((w) => w.member === PLAYER).length, 0);
  assert.ok(
    g.events.some(
      (e) =>
        e.title === "Withdrawal paid" && e.member === PLAYER && e.round === 2,
    ),
  );
});

test("inactive status requires a new attested passage, not only a later deposit", () => {
  let g = createGame();
  g = act(g, { type: "budget", contribution: 0, deposit: 0 });
  g = pass(g);
  assert.equal(member(g).active, false);
  g = act(g, { type: "next" });
  g = act(g, { type: "budget", contribution: 5000, deposit: 0 });
  assert.equal(g.voters.includes(PLAYER), false);
  g = act(g, { type: "reactivate" });
  g = pass(g);
  assert.equal(member(g).active, true);
  g = act(g, { type: "next" });
  assert.equal(g.voters.includes(PLAYER), true);
});

test("departure nets own debt without taking the collective reserve", () => {
  let g = createGame();
  const reserve = g.reserve;
  g = act(g, { type: "exit" });
  assert.equal(member(g).leaving, true);
  assert.equal(debt(g, PLAYER), 0);
  assert.equal(g.reserve, reserve);
  assert.equal(member(g).share, 60000);
  assert.equal(
    g.withdrawals
      .filter((w) => w.member === PLAYER)
      .reduce((s, w) => s + w.amount, 0),
    110000,
  );
  assertGame(g);
});

test("risk observations exclude latent types; bad luck alone does not change credibility", () => {
  const g = createGame(),
    view = botView(g, "mara");
  assert.equal("riskBand" in view.offers[0], false);
  assert.equal("members" in view, false);
  for (const family of ["equipment", "seasonal", "venture"] as const)
    for (let band = 0; band < 4; band++)
      for (const d of ["verified", "claim", "withheld"] as const) {
        const e = estimate(family, d, band, 0.5);
        assert.ok(Math.abs(e.weights.reduce((s, x) => s + x, 0) - 1) < 1e-12);
        assert.ok(e.low <= e.mean || e.weights.some((x) => x > 0.8));
        assert.ok(e.high >= e.low);
      }
  const owner = member(g);
  assert.equal(credibility(owner), 0.5);
  owner.cleanLoans = 20;
  owner.everDefaulted = true;
  assert.equal(credibility(owner), 0.5);
  owner.auditedClaims = 1;
  assert.equal(credibility(owner), 0.4);
  owner.matches = 1;
  assert.equal(credibility(owner), 0.6);
  assert.deepEqual(
    generateOffers("same", "you", 7),
    generateOffers("same", "you", 7),
  );
  assert.equal(
    "riskBand" in ownOffer(generateOffers("same", "you", 7)[0]),
    false,
  );
});

test("rounding allocations conserve every minor unit", () => {
  for (let n = 0; n < 101; n++) {
    const split = apportion(n, [3, 1, 7, 2, 0]);
    assert.equal(
      split.reduce((s, v) => s + v, 0),
      n,
    );
    assert.equal(split[4], 0);
    assert.ok(split.every((v) => Number.isInteger(v) && v >= 0));
  }
});

test("first-round borrowing capacity follows the selected 2,000 / 1,200 / 200 fixture", () => {
  let g = createGame();
  g = act(g, { type: "budget", contribution: 10000, deposit: 0 });
  assert.equal(capacity(g, PLAYER), 200000);
  const funds = freeFunds(g, PLAYER);
  assert.equal(funds.share + funds.savings, 120000);
  assert.equal(
    Math.ceil((capacity(g, PLAYER) - funds.share - funds.savings) * 0.25),
    20000,
  );
});

test("1,200 of due withdrawals against 300 cash pay exactly 25% each", () => {
  const g = createGame();
  // Isolated liquidity fixture: existing loan assets absorb the cash reduction.
  g.loans[0].principal += g.cash - 30000;
  g.cash = 30000;
  g.phase = "vote";
  g.withdrawals = g.members.map((m) => ({
    id: "request-" + m.id,
    member: m.id,
    account: "savings",
    amount: 20000,
    due: 1,
  }));
  const before = g.members.map((m) => m.cash);
  const settled = act(g, { type: "settle" });
  assert.equal(settled.cash, 0);
  assert.equal(
    settled.withdrawals.reduce((s, w) => s + w.amount, 0),
    90000,
  );
  settled.members.forEach((m, i) => assert.equal(m.cash - before[i], 5000));
  assertGame(settled);
});

test("loan previews show the seasonal cash bridge and settle the final rounding cent", () => {
  const schedule = repaymentSchedule(120000, 3);
  assert.deepEqual(
    schedule.map((p) => p.total),
    [41200, 40800, 40400],
  );
  assert.equal(schedule[0].total + schedule[1].total - 40000, 42000);
  const odd = repaymentSchedule(120001, 6);
  assert.equal(
    odd.reduce((s, p) => s + p.principal, 0),
    120001,
  );
  assert.equal(odd.at(-1)!.principal, 20001);
});

test("monthly hazards reproduce lifetime failure probability rather than multiplying it", () => {
  for (const p of RISKS) {
    const term = 6,
      hazard = 1 - Math.pow(1 - p, 1 / term);
    let failures = 0;
    for (let trial = 0; trial < 10000; trial++) {
      for (let age = 1; age <= term; age++)
        if (random("hazard-" + p, trial + ":" + age) < hazard) {
          failures++;
          break;
        }
    }
    assert.ok(
      Math.abs(failures / 10000 - p) < 0.018,
      `lifetime ${p}: observed ${failures / 10000}`,
    );
  }
});

test("funded applications freeze terms, recuse borrowers and backers, and consume cash once", () => {
  let g = createGame("terms");
  g = act(g, { type: "budget", contribution: 10000, deposit: 0 });
  const o = g.offers[PLAYER][0];
  g = act(g, {
    type: "select",
    offer: o.id,
    amount: Math.min(o.cost, capacity(g, PLAYER)),
    disclosure: "verified",
  });
  g = act(g, { type: "backing" });
  g = act(g, { type: "freeze" });
  const app = g.applications.find((a) => a.borrower === PLAYER)!;
  assert.ok(!app.eligible.includes(PLAYER));
  for (const pledge of app.pledges)
    assert.ok(!app.eligible.includes(pledge.member));
  assert.throws(
    () => act(g, { type: "vote", application: app.id, vote: "yes" }),
    /cannot vote/,
  );
  assert.throws(
    () => act(g, { type: "pledge", application: app.id, amount: 0 }),
    /another part/,
  );
  g = pass(g);
  assertGame(g);
});

test("arrears lead to setoff, guarantee calls, reserve/share losses, and recovery restores actual cuts", () => {
  let g = createGame("default-case");
  // A smaller initial reserve is an isolated stress fixture, not the player scenario.
  g.reserve -= 85000;
  g.cash -= 85000;
  g = act(g, { type: "budget", contribution: 0, deposit: 0 });
  let offer = g.offers[PLAYER].find((o) => o.family === "venture");
  if (!offer) {
    offer = generateOffers("find-venture", "you", 1).find(
      (o) => o.family === "venture",
    );
  }
  if (!offer) {
    for (let i = 0; !offer; i++)
      offer = generateOffers("venture-" + i, "you", 1).find(
        (o) => o.family === "venture",
      );
  }
  g.offers[PLAYER] = [offer!];
  g = act(g, {
    type: "select",
    offer: offer!.id,
    amount: capacity(g, PLAYER),
    disclosure: "verified",
  });
  g = act(g, { type: "backing" });
  const own = g.applications.find((a) => a.borrower === PLAYER)!;
  const needed = Math.ceil(
    Math.max(0, own.amount - own.ownShare - own.ownSavings) * 0.25,
  );
  own.pledges = [{ member: "mara", amount: needed, original: needed }];
  g = act(g, { type: "freeze" });
  for (const a of g.applications)
    for (const id of a.eligible)
      a.votes[id] = a.borrower === PLAYER ? "yes" : "no";
  g = act(g, { type: "settle" });
  assert.equal(
    g.applications.find((a) => a.borrower === PLAYER)!.status,
    "funded",
  );
  g = act(g, { type: "autopay", enabled: false });
  g = act(g, { type: "next" });
  g = pass(g);
  assert.equal(canBorrow(g, PLAYER), false);
  g = act(g, { type: "next" });
  g = pass(g);
  assert.equal(member(g).everDefaulted, true);
  const loss = g.loans.find((l) => l.borrower === PLAYER && l.writtenOff > 0)!;
  assert.ok(loss);
  assert.ok(g.events.some((e) => e.title === "A pledge was called"));
  assert.ok(g.events.some((e) => e.title === "The circle absorbed a deficit"));
  const cut = loss.cuts.find((c) => c.remaining > 0)!;
  assert.ok(cut, "stress loss should reach member shares");
  g = act(g, { type: "next" });
  const targetBefore = member(g, cut.member)[cut.account];
  const firstCut = g.loans
    .find((l) => l.id === loss.id)!
    .cuts.find((c) => c.remaining > 0)!;
  const amount = Math.min(firstCut.remaining, member(g).cash);
  g = act(g, { type: "repay", loan: loss.id, amount });
  assert.equal(member(g, cut.member)[cut.account], targetBefore + amount);
  assertGame(g);
});

test("full seasons are deterministic, conserve ledgers, and finish all projects and performing loans", () => {
  const play = (seed: string, style: string) => {
    let g = createGame(seed);
    for (let month = 1; month <= 24; month++) {
      g = invest(g, style);
      assertGame(g);
      if (month < 24) g = act(g, { type: "next" });
    }
    g = act(g, { type: "runoff" });
    assertGame(g);
    assert.equal(g.phase, "finished");
    assert.equal(g.round, 31);
    assert.equal(g.history.length, 31);
    assert.equal(g.projects.filter((p) => p.status === "running").length, 0);
    assert.equal(g.loans.filter((l) => l.status === "active").length, 0);
    for (const event of g.events) {
      const b = event.balance;
      assert.equal(
        b.cash + b.loans,
        b.claims + b.reserve + b.earnings,
        `journal snapshot ${event.id} ${event.title}`,
      );
    }
    return g;
  };
  const first = play("replayable", "balanced"),
    second = play("replayable", "balanced");
  assert.deepEqual(first, second);
  for (let i = 0; i < 18; i++)
    play("season-" + i, ["balanced", "bold", "careful"][i % 3]);
});
