import type {
  Application,
  ApplicationView,
  BotView,
  Disclosure,
  Estimate,
  Family,
  Member,
  Offer,
  OfferView,
} from "./types.ts";

export const credits = (n: number) => Math.round(n * 100);
export const money = (n: number, precise = false) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: precise ? 2 : 0,
    minimumFractionDigits: precise ? 2 : 0,
  }).format(n / 100);
export const RISKS = [0.05, 0.15, 0.3, 0.5];
export const BANDS = ["Low", "Moderate", "Elevated", "High"];
export function repaymentSchedule(principal: number, term: number) {
  const instalment = Math.floor(principal / term);
  let remaining = principal;
  return Array.from({ length: term }, (_, i) => {
    const payment = i === term - 1 ? remaining : instalment;
    const interest = Math.round(remaining * 0.01);
    remaining -= payment;
    return { principal: payment, interest, total: payment + interest };
  });
}
export const FAMILIES: Record<
  Family,
  {
    label: string;
    subtitle: string;
    description: string;
    cost: number;
    term: number;
    payments: number[];
    prior: number[];
    color: string;
    titles: string[];
  }
> = {
  equipment: {
    label: "Equipment lease",
    subtitle: "A little enterprise. A steady income.",
    description:
      "Buy equipment and lease it to a neighbourhood workshop. Monthly rent can help cover your repayments.",
    cost: credits(1200),
    term: 6,
    payments: Array(6).fill(credits(240)),
    prior: [0.6, 0.3, 0.1, 0],
    color: "#cbdc9c",
    titles: [
      "The neighbourhood workshop",
      "A maker’s new tools",
      "The weekend print studio",
      "A shared coffee cart",
    ],
  },
  seasonal: {
    label: "Seasonal order",
    subtitle: "A patient investment. One bigger payout.",
    description:
      "Fund stock for a seasonal order. The payment comes at the end, so you need enough cash to bridge the first two months.",
    cost: credits(1200),
    term: 3,
    payments: [0, 0, credits(1560)],
    prior: [0.15, 0.45, 0.3, 0.1],
    color: "#ecc395",
    titles: [
      "The harvest market",
      "A neighbourhood feast",
      "The summer collection",
      "A seasonal flower order",
    ],
  },
  venture: {
    label: "New venture",
    subtitle: "More possibility. More at stake.",
    description:
      "Back a small new business in exchange for monthly receipts. It needs more capital and has a wider range of possible outcomes.",
    cost: credits(2400),
    term: 6,
    payments: Array(6).fill(credits(540)),
    prior: [0.05, 0.15, 0.45, 0.35],
    color: "#c6b9e3",
    titles: [
      "The rooftop growing club",
      "A local delivery venture",
      "The corner kitchen",
      "An independent design studio",
    ],
  },
};
export const SIGNALS = [
  [0.7, 0.3, 0, 0],
  [0.15, 0.7, 0.15, 0],
  [0, 0.15, 0.7, 0.15],
  [0, 0, 0.3, 0.7],
];

// Stable event-keyed draws: unrelated choices never reroll a project. D16.
export function random(seed: string, key: string): number {
  let h = 2166136261;
  for (const c of seed + ":" + key)
    h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h += 0x6d2b79f5;
  let t = Math.imul(h ^ (h >>> 15), 1 | h);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function draw(weights: number[], u: number): number {
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (u < cumulative) return i;
  }
  return weights.length - 1;
}
export function credibility(member: Pick<Member, "matches" | "auditedClaims">) {
  return (2 + member.matches) / (4 + member.auditedClaims);
}
export function estimate(
  family: Family,
  disclosure: Disclosure,
  band: number,
  q = 0.5,
): Estimate {
  const weights = FAMILIES[family].prior.map(
    (p, k) =>
      p *
      (disclosure === "verified"
        ? SIGNALS[k][band]
        : disclosure === "claim"
          ? q * SIGNALS[k][band] + (1 - q) / 4
          : [1, 1.25, 1.5, 2][k]),
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  const posterior =
    sum > 0 ? weights.map((w) => w / sum) : [...FAMILIES[family].prior];
  return {
    weights: posterior,
    mean: posterior.reduce((s, w, i) => s + w * RISKS[i], 0),
    low: RISKS[draw(posterior, 0.1)],
    high: RISKS[draw(posterior, 0.9)],
  };
}
export function generateOffers(
  seed: string,
  owner: string,
  round: number,
): Offer[] {
  const families = (Object.keys(FAMILIES) as Family[]).sort(
    (a, b) =>
      random(seed, owner + ":offer:" + round + ":" + a) -
      random(seed, owner + ":offer:" + round + ":" + b),
  );
  return families.slice(0, 2).map((family) => {
    const f = FAMILIES[family],
      id = owner + "-" + round + "-" + family;
    const riskBand = draw(f.prior, random(seed, id + ":risk"));
    return {
      id,
      owner,
      family,
      title: f.titles[Math.floor(random(seed, id + ":name") * f.titles.length)],
      cost: f.cost,
      term: f.term,
      payments: [...f.payments],
      riskBand,
      signal: draw(SIGNALS[riskBand], random(seed, id + ":inspection")),
    };
  });
}
export function ownOffer(offer: Offer): OfferView {
  return {
    id: offer.id,
    family: offer.family,
    title: offer.title,
    cost: offer.cost,
    term: offer.term,
    payments: [...offer.payments],
    signal: offer.signal,
    estimate: estimate(offer.family, "verified", offer.signal),
  };
}
export function projectExpectation(
  offer: Pick<OfferView, "cost" | "term" | "payments" | "estimate">,
) {
  return offer.estimate.weights.reduce((sum, weight, band) => {
    const h = 1 - Math.pow(1 - RISKS[band], 1 / offer.term);
    let survival = 1,
      receipts = 0;
    for (let age = 1; age <= offer.term; age++) {
      receipts +=
        survival *
        ((h * 0.2 * offer.cost * (offer.term - age + 1)) / offer.term +
          (1 - h) * offer.payments[age - 1]);
      survival *= 1 - h;
    }
    return sum + weight * receipts;
  }, 0);
}

// Policies receive observations, never Game / latent risk / another person's inspection.
export function botChoice(
  view: BotView,
  chance: number,
): {
  offer: string;
  amount: number;
  disclosure: Disclosure;
  claimedBand: number;
} | null {
  if (
    chance >
    (view.style === "bold" ? 0.84 : view.style === "patient" ? 0.48 : 0.67)
  )
    return null;
  const targetCash = credits(
    view.style === "careful" ? 1100 : view.style === "bold" ? 350 : 700,
  );
  const ranked = view.offers
    .map((offer) => {
      const coFunding = Math.min(
        offer.cost,
        Math.max(0, view.cash - targetCash),
      );
      let amount = Math.max(0, offer.cost - coFunding);
      if (amount > view.capacity || !view.canBorrow) amount = 0;
      const self = offer.cost <= Math.max(0, view.cash - credits(250));
      if ((!amount && !self) || (amount > 0 && offer.cost - amount > view.cash))
        return null;
      const profit =
        projectExpectation(offer) -
        offer.cost -
        (amount * 0.01 * (offer.term + 1)) / 2;
      return { offer, amount, profit };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.profit - a.profit);
  const best = ranked[0];
  if (!best || best.profit < (view.style === "bold" ? -credits(65) : 0))
    return null;
  const strategic = view.style === "bold" || view.style === "builder";
  const disclosure: Disclosure =
    strategic && best.offer.signal >= 2
      ? chance < 0.32
        ? "claim"
        : "withheld"
      : "verified";
  return {
    offer: best.offer.id,
    amount: best.amount,
    disclosure,
    claimedBand:
      disclosure === "claim"
        ? Math.max(0, best.offer.signal - 1)
        : best.offer.signal,
  };
}
export function botWillingness(
  style: string,
  app: ApplicationView,
  priorDefault: boolean,
) {
  if (priorDefault) return false;
  const threshold =
    style === "bold"
      ? 0.44
      : style === "careful"
        ? 0.2
        : style === "patient"
          ? 0.25
          : 0.34;
  return app.estimate.mean <= threshold && app.amount <= app.cost;
}
export function publicApplication(
  app: Application,
  member: Member,
): ApplicationView {
  const backing = app.pledges.reduce((sum, p) => sum + p.amount, 0);
  const ownCover = app.ownShare + app.ownSavings;
  return {
    id: app.id,
    borrower: app.borrower,
    title: app.offer.title,
    family: app.offer.family,
    amount: app.amount,
    cost: app.offer.cost,
    term: app.offer.term,
    payments: [...app.offer.payments],
    disclosure: app.disclosure,
    claimedBand: app.disclosure === "withheld" ? undefined : app.claimedBand,
    estimate: estimate(
      app.offer.family,
      app.disclosure,
      app.claimedBand,
      credibility(member),
    ),
    credibility: credibility(member),
    auditCount: member.auditedClaims,
    ownCover,
    backing,
    needed: Math.max(
      0,
      Math.ceil(Math.max(0, app.amount - ownCover) * 0.25) - backing,
    ),
    pledges: app.pledges.map((p) => ({ ...p })),
    eligible: [...app.eligible],
    required: app.required,
    status: app.status,
    reason: app.reason,
  };
}
