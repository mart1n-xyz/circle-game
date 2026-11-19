import type {
  Application,
  BotView,
  Cut,
  Disclosure,
  Game,
  GameEvent,
  Loan,
  Member,
  Offer,
  Phase,
  Summary,
  Vote,
} from "./types.ts";
import {
  botChoice,
  botWillingness,
  credits,
  generateOffers,
  money,
  ownOffer,
  publicApplication,
  random,
  RISKS,
} from "./economy.ts";

export const PLAYER = "you";
export const RULES_VERSION = "circle-v0.1";
const OPEN = (a: Application) => a.status === "open";
const activeLoans = (g: Game) => g.loans.filter((l) => l.status === "active");
export const member = (g: Game, id = PLAYER) => {
  const m = g.members.find((m) => m.id === id);
  if (!m) throw new Error("That member is not at this table.");
  return m;
};
export const loanInterest = (l: Loan) =>
  l.dues.reduce((s, d) => s + d.interest, 0);
export const debt = (g: Game, id: string) =>
  g.loans
    .filter((l) => l.borrower === id && l.status !== "repaid")
    .reduce((s, l) => s + l.principal + loanInterest(l), 0);
export const principal = (g: Game, id: string) =>
  g.loans
    .filter((l) => l.borrower === id && l.status !== "repaid")
    .reduce((s, l) => s + l.principal, 0);
export const queued = (g: Game, id: string, account?: "share" | "savings") =>
  g.withdrawals
    .filter((w) => w.member === id && (!account || w.account === account))
    .reduce((s, w) => s + w.amount, 0);
export const pledged = (g: Game, id: string, excluding?: string) =>
  [
    ...activeLoans(g),
    ...g.applications.filter((a) => OPEN(a) && a.id !== excluding),
  ].reduce(
    (s, l) =>
      s +
      l.pledges
        .filter((p) => p.member === id)
        .reduce((n, p) => n + p.amount, 0),
    0,
  );
export const multiplier = (m: Member) => 1 + 0.25 * Math.min(m.cleanLoans, 4);
export const eligibleFunds = (g: Game, id: string) =>
  Math.max(
    0,
    member(g, id).share +
      member(g, id).savings -
      pledged(g, id) -
      queued(g, id),
  );
export const ceiling = (g: Game, id: string) =>
  Math.floor(eligibleFunds(g, id) * multiplier(member(g, id)));
export const capacity = (g: Game, id: string) =>
  Math.max(0, ceiling(g, id) - principal(g, id));
export function freeFunds(g: Game, id: string, excluding?: string) {
  const m = member(g, id);
  const own = [
    ...activeLoans(g),
    ...g.applications.filter((a) => OPEN(a) && a.id !== excluding),
  ].filter((l) => l.borrower === id);
  return {
    share: Math.max(
      0,
      m.share -
        own.reduce((s, l) => s + l.ownShare, 0) -
        pledged(g, id, excluding) -
        queued(g, id, "share"),
    ),
    savings: Math.max(
      0,
      m.savings -
        own.reduce((s, l) => s + l.ownSavings, 0) -
        queued(g, id, "savings"),
    ),
  };
}
export function maxPledge(g: Game, id: string, excluding?: string) {
  const requested = g.applications
    .filter((a) => OPEN(a) && a.borrower === id)
    .reduce((s, a) => s + a.amount, 0);
  return Math.max(
    0,
    Math.min(
      freeFunds(g, id, excluding).share,
      Math.floor(
        eligibleFunds(g, id) -
          (principal(g, id) + requested) / multiplier(member(g, id)),
      ),
    ),
  );
}
export function canBorrow(g: Game, id: string) {
  const m = member(g, id);
  return (
    !m.everDefaulted &&
    !m.leaving &&
    !m.exited &&
    !g.loans.some(
      (l) =>
        l.borrower === id && l.dues.some((d) => d.principal + d.interest > 0),
    )
  );
}
export function wealth(g: Game, id: string) {
  const m = member(g, id);
  const basis = g.projects
    .filter((p) => p.owner === id && p.status === "running")
    .reduce((s, p) => s + Math.round((p.cost * (p.term - p.age)) / p.term), 0);
  return m.cash + m.share + m.savings + basis - debt(g, id);
}
export function balance(g: Game) {
  return {
    cash: g.cash,
    loans: activeLoans(g).reduce((s, l) => s + l.principal, 0),
    claims: g.members.reduce((s, m) => s + m.share + m.savings, 0),
    reserve: g.reserve,
    earnings: g.earnings,
  };
}
export const lendingCash = (g: Game) =>
  Math.max(
    0,
    g.cash -
      g.withdrawals
        .filter((w) => w.due <= g.round)
        .reduce((s, w) => s + w.amount, 0) -
      Math.ceil(balance(g).claims * 0.1),
  );
export const requiredVotes = (n: number) => Math.max(2, Math.floor(n / 2) + 1);
export const applications = (g: Game) =>
  g.applications
    .filter((a) => a.amount > 0)
    .map((a) => publicApplication(a, member(g, a.borrower)));
export function botView(g: Game, id: string): BotView {
  const m = member(g, id);
  return {
    id,
    style: m.style,
    cash: m.cash,
    capacity: capacity(g, id),
    freeShare: maxPledge(g, id),
    active: m.active,
    canBorrow: canBorrow(g, id),
    offers: (g.offers[id] ?? []).map(ownOffer),
  };
}
export function visibleEvents(g: Game) {
  return g.events.filter((e) => !e.private || e.member === PLAYER);
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function amount(value: number) {
  ensure(
    Number.isSafeInteger(value) && value >= 0,
    "Use a valid, non-negative amount.",
  );
}
function phase(g: Game, allowed: Phase[]) {
  ensure(
    allowed.includes(g.phase),
    "That choice belongs to another part of the turn.",
  );
}
function log(
  g: Game,
  kind: GameEvent["kind"],
  title: string,
  detail: string,
  rule: string,
  value?: number,
  actor?: string,
  priv = false,
) {
  g.events.push({
    id: "e-" + g.events.length,
    round: g.round,
    kind,
    title,
    detail,
    rule,
    amount: value,
    member: actor,
    private: priv,
    balance: balance(g),
  });
}
// Largest remainder, keyed ties. All input/output balances are integer minor units.
export function apportion(
  total: number,
  weights: number[],
  seed = "rounding",
): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || total <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (total * w) / sum),
    values = raw.map(Math.floor);
  let remaining = total - values.reduce((a, b) => a + b, 0);
  const order = weights
    .map((_, i) => i)
    .sort(
      (a, b) =>
        raw[b] - values[b] - (raw[a] - values[a]) ||
        random(seed, "" + a) - random(seed, "" + b),
    );
  for (const index of order) {
    if (remaining-- <= 0) break;
    values[index]++;
  }
  return values;
}
export function assertGame(g: Game) {
  ensure(
    g.version === 1 &&
      Number.isInteger(g.round) &&
      g.round >= 1 &&
      g.round <= 31,
    "This saved season is not compatible.",
  );
  const b = balance(g);
  ensure(
    b.cash + b.loans === b.claims + b.reserve + b.earnings,
    "The circle ledger did not balance.",
  );
  for (const v of [
    g.cash,
    g.reserve,
    ...g.members.flatMap((m) => [m.cash, m.share, m.savings]),
    ...g.loans.flatMap((l) => [
      l.principal,
      l.ownShare,
      l.ownSavings,
      ...l.pledges.map((p) => p.amount),
    ]),
  ]) {
    ensure(Number.isSafeInteger(v) && v >= 0, "A game balance became invalid.");
  }
  for (const m of g.members) {
    const own = [...activeLoans(g), ...g.applications.filter(OPEN)].filter(
      (l) => l.borrower === m.id,
    );
    ensure(
      own.reduce((s, l) => s + l.ownShare, 0) +
        pledged(g, m.id) +
        queued(g, m.id, "share") <=
        m.share,
      "A share was committed twice.",
    );
    ensure(
      own.reduce((s, l) => s + l.ownSavings, 0) + queued(g, m.id, "savings") <=
        m.savings,
      "Savings were committed twice.",
    );
  }
}
export function initialGame(seed = "alder-2026"): Game {
  const people = [
    ["you", "You", "YO", "#f4d581", "balanced"],
    ["mara", "Mara", "MA", "#dab8ee", "patient"],
    ["leo", "Leo", "LE", "#edab91", "builder"],
    ["ines", "Ines", "IN", "#a6cec0", "careful"],
    ["rafi", "Rafi", "RA", "#a8c7e5", "bold"],
    ["june", "June", "JU", "#d5d99c", "social"],
  ];
  const members: Member[] = people.map(
    ([id, name, initials, color, style]) => ({
      id,
      name,
      initials,
      color,
      style: style as Member["style"],
      cash: credits(1500),
      share: credits(1000),
      savings: credits(500),
      contribution: credits(100),
      deposit: 0,
      active: true,
      leaving: false,
      exited: false,
      passage: true,
      cleanLoans: 2,
      auditedClaims: 0,
      matches: 0,
      omissions: 0,
      everDefaulted: false,
      autoPay: true,
      contributed: 0,
    }),
  );
  const loans: Loan[] = members.map((m) => ({
    id: "starter-loan-" + m.id,
    borrower: m.id,
    projectId: "starter-" + m.id,
    original: credits(600),
    principal: credits(600),
    term: 3,
    started: 0,
    instalment: credits(200),
    dues: [],
    status: "active",
    everLate: false,
    ownShare: credits(600),
    ownSavings: 0,
    originalExcess: 0,
    pledges: [],
    writtenOff: 0,
    cuts: [],
    reserveLoss: 0,
  }));
  const g: Game = {
    version: 1,
    seed,
    round: 1,
    phase: "budget",
    members,
    cash: credits(6300),
    reserve: credits(900),
    earnings: 0,
    loans,
    projects: members.map((m) => ({
      id: "starter-" + m.id,
      owner: m.id,
      family: "equipment",
      title: "Your first equipment lease",
      cost: credits(600),
      term: 3,
      payments: Array(3).fill(credits(220)),
      riskBand: 0,
      signal: 0,
      started: 0,
      age: 0,
      status: "running",
      receipts: 0,
      loanId: "starter-loan-" + m.id,
      starter: true,
      audited: false,
    })),
    offers: {},
    applications: [],
    withdrawals: [],
    voters: members.map((m) => m.id),
    events: [],
    history: [],
    opening: { shares: {}, savings: {}, reserve: credits(900) },
    flow: { interest: 0, losses: 0, personalReceipts: 0, personalPaid: 0 },
    draft: {
      contribution: credits(100),
      deposit: 0,
      amount: 0,
      disclosure: "verified",
      claimedBand: 0,
    },
  };
  log(
    g,
    "system",
    "A seat at the table",
    "Six active members. Equal starting positions. One vote each.",
    "U03 / B05",
  );
  assertGame(g);
  return g;
}
export function createGame(seed = "alder-2026") {
  const g = initialGame(seed);
  openMonth(g);
  assertGame(g);
  return g;
}

function releaseCover(loan: Loan) {
  let release = Math.max(0, loan.ownShare + loan.ownSavings - loan.principal);
  const savingRelease = Math.min(release, loan.ownSavings);
  loan.ownSavings -= savingRelease;
  release -= savingRelease;
  loan.ownShare -= Math.min(release, loan.ownShare);
  const excess = Math.max(0, loan.principal - loan.ownShare - loan.ownSavings);
  for (const p of loan.pledges)
    p.amount =
      loan.originalExcess > 0
        ? Math.min(
            p.amount,
            Math.ceil((p.original * excess) / loan.originalExcess),
          )
        : 0;
}
function reducePrincipal(loan: Loan, value: number, release = true) {
  loan.principal -= value;
  let remainder = value;
  for (const d of loan.dues) {
    const v = Math.min(remainder, d.principal);
    d.principal -= v;
    remainder -= v;
  }
  if (release) releaseCover(loan);
}
function finishLoan(g: Game, l: Loan) {
  l.dues = l.dues.filter((d) => d.principal + d.interest > 0);
  if (l.principal || loanInterest(l)) return;
  const clean = l.status === "active" && !l.everLate;
  l.status = "repaid";
  l.ownShare = 0;
  l.ownSavings = 0;
  l.pledges.forEach((p) => (p.amount = 0));
  if (clean && l.original >= credits(500) && l.term >= 3)
    member(g, l.borrower).cleanLoans++;
  log(
    g,
    "loan",
    "Loan repaid",
    member(g, l.borrower).name +
      " has cleared their loan." +
      (clean ? " A clean repayment builds their borrowing record." : ""),
    "B13 / B14",
    l.original,
    l.borrower,
  );
}
function payLoan(g: Game, l: Loan, maximum: number, includeFuture = false) {
  const m = member(g, l.borrower);
  let available = Math.min(maximum, m.cash),
    paid = 0;
  if (l.status === "repaid") return 0;
  if (l.status === "default") {
    const principalPaid = Math.min(available, l.principal);
    m.cash -= principalPaid;
    g.cash += principalPaid;
    l.principal -= principalPaid;
    available -= principalPaid;
    paid += principalPaid;
    let rest = principalPaid;
    for (const cut of l.cuts) {
      const v = Math.min(rest, cut.remaining);
      member(g, cut.member)[cut.account] += v;
      cut.remaining -= v;
      rest -= v;
    }
    const restored = Math.min(rest, l.reserveLoss);
    l.reserveLoss -= restored;
    g.reserve += restored;
    rest -= restored;
    g.earnings += rest; // Recovery of a loss previously borne by period earnings.
  }
  for (const d of l.dues) {
    const interest = Math.min(available, d.interest);
    d.interest -= interest;
    available -= interest;
    paid += interest;
    m.cash -= interest;
    g.cash += interest;
    g.earnings += interest;
    g.flow.interest += interest;
    if (l.status === "active") {
      const p = Math.min(available, d.principal);
      d.principal -= p;
      l.principal -= p;
      available -= p;
      paid += p;
      m.cash -= p;
      g.cash += p;
    }
  }
  if (l.status === "active" && includeFuture) {
    const extra = Math.min(available, l.principal);
    m.cash -= extra;
    g.cash += extra;
    paid += extra;
    reducePrincipal(l, extra);
  }
  releaseCover(l);
  if (paid) {
    if (m.id === PLAYER) g.flow.personalPaid += paid;
    log(
      g,
      "loan",
      l.status === "default" ? "Recovery received" : "Loan payment received",
      m.name +
        " paid " +
        money(paid, true) +
        " credits." +
        (l.status === "default"
          ? " Recoveries restore recorded losses before creating new surplus."
          : ""),
      "B14 / D06",
      paid,
      m.id,
    );
  }
  finishLoan(g, l);
  return paid;
}

function clampEncumbrances(g: Game) {
  for (const m of g.members) {
    const own = activeLoans(g).filter((l) => l.borrower === m.id);
    const references = [
      ...own.map((l) => ({
        value: l.ownShare,
        set: (v: number) => {
          l.ownShare = v;
        },
      })),
      ...activeLoans(g).flatMap((l) =>
        l.pledges
          .filter((p) => p.member === m.id)
          .map((p) => ({
            value: p.amount,
            set: (v: number) => {
              p.amount = v;
            },
          })),
      ),
    ];
    const sum = references.reduce((s, x) => s + x.value, 0);
    if (sum > m.share)
      apportion(
        m.share,
        references.map((x) => x.value),
        g.seed + ":haircut:" + m.id,
      ).forEach((v, i) => references[i].set(v));
    const ownSavings = own.reduce((s, l) => s + l.ownSavings, 0);
    if (ownSavings > m.savings)
      apportion(
        m.savings,
        own.map((l) => l.ownSavings),
      ).forEach((v, i) => (own[i].ownSavings = v));
    for (const account of ["share", "savings"] as const) {
      const requests = g.withdrawals.filter(
        (w) => w.member === m.id && w.account === account,
      );
      const encumbered =
        account === "share"
          ? own.reduce((s, l) => s + l.ownShare, 0) + pledged(g, m.id)
          : own.reduce((s, l) => s + l.ownSavings, 0);
      const allowed = Math.max(0, m[account] - encumbered),
        total = requests.reduce((s, w) => s + w.amount, 0);
      if (total > allowed)
        apportion(
          allowed,
          requests.map((w) => w.amount),
        ).forEach((v, i) => (requests[i].amount = v));
    }
  }
  g.withdrawals = g.withdrawals.filter((w) => w.amount > 0);
}
function setoffOwn(g: Game, id: string) {
  const m = member(g, id),
    loans = activeLoans(g).filter((l) => l.borrower === id);
  for (const account of ["share", "savings"] as const) {
    const available = Math.max(
      0,
      m[account] - (account === "share" ? pledged(g, id) : 0),
    );
    const totalPrincipal = loans.reduce((s, l) => s + l.principal, 0),
      value = Math.min(available, totalPrincipal);
    m[account] -= value;
    apportion(
      value,
      loans.map((l) => l.principal),
      g.seed + ":setoff:" + g.round,
    ).forEach((v, i) => reducePrincipal(loans[i], v, false));
    let interestCover = Math.max(0, available - value);
    for (const l of loans)
      for (const d of l.dues) {
        const paid = Math.min(interestCover, d.interest);
        m[account] -= paid;
        d.interest -= paid;
        interestCover -= paid;
        g.earnings += paid;
        g.flow.interest += paid;
      }
  }
  for (const l of loans) {
    l.ownShare = 0;
    l.ownSavings = 0;
  }
  clampEncumbrances(g);
}
function defaultMember(g: Game, id: string) {
  const m = member(g, id),
    loans = activeLoans(g).filter((l) => l.borrower === id);
  setoffOwn(g, id);
  for (const l of loans) {
    for (const pledge of l.pledges) {
      const backer = member(g, pledge.member);
      const value = Math.min(pledge.amount, backer.share, l.principal);
      backer.share -= value;
      pledge.amount -= value;
      reducePrincipal(l, value, false);
      if (value)
        log(
          g,
          "loss",
          "A pledge was called",
          backer.name +
            " covered " +
            money(value, true) +
            " of " +
            m.name +
            "’s loan.",
          "B19",
          value,
          backer.id,
        );
    }
    l.writtenOff = l.principal;
    l.lossRound = g.round;
    g.earnings -= l.principal;
    g.flow.losses += l.principal;
    l.status = "default";
    l.ownShare = 0;
    l.ownSavings = 0;
    l.pledges.forEach((p) => (p.amount = 0));
    l.dues.forEach((d) => (d.principal = 0));
    if (!l.principal && !loanInterest(l)) l.status = "repaid";
  }
  m.everDefaulted = true;
  clampEncumbrances(g);
  log(
    g,
    "loss",
    m.name + "’s loan defaulted",
    "Own funds and assigned pledges were set off. Any remaining asset loss enters the circle’s loss waterfall. Unpaid obligations remain recorded.",
    "B19 / D06",
    loans.reduce((s, l) => s + l.principal, 0),
    id,
  );
}

function openMonth(g: Game) {
  g.phase = "budget";
  g.applications = [];
  g.opening = {
    shares: Object.fromEntries(g.members.map((m) => [m.id, m.share])),
    savings: Object.fromEntries(g.members.map((m) => [m.id, m.savings])),
    reserve: g.reserve,
  };
  g.flow = { interest: 0, losses: 0, personalReceipts: 0, personalPaid: 0 };
  g.voters = g.members
    .filter((m) => m.active && !m.leaving && !m.exited)
    .map((m) => m.id);
  for (const m of g.members) {
    m.contributed = 0;
    m.cash += credits(1000);
  }
  for (const project of g.projects.filter((p) => p.status === "running")) {
    if (project.started >= g.round) continue;
    project.age++;
    const h = 1 - Math.pow(1 - RISKS[project.riskBand], 1 / project.term);
    const common =
      random(g.seed, "sector:" + project.family + ":" + g.round + ":shared") <
      0.3;
    const u = random(
      g.seed,
      common
        ? "sector:" + project.family + ":" + g.round + ":outcome"
        : project.id + ":outcome:" + project.age,
    );
    const failed = !project.starter && u < h;
    const receipt = failed
      ? Math.round(
          (0.2 * project.cost * (project.term - project.age + 1)) /
            project.term,
        )
      : project.payments[project.age - 1];
    member(g, project.owner).cash += receipt;
    project.receipts += receipt;
    if (project.owner === PLAYER) g.flow.personalReceipts += receipt;
    project.status = failed
      ? "failed"
      : project.age >= project.term
        ? "completed"
        : "running";
    if (failed || receipt)
      log(
        g,
        failed ? "loss" : "project",
        failed ? "A project stopped paying" : "Project income arrived",
        member(g, project.owner).name +
          " · " +
          project.title +
          " · " +
          money(receipt, true) +
          (failed ? " recovered." : " received."),
        "U04 / D09",
        receipt,
        project.owner,
        !project.loanId,
      );
    if (
      project.status !== "running" &&
      project.disclosure &&
      !project.audited &&
      random(g.seed, project.id + ":audit") < 0.5
    ) {
      project.audited = true;
      const owner = member(g, project.owner);
      if (project.disclosure === "claim") {
        owner.auditedClaims++;
        const match = project.claimedBand === project.signal;
        if (match) owner.matches++;
        log(
          g,
          "system",
          match ? "Disclosure checked" : "Disclosure did not match",
          owner.name +
            "’s original inspection " +
            (match ? "matched" : "differed from") +
            " their unverified claim. Project success was not used to judge honesty.",
          "D08",
          undefined,
          owner.id,
        );
      }
    }
  }
  for (const m of g.members) {
    m.cash -= credits(700);
    const ownLoans = activeLoans(g).filter((l) => l.borrower === m.id);
    for (const l of ownLoans) {
      const alreadyDue = l.dues.reduce((s, d) => s + d.principal, 0);
      const unbilled = Math.max(0, l.principal - alreadyDue);
      l.dues.push({
        round: g.round,
        principal:
          g.round - l.started >= l.term
            ? unbilled
            : Math.min(l.instalment, unbilled),
        interest: Math.round(l.principal * 0.01),
      });
      if (m.autoPay) payLoan(g, l, m.cash);
      if (l.dues.some((d) => d.principal + d.interest > 0)) l.everLate = true;
    }
    if (m.autoPay)
      for (const l of g.loans.filter(
        (l) => l.borrower === m.id && l.status === "default",
      ))
        payLoan(g, l, m.cash);
  }
  const dueDefaults = g.members
    .filter((m) =>
      activeLoans(g).some(
        (l) =>
          l.borrower === m.id &&
          l.dues.some((d) => d.round < g.round && d.principal + d.interest > 0),
      ),
    )
    .sort(
      (a, b) =>
        random(g.seed, "defaults:" + g.round + a.id) -
        random(g.seed, "defaults:" + g.round + b.id),
    );
  for (const m of dueDefaults) defaultMember(g, m.id);
  g.offers = Object.fromEntries(
    g.members.map((m) => [
      m.id,
      g.round <= 24 && !m.leaving && !m.exited
        ? generateOffers(g.seed, m.id, g.round)
        : [],
    ]),
  );
  const player = member(g);
  g.draft = {
    contribution: player.contribution,
    deposit: g.round <= 24 ? player.deposit : 0,
    amount: 0,
    disclosure: "verified",
    claimedBand: 0,
  };
  log(
    g,
    "income",
    "Month " + g.round + " is open",
    "Income, household expenses, project receipts, and authorised loan payments have settled. Budget what remains.",
    "D02 / D09",
    credits(300),
    PLAYER,
    true,
  );
}

function contribute(
  g: Game,
  m: Member,
  requested: number,
  account: "share" | "savings",
) {
  let value = Math.min(m.cash, requested);
  if (m.leaving || m.exited) return;
  if (m.everDefaulted) {
    for (const l of g.loans.filter(
      (l) => l.borrower === m.id && l.status === "default",
    )) {
      value -= payLoan(g, l, value);
    }
  }
  if (!value) return;
  m.cash -= value;
  m[account] += value;
  g.cash += value;
  if (account === "share") m.contributed += value;
  log(
    g,
    "saving",
    account === "share" ? "Monthly contribution" : "Savings deposited",
    m.name +
      " added " +
      money(value, true) +
      " to " +
      (account === "share"
        ? "their membership share."
        : "optional circle savings."),
    "B07",
    value,
    m.id,
  );
}
function confirmBudget(g: Game, contribution: number, deposit: number) {
  phase(g, ["budget"]);
  amount(contribution);
  amount(deposit);
  const player = member(g);
  ensure(
    (!player.leaving && !player.exited) || contribution + deposit === 0,
    "An exiting member cannot make new deposits.",
  );
  ensure(
    contribution + deposit <= player.cash,
    "Keep your contribution and deposit within your available cash.",
  );
  if (g.round > 24)
    ensure(
      deposit === 0 && contribution <= player.contribution,
      "During settlement you can keep or reduce your existing contribution.",
    );
  player.contribution = contribution;
  player.deposit = deposit;
  for (const m of g.members) {
    if (m.id !== PLAYER && g.round <= 24) {
      m.contribution =
        m.cash < credits(150)
          ? Math.min(m.cash, credits(50))
          : credits(
              m.style === "patient" ? 150 : m.style === "bold" ? 75 : 100,
            );
      m.deposit =
        m.style === "careful" && m.cash > credits(2500) ? credits(100) : 0;
    }
    contribute(g, m, m.contribution, "share");
    if (g.round <= 24) contribute(g, m, m.deposit, "savings");
  }
  g.draft.contribution = contribution;
  g.draft.deposit = deposit;
  if (g.round > 24) {
    settleMonth(g);
    return;
  }
  g.phase = "opportunity";
}
function createApplication(
  g: Game,
  borrower: string,
  offer: Offer,
  value: number,
  disclosure: Disclosure,
  claimedBand: number,
) {
  const m = member(g, borrower);
  amount(value);
  ensure(
    !m.leaving && !m.exited,
    "An exiting member cannot start a new project.",
  );
  ensure(value <= offer.cost, "A project loan cannot exceed its upfront cost.");
  ensure(
    value === 0 || canBorrow(g, borrower),
    "New borrowing is unavailable while arrears or a default remain on your record.",
  );
  ensure(
    value <= capacity(g, borrower),
    "This request exceeds your total borrowing capacity.",
  );
  ensure(
    offer.cost - value <= m.cash,
    "You do not have enough personal cash for that co-funding amount.",
  );
  ensure(
    !g.applications.some((a) => a.borrower === borrower && OPEN(a)),
    "Only one project can be submitted per month.",
  );
  ensure(
    ["verified", "claim", "withheld"].includes(disclosure),
    "Choose a valid disclosure.",
  );
  ensure(
    Number.isInteger(claimedBand) && claimedBand >= 0 && claimedBand <= 3,
    "Choose a valid inspection band.",
  );
  const funds = freeFunds(g, borrower);
  const ownShare = Math.min(value, funds.share),
    ownSavings = Math.min(Math.max(0, value - ownShare), funds.savings);
  const app: Application = {
    id: "app-" + offer.id,
    borrower,
    offer: structuredClone(offer),
    amount: value,
    ownShare,
    ownSavings,
    pledges: [],
    disclosure,
    claimedBand: disclosure === "verified" ? offer.signal : claimedBand,
    eligible: [],
    votes: {},
    required: 0,
    status: "open",
    reason: "",
  };
  g.applications.push(app);
  if (value > 0 && disclosure === "withheld") m.omissions++;
}
function openBacking(g: Game) {
  phase(g, ["opportunity"]);
  if (g.draft.selected) {
    const offer = (g.offers[PLAYER] ?? []).find(
      (o) => o.id === g.draft.selected,
    );
    ensure(offer, "That opportunity is no longer in your hand.");
    createApplication(
      g,
      PLAYER,
      offer,
      g.draft.amount,
      g.draft.disclosure,
      g.draft.claimedBand,
    );
  }
  for (const m of g.members.filter(
    (m) => m.id !== PLAYER && !m.leaving && !m.exited,
  )) {
    const choice = botChoice(
      botView(g, m.id),
      random(g.seed, m.id + ":choice:" + g.round),
    );
    if (choice) {
      const offer = g.offers[m.id].find((o) => o.id === choice.offer)!;
      createApplication(
        g,
        m.id,
        offer,
        choice.amount,
        choice.disclosure,
        choice.claimedBand,
      );
    }
  }
  g.phase = "backing";
  // Backers evaluate only public evidence and their own permitted financial view.
  for (const app of [...g.applications].sort(
    (a, b) =>
      random(g.seed, a.id + ":backing") - random(g.seed, b.id + ":backing"),
  )) {
    if (!app.amount) continue;
    for (const m of g.members.filter(
      (m) =>
        m.id !== PLAYER && m.id !== app.borrower && g.voters.includes(m.id),
    )) {
      const view = publicApplication(app, member(g, app.borrower));
      if (!view.needed) break;
      if (
        botWillingness(m.style, view, member(g, app.borrower).everDefaulted) &&
        random(g.seed, app.id + ":backer:" + m.id) < 0.72
      ) {
        const value = Math.min(
          view.needed,
          maxPledge(g, m.id),
          credits(m.style === "social" ? 350 : 200),
        );
        if (value > 0)
          app.pledges.push({ member: m.id, amount: value, original: value });
      }
    }
  }
  log(
    g,
    "system",
    "The circle meets",
    g.applications.filter((a) => a.amount > 0).length +
      " loan requests are on the table. Decide whether to put your own share behind one.",
    "U06 / B13",
  );
}
function pledge(g: Game, appId: string, value: number) {
  phase(g, ["backing"]);
  amount(value);
  const app = g.applications.find((a) => a.id === appId && OPEN(a));
  ensure(app && app.amount > 0, "That loan request is not open.");
  ensure(
    app.borrower !== PLAYER,
    "Your own funds already supply the first cover for your loan.",
  );
  ensure(
    g.voters.includes(PLAYER) && !member(g).leaving,
    "Only an active member may offer a new pledge.",
  );
  const old = app.pledges.find((p) => p.member === PLAYER);
  if (old) app.pledges = app.pledges.filter((p) => p.member !== PLAYER);
  ensure(
    value <= maxPledge(g, PLAYER),
    "That pledge would reuse committed funds or reduce your borrowing ceiling too far.",
  );
  const need = publicApplication(app, member(g, app.borrower)).needed;
  ensure(
    value <= need,
    "The remaining backing needed is " + money(need, true) + " credits.",
  );
  if (value)
    app.pledges.push({ member: PLAYER, amount: value, original: value });
}
function freezeVotes(g: Game) {
  phase(g, ["backing"]);
  g.phase = "vote";
  for (const app of g.applications.filter((a) => a.amount > 0)) {
    app.eligible = g.voters.filter(
      (id) =>
        id !== app.borrower &&
        !app.pledges.some((p) => p.member === id && p.amount > 0),
    );
    app.required = requiredVotes(app.eligible.length);
    const view = publicApplication(app, member(g, app.borrower));
    for (const id of app.eligible.filter((id) => id !== PLAYER)) {
      const m = member(g, id);
      app.votes[id] =
        view.needed === 0 &&
        botWillingness(m.style, view, member(g, app.borrower).everDefaulted)
          ? "yes"
          : "no";
    }
  }
}
function settleWithdrawals(g: Game) {
  const due = g.withdrawals.filter((w) => w.due <= g.round);
  const total = due.reduce((s, w) => s + w.amount, 0);
  const values = apportion(
    Math.min(g.cash, total),
    due.map((w) => w.amount),
    g.seed + ":withdrawals:" + g.round,
  );
  due.forEach((w, i) => {
    const m = member(g, w.member),
      value = Math.min(values[i], m[w.account]);
    w.amount -= value;
    m[w.account] -= value;
    m.cash += value;
    g.cash -= value;
    if (value)
      log(
        g,
        "saving",
        "Withdrawal paid",
        m.name +
          " received " +
          money(value, true) +
          " credits. Any unpaid amount remains queued.",
        "D05",
        value,
        m.id,
      );
  });
  g.withdrawals = g.withdrawals.filter((w) => w.amount > 0);
}
function fund(g: Game, app: Application) {
  const m = member(g, app.borrower),
    ownCash = app.offer.cost - app.amount;
  ensure(m.cash >= ownCash, "Committed co-funding is unavailable.");
  const project = {
    ...structuredClone(app.offer),
    started: g.round,
    age: 0,
    status: "running" as const,
    receipts: 0,
    audited: false,
    disclosure: app.amount > 0 ? app.disclosure : undefined,
    claimedBand: app.amount > 0 ? app.claimedBand : undefined,
    loanId: app.amount > 0 ? "loan-" + app.id : undefined,
  };
  m.cash -= ownCash;
  if (app.amount > 0) {
    g.cash -= app.amount;
    g.loans.push({
      id: project.loanId!,
      borrower: m.id,
      projectId: project.id,
      original: app.amount,
      principal: app.amount,
      term: app.offer.term,
      started: g.round,
      instalment: Math.floor(app.amount / app.offer.term),
      dues: [],
      status: "active",
      everLate: false,
      ownShare: app.ownShare,
      ownSavings: app.ownSavings,
      originalExcess: Math.max(0, app.amount - app.ownShare - app.ownSavings),
      pledges: structuredClone(app.pledges),
      writtenOff: 0,
      cuts: [],
      reserveLoss: 0,
    });
  }
  g.projects.push(project);
  app.status = app.amount ? "funded" : "self-funded";
  log(
    g,
    app.amount ? "loan" : "project",
    app.amount ? "A project was funded" : "A personal investment",
    m.name +
      " started " +
      app.offer.title +
      "." +
      (app.amount
        ? " Circle loan: " +
          money(app.amount) +
          "; personal cash: " +
          money(ownCash) +
          "."
        : ""),
    app.amount ? "B13 / D09" : "U04",
    app.offer.cost,
    m.id,
    !app.amount,
  );
}
function allocateDeficit(g: Game, deficit: number) {
  const absorbed = deficit;
  const reserveUsed = Math.min(g.reserve, deficit);
  g.reserve -= reserveUsed;
  deficit -= reserveUsed;
  const cuts: Cut[] = [];
  for (const account of ["share", "savings"] as const) {
    const total = g.members.reduce((s, m) => s + m[account], 0);
    const values = apportion(
      Math.min(total, deficit),
      g.members.map((m) => m[account]),
      g.seed + ":" + account + ":loss:" + g.round,
    );
    values.forEach((value, i) => {
      g.members[i][account] -= value;
      deficit -= value;
      if (value)
        cuts.push({ member: g.members[i].id, account, remaining: value });
    });
  }
  ensure(deficit === 0, "Losses exceeded the circle’s funded assets.");
  const defaults = g.loans.filter(
    (l) => l.lossRound === g.round && l.principal > 0,
  );
  let availableLoss = defaults.reduce((s, l) => s + l.principal, 0);
  for (const cut of cuts) {
    const values = apportion(
      Math.min(cut.remaining, availableLoss),
      defaults.map((l) =>
        Math.max(0, l.principal - l.cuts.reduce((s, c) => s + c.remaining, 0)),
      ),
      g.seed + ":recovery-cuts",
    );
    values.forEach((value, i) => {
      if (value) defaults[i].cuts.push({ ...cut, remaining: value });
    });
    availableLoss -= values.reduce((s, v) => s + v, 0);
  }
  const reserveValues = apportion(
    Math.min(reserveUsed, availableLoss),
    defaults.map((l) =>
      Math.max(0, l.principal - l.cuts.reduce((s, c) => s + c.remaining, 0)),
    ),
    g.seed + ":reserve-loss",
  );
  reserveValues.forEach((v, i) => (defaults[i].reserveLoss += v));
  clampEncumbrances(g);
  g.earnings += absorbed;
  if (reserveUsed || cuts.length)
    log(
      g,
      "loss",
      "The circle absorbed a deficit",
      money(reserveUsed, true) +
        " of collective reserve and " +
        money(
          cuts.reduce((s, c) => s + c.remaining, 0),
          true,
        ) +
        " of member claims absorbed the remaining loss after current income.",
      "B19 / D07",
      reserveUsed + cuts.reduce((s, c) => s + c.remaining, 0),
    );
}
function queueExitClaims(g: Game, m: Member) {
  if (!m.leaving || debt(g, m.id) > 0) return;
  const free = freeFunds(g, m.id);
  for (const account of ["share", "savings"] as const)
    if (free[account] > 0) {
      g.withdrawals.push({
        id: "exit-" + m.id + "-" + account + "-" + g.round,
        member: m.id,
        account,
        amount: free[account],
        due: g.round + 1,
      });
    }
  m.exited = m.share + m.savings === 0 && pledged(g, m.id) === 0;
}
function settleMonth(g: Game) {
  ensure(
    g.phase === "vote" || (g.phase === "budget" && g.round > 24),
    "Finish the circle’s choices before settling.",
  );
  settleWithdrawals(g);
  for (const app of g.applications.filter((a) => a.amount === 0 && OPEN(a)))
    fund(g, app);
  const approved = g.applications.filter((a) => a.amount > 0 && OPEN(a));
  for (const app of approved) {
    const yes = Object.values(app.votes).filter((v) => v === "yes").length;
    const enoughBacking =
      publicApplication(app, member(g, app.borrower)).needed === 0;
    if (yes < app.required || !enoughBacking || !canBorrow(g, app.borrower)) {
      app.status = "declined";
      app.reason = !enoughBacking
        ? "Not enough pledged backing."
        : !canBorrow(g, app.borrower)
          ? "New borrowing is restricted."
          : yes + " yes votes; " + app.required + " needed.";
    }
    log(
      g,
      "vote",
      app.status === "declined"
        ? "The request did not pass"
        : "The circle approved a request",
      member(g, app.borrower).name +
        " · " +
        app.offer.title +
        " · " +
        yes +
        "/" +
        app.required +
        " required yes votes.",
      "B10 / D03",
      app.amount,
      app.borrower,
    );
  }
  const draw = approved
    .filter(OPEN)
    .sort(
      (a, b) =>
        random(g.seed, g.round + ":funding:" + a.borrower) -
        random(g.seed, g.round + ":funding:" + b.borrower),
    );
  for (const app of draw) {
    const validCapacity =
      principal(g, app.borrower) + app.amount <= ceiling(g, app.borrower);
    if (
      !validCapacity ||
      app.amount > lendingCash(g) ||
      member(g, app.borrower).cash < app.offer.cost - app.amount
    ) {
      app.status = "unfunded";
      app.reason = !validCapacity
        ? "Capacity changed before settlement."
        : "Available cash could not fund the whole request.";
      log(
        g,
        "loan",
        "An approved request could not be funded",
        member(g, app.borrower).name +
          " · " +
          app.reason +
          " No money or pledge was taken.",
        "D03 / D05",
        app.amount,
        app.borrower,
      );
    } else fund(g, app);
  }
  const heldShares = g.members.map((m) =>
    Math.min(m.share, g.opening.shares[m.id] ?? 0),
  );
  const heldSavings = g.members.map((m) =>
    Math.min(m.savings, g.opening.savings[m.id] ?? 0),
  );
  let saverInterest = 0;
  g.members.forEach((m, i) => {
    const value = Math.round((heldShares[i] + heldSavings[i]) * 0.001);
    m.savings += value;
    g.earnings -= value;
    saverInterest += value;
  });
  const surplus = g.earnings;
  let retained = 0,
    dividend = 0;
  if (surplus >= 0) {
    retained = Math.round(surplus * 0.25);
    dividend = surplus - retained;
    if (heldShares.reduce((s, v) => s + v, 0) === 0) {
      retained += dividend;
      dividend = 0;
    }
    g.reserve += retained;
    apportion(dividend, heldShares, g.seed + ":dividend:" + g.round).forEach(
      (v, i) => (g.members[i].savings += v),
    );
  } else allocateDeficit(g, -surplus);
  g.earnings = 0;
  for (const m of g.members) {
    m.active =
      m.passage && !m.leaving && !m.exited && m.contributed >= credits(50);
    if (!m.active) m.passage = false;
    queueExitClaims(g, m);
  }
  const summary: Summary = {
    round: g.round,
    interest: g.flow.interest,
    saverInterest,
    surplus,
    retained,
    dividend,
    losses: g.flow.losses,
    funded: g.applications.filter(
      (a) => a.status === "funded" || a.status === "self-funded",
    ).length,
    reserve: g.reserve,
    cash: g.cash,
    wealth: Object.fromEntries(g.members.map((m) => [m.id, wealth(g, m.id)])),
    personalReceipts: g.flow.personalReceipts,
    personalPaid: g.flow.personalPaid,
    personalSaved: member(g).contributed,
  };
  g.history.push(summary);
  g.phase = g.round === 31 ? "finished" : "recap";
  log(
    g,
    "system",
    "Month " + g.round + " settled",
    "Saving interest: " +
      money(saverInterest, true) +
      ". Net surplus: " +
      money(surplus, true) +
      ". Retained collectively: " +
      money(retained, true) +
      ". Share dividends: " +
      money(dividend, true) +
      ".",
    "B16 / B17",
    surplus,
  );
}

export type Command =
  | { type: "budget"; contribution: number; deposit: number }
  | {
      type: "select";
      offer?: string;
      amount?: number;
      disclosure?: Disclosure;
      claimedBand?: number;
    }
  | { type: "backing" }
  | { type: "pledge"; application: string; amount: number }
  | { type: "freeze" }
  | { type: "vote"; application: string; vote: Vote }
  | { type: "settle" }
  | { type: "next" }
  | { type: "runoff" }
  | { type: "withdraw"; amount: number }
  | { type: "repay"; loan: string; amount: number }
  | { type: "autopay"; enabled: boolean }
  | { type: "reactivate" }
  | { type: "exit" };

// Every command works on a clone. A rejected command never partially changes a saved game.
export function act(current: Game, command: Command): Game {
  const g = structuredClone(current);
  ensure(
    g.phase !== "finished",
    "This season has finished. Start a new table to play again.",
  );
  switch (command.type) {
    case "budget":
      confirmBudget(g, command.contribution, command.deposit);
      break;
    case "select": {
      phase(g, ["opportunity"]);
      if (!command.offer) {
        g.draft.selected = undefined;
        break;
      }
      const offer = g.offers[PLAYER]?.find((o) => o.id === command.offer);
      ensure(offer, "Choose an opportunity from your current hand.");
      const value = command.amount ?? 0;
      amount(value);
      ensure(
        value <= offer.cost && value <= capacity(g, PLAYER),
        "That amount exceeds the project cost or your borrowing capacity.",
      );
      ensure(
        !value || canBorrow(g, PLAYER),
        "New borrowing is unavailable while arrears or a default remain on your record.",
      );
      ensure(
        offer.cost - value <= member(g).cash,
        "You need more personal cash or a larger eligible loan.",
      );
      const disclosure = command.disclosure ?? "verified",
        claimedBand = command.claimedBand ?? offer.signal;
      ensure(
        ["verified", "claim", "withheld"].includes(disclosure) &&
          Number.isInteger(claimedBand) &&
          claimedBand >= 0 &&
          claimedBand <= 3,
        "Choose a valid disclosure.",
      );
      g.draft = {
        ...g.draft,
        selected: offer.id,
        amount: value,
        disclosure,
        claimedBand: disclosure === "verified" ? offer.signal : claimedBand,
      };
      break;
    }
    case "backing":
      openBacking(g);
      break;
    case "pledge":
      pledge(g, command.application, command.amount);
      break;
    case "freeze":
      freezeVotes(g);
      break;
    case "vote": {
      phase(g, ["vote"]);
      const app = g.applications.find(
        (a) => a.id === command.application && OPEN(a),
      );
      ensure(
        app && app.eligible.includes(PLAYER),
        "You cannot vote on your own loan or a loan you back.",
      );
      ensure(
        ["yes", "no", "abstain"].includes(command.vote),
        "Choose yes, no, or abstain.",
      );
      app.votes[PLAYER] = command.vote;
      break;
    }
    case "settle":
      phase(g, ["vote"]);
      settleMonth(g);
      break;
    case "next":
      phase(g, ["recap"]);
      ensure(g.round < 31, "The season has finished.");
      g.round++;
      openMonth(g);
      break;
    case "runoff": {
      phase(g, ["recap"]);
      ensure(g.round >= 24, "The investment season is still open.");
      while (g.round < 31) {
        g.round++;
        openMonth(g);
        confirmBudget(g, Math.min(member(g).contribution, member(g).cash), 0);
      }
      break;
    }
    case "withdraw": {
      phase(g, ["budget", "opportunity"]);
      amount(command.amount);
      const m = member(g),
        available = freeFunds(g, PLAYER).savings;
      ensure(
        command.amount > 0 && command.amount <= available,
        "Only uncommitted optional savings can be requested.",
      );
      ensure(
        principal(g, PLAYER) <=
          Math.floor(
            (eligibleFunds(g, PLAYER) - command.amount) * multiplier(m),
          ),
        "That withdrawal would remove funds supporting your current borrowing capacity.",
      );
      g.withdrawals.push({
        id: "withdraw-" + g.events.length,
        member: PLAYER,
        account: "savings",
        amount: command.amount,
        due: g.round + 1,
      });
      log(
        g,
        "saving",
        "Withdrawal requested",
        money(command.amount, true) +
          " becomes due next month. It remains a circle claim until paid.",
        "D05",
        command.amount,
        PLAYER,
      );
      break;
    }
    case "repay": {
      phase(g, ["budget", "opportunity"]);
      amount(command.amount);
      const l = g.loans.find(
        (l) =>
          l.id === command.loan &&
          l.borrower === PLAYER &&
          l.status !== "repaid",
      );
      ensure(l, "That loan is no longer outstanding.");
      ensure(
        command.amount > 0 && command.amount <= member(g).cash,
        "Choose a repayment within your personal cash.",
      );
      payLoan(g, l, command.amount, true);
      break;
    }
    case "autopay":
      member(g).autoPay = command.enabled;
      break;
    case "reactivate": {
      phase(g, ["opportunity"]);
      const m = member(g);
      ensure(
        !m.leaving && !m.active && m.contributed >= credits(50),
        "A new active passage needs a funded contribution of at least 50 this month.",
      );
      ensure(
        g.members.filter(
          (other) => other.id !== PLAYER && other.active && !other.leaving,
        ).length >= 2,
        "Two active members must attest the passage.",
      );
      m.passage = true;
      log(
        g,
        "system",
        "An active passage was recorded",
        "Two active members attest your passage. Your vote returns with next month’s electorate.",
        "B05 / B10",
        undefined,
        PLAYER,
      );
      break;
    }
    case "exit": {
      phase(g, ["budget"]);
      const m = member(g);
      ensure(!m.leaving && !m.exited, "Your departure is already recorded.");
      m.leaving = true;
      m.active = false;
      m.passage = false;
      m.contribution = 0;
      m.deposit = 0;
      g.draft.contribution = 0;
      g.draft.deposit = 0;
      setoffOwn(g, PLAYER);
      for (const l of activeLoans(g).filter((l) => l.borrower === PLAYER))
        finishLoan(g, l);
      queueExitClaims(g, m);
      log(
        g,
        "system",
        "Departure recorded",
        "Own obligations are set off. Free claims enter the withdrawal queue; existing pledges stay attached until resolved. Collective reserve remains with the circle.",
        "B09 / D05",
        undefined,
        PLAYER,
      );
      break;
    }
  }
  assertGame(g);
  return g;
}
