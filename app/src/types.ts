export type Phase =
  "budget" | "opportunity" | "backing" | "vote" | "recap" | "finished";
export type Family = "equipment" | "seasonal" | "venture";
export type Disclosure = "verified" | "claim" | "withheld";
export type Vote = "yes" | "no" | "abstain";
export type Style =
  "balanced" | "patient" | "builder" | "bold" | "careful" | "social";
export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  style: Style;
  cash: number;
  share: number;
  savings: number;
  contribution: number;
  deposit: number;
  active: boolean;
  leaving: boolean;
  exited: boolean;
  passage: boolean;
  cleanLoans: number;
  auditedClaims: number;
  matches: number;
  omissions: number;
  everDefaulted: boolean;
  autoPay: boolean;
  contributed: number;
}
export interface Offer {
  id: string;
  owner: string;
  family: Family;
  title: string;
  cost: number;
  term: number;
  payments: number[];
  riskBand: number;
  signal: number;
}
export interface Project extends Offer {
  started: number;
  age: number;
  status: "running" | "completed" | "failed";
  receipts: number;
  disclosure?: Disclosure;
  claimedBand?: number;
  loanId?: string;
  starter?: boolean;
  audited: boolean;
}
export interface Due {
  round: number;
  principal: number;
  interest: number;
}
export interface Pledge {
  member: string;
  amount: number;
  original: number;
}
export interface Cut {
  member: string;
  account: "share" | "savings";
  remaining: number;
}
export interface Loan {
  id: string;
  borrower: string;
  projectId: string;
  original: number;
  principal: number;
  term: number;
  started: number;
  instalment: number;
  dues: Due[];
  status: "active" | "repaid" | "default";
  everLate: boolean;
  ownShare: number;
  ownSavings: number;
  originalExcess: number;
  pledges: Pledge[];
  lossRound?: number;
  writtenOff: number;
  cuts: Cut[];
  reserveLoss: number;
}
export interface Application {
  id: string;
  borrower: string;
  offer: Offer;
  amount: number;
  ownShare: number;
  ownSavings: number;
  pledges: Pledge[];
  disclosure: Disclosure;
  claimedBand: number;
  eligible: string[];
  votes: Record<string, Vote>;
  required: number;
  status: "open" | "funded" | "declined" | "unfunded" | "self-funded";
  reason: string;
}
export interface Withdrawal {
  id: string;
  member: string;
  account: "savings" | "share";
  amount: number;
  due: number;
}
export interface Balance {
  cash: number;
  loans: number;
  claims: number;
  reserve: number;
  earnings: number;
}
export interface GameEvent {
  id: string;
  round: number;
  kind: "saving" | "loan" | "project" | "vote" | "loss" | "income" | "system";
  title: string;
  detail: string;
  amount?: number;
  member?: string;
  private?: boolean;
  rule: string;
  balance: Balance;
}
export interface Summary {
  round: number;
  interest: number;
  saverInterest: number;
  surplus: number;
  retained: number;
  dividend: number;
  losses: number;
  funded: number;
  reserve: number;
  cash: number;
  wealth: Record<string, number>;
  personalReceipts: number;
  personalPaid: number;
  personalSaved: number;
}
export interface Game {
  version: 1;
  seed: string;
  round: number;
  phase: Phase;
  members: Member[];
  cash: number;
  reserve: number;
  earnings: number;
  loans: Loan[];
  projects: Project[];
  offers: Record<string, Offer[]>;
  applications: Application[];
  withdrawals: Withdrawal[];
  voters: string[];
  events: GameEvent[];
  history: Summary[];
  opening: {
    shares: Record<string, number>;
    savings: Record<string, number>;
    reserve: number;
  };
  flow: {
    interest: number;
    losses: number;
    personalReceipts: number;
    personalPaid: number;
  };
  draft: {
    contribution: number;
    deposit: number;
    selected?: string;
    amount: number;
    disclosure: Disclosure;
    claimedBand: number;
  };
}
export interface Estimate {
  mean: number;
  low: number;
  high: number;
  weights: number[];
}
export interface OfferView {
  id: string;
  family: Family;
  title: string;
  cost: number;
  term: number;
  payments: number[];
  signal: number;
  estimate: Estimate;
}
export interface ApplicationView {
  id: string;
  borrower: string;
  title: string;
  family: Family;
  amount: number;
  cost: number;
  term: number;
  payments: number[];
  disclosure: Disclosure;
  claimedBand?: number;
  estimate: Estimate;
  credibility: number;
  auditCount: number;
  ownCover: number;
  backing: number;
  needed: number;
  pledges: Pledge[];
  eligible: string[];
  required: number;
  status: Application["status"];
  reason: string;
}
export interface BotView {
  id: string;
  style: Style;
  cash: number;
  capacity: number;
  freeShare: number;
  active: boolean;
  canBorrow: boolean;
  offers: OfferView[];
}
