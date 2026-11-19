import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownLeft,
  Check,
  ChevronRight,
  X,
  BookOpen,
  RotateCcw,
  Wallet,
  Sprout,
  Landmark,
  Handshake,
  ShieldCheck,
  CircleHelp,
  TrendingUp,
  ReceiptText,
  Trophy,
  Coins,
  LockKeyhole,
  Vote as VoteIcon,
  Pause,
  Play,
  Download,
  LogOut,
  Info,
  CheckCheck,
} from "lucide-react";
import type {
  ApplicationView,
  Disclosure,
  Family,
  Game,
  Member,
  OfferView,
  Vote,
} from "./types.ts";
import {
  BANDS,
  FAMILIES,
  credibility,
  credits,
  estimate,
  money,
  ownOffer,
  repaymentSchedule,
} from "./economy.ts";
import {
  act,
  applications,
  assertGame,
  balance,
  canBorrow,
  capacity,
  ceiling,
  createGame,
  debt,
  freeFunds,
  lendingCash,
  loanInterest,
  maxPledge,
  member,
  multiplier,
  PLAYER,
  pledged,
  queued,
  visibleEvents,
  wealth,
  type Command,
} from "./engine.ts";
import { ProjectArt } from "./Art.tsx";

const SAVE_KEY = "circle-table-v1";
const pct = (n: number) => Math.round(n * 100) + "%";
const cash = (n: number) => money(n);
const styleNames: Record<string, string> = {
  balanced: "Finding your own way",
  patient: "Patient planner",
  builder: "Enterprising builder",
  careful: "Careful saver",
  bold: "Bold investor",
  social: "Community minded",
};
const steps = ["Budget", "Opportunity", "Backing", "Vote", "Results"];
const phaseIndex = (g: Game) =>
  g.phase === "budget"
    ? 0
    : g.phase === "opportunity"
      ? 1
      : g.phase === "backing"
        ? 2
        : g.phase === "vote"
          ? 3
          : 4;
type Tab = "table" | "portfolio" | "ledger" | "standings";
type ModalState =
  | null
  | { type: "rules" | "accounts" | "new" }
  | { type: "member"; id: string }
  | { type: "offer"; id: string };

function loadGame(): { game: Game; warning: string } {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const game = JSON.parse(saved);
      assertGame(game);
      return { game, warning: "" };
    }
  } catch {
    return {
      game: createGame(),
      warning:
        "Your previous local save could not be opened. A fresh table is ready.",
    };
  }
  return { game: createGame(), warning: "" };
}

function Modal({
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-inner">
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
function Token({ m, size = 42 }: { m: Member; size?: number }) {
  return (
    <span
      className="token"
      style={{ "--token": m.color, width: size, height: size } as CSSProperties}
    >
      {m.initials}
    </span>
  );
}
function Risk({
  value,
  label = "Estimated chance of failure",
  term,
}: {
  value: { low: number; high: number; mean: number };
  label?: string;
  term: number;
}) {
  return (
    <div className="risk">
      <div className="risk-label">
        <span>{label}</span>
        <strong>
          {pct(value.low)}–{pct(value.high)}
        </strong>
      </div>
      <div className="risk-track">
        <span
          style={{
            left: pct(value.low / 0.6),
            width: pct((value.high - value.low) / 0.6),
          }}
        />
        <i style={{ left: pct(value.mean / 0.6) }} />
      </div>
      <div className="risk-foot">
        <span>Central 80% range · over {term} months</span>
        <span>Mean {pct(value.mean)}</span>
      </div>
    </div>
  );
}
function Stat({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  sub?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-label">
        {icon}
        {label}
      </div>
      <strong>
        {value}
        <small> cr</small>
      </strong>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function Board({ g, onMember }: { g: Game; onMember: (id: string) => void }) {
  const b = balance(g),
    open = applications(g);
  return (
    <section className="board" aria-label="Your six member circle">
      <div className="board-grain" />
      <div className="board-oval" />
      <span className="board-caption">
        THE ALDER CIRCLE <span>·</span> EST. BEFORE YOUR FIRST TURN
      </span>
      {g.members.map((m, i) => {
        const app = open.find((a) => a.borrower === m.id),
          hasPledge = pledged(g, m.id) > 0;
        return (
          <button
            key={m.id}
            className={"seat seat-" + i + (!m.active ? " inactive" : "")}
            onClick={() => onMember(m.id)}
            aria-label={"View " + m.name + "’s membership"}
          >
            <div className="seat-avatar">
              <Token m={m} size={48} />
              {app ? (
                <span className="seat-symbol">
                  <Coins size={12} />
                </span>
              ) : hasPledge ? (
                <span className="seat-symbol">
                  <Handshake size={12} />
                </span>
              ) : m.active ? (
                <span className="seat-active" />
              ) : null}
            </div>
            <strong>{m.name}</strong>
            <small>
              {m.leaving
                ? "Departing"
                : !m.active
                  ? "Inactive"
                  : app
                    ? app.status === "funded"
                      ? "Funded"
                      : app.status === "declined"
                        ? "Declined"
                        : "Loan request"
                    : cash(m.share) + " share"}
            </small>
          </button>
        );
      })}
      <div className="treasury">
        <div className="treasury-label">
          <Landmark size={17} /> SHARED TREASURY
        </div>
        <div className="treasury-value">
          {cash(g.cash)}
          <span>cr</span>
        </div>
        <div className="available">
          <span className="live-dot" />
          {cash(lendingCash(g))} available to lend
        </div>
        <div className="treasury-bottom">
          <span>
            On loan <strong>{cash(b.loans)}</strong>
          </span>
          <span>
            Reserve <strong>{cash(g.reserve)}</strong>
          </span>
        </div>
      </div>
      <div className="board-note">
        <ShieldCheck size={12} /> One active member. One vote.
      </div>
    </section>
  );
}

function Budget({ g, run }: { g: Game; run: (c: Command) => boolean }) {
  const m = member(g);
  const [contribution, setContribution] = useState(m.contribution / 100),
    [deposit, setDeposit] = useState(g.round > 24 ? 0 : m.deposit / 100);
  useEffect(() => {
    setContribution(m.contribution / 100);
    setDeposit(g.round > 24 ? 0 : m.deposit / 100);
  }, [g.round, m.leaving]);
  const total = credits(contribution + deposit),
    remaining = m.cash - total;
  const movement = credits(300) + g.flow.personalReceipts - g.flow.personalPaid;
  return (
    <div className="budget-form">
      <div className="section-kicker">YOUR MONTHLY PLAN</div>
      <details className="cash-flow">
        <summary>
          This month’s cash flow{" "}
          <span>
            {movement >= 0 ? "+" : ""}
            {cash(movement)} cr
          </span>
        </summary>
        <div>
          <span>
            Household income<strong>+1,000</strong>
          </span>
          <span>
            Living expenses<strong>−700</strong>
          </span>
          <span>
            Project receipts<strong>+{cash(g.flow.personalReceipts)}</strong>
          </span>
          <span>
            Loan payments<strong>−{cash(g.flow.personalPaid)}</strong>
          </span>
        </div>
      </details>
      <label className="money-field">
        <span>
          Circle contribution <small>Builds your membership share</small>
        </span>
        <span className="money-input">
          <input
            aria-label="Monthly circle contribution"
            type="number"
            min="0"
            step="25"
            max={g.round > 24 ? m.contribution / 100 : undefined}
            value={contribution}
            disabled={m.leaving}
            onChange={(e) =>
              setContribution(Math.max(0, Number(e.target.value)))
            }
          />
          <span>cr</span>
        </span>
      </label>
      <label className="money-field">
        <span>
          Circle savings <small>Optional, earns saver interest</small>
        </span>
        <span className="money-input">
          <input
            aria-label="Monthly circle savings"
            type="number"
            min="0"
            step="25"
            value={deposit}
            disabled={g.round > 24 || m.leaving}
            onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))}
          />
          <span>cr</span>
        </span>
      </label>
      <div className={"budget-remaining " + (remaining < 0 ? "negative" : "")}>
        <span>Keep in your own cash</span>
        <strong>{cash(remaining)} cr</strong>
      </div>
      {contribution < 50 && !m.leaving ? (
        <p className="field-note warning">
          <Info size={14} />
          Below 50, your active status lapses at month end. Your funds remain
          yours.
        </p>
      ) : (
        <p className="field-note">
          <Info size={14} />
          50 cr keeps your contribution requirement met. Cash kept aside stays
          outside the circle.
        </p>
      )}
      <button
        className="button primary full"
        disabled={remaining < 0}
        onClick={() =>
          run({
            type: "budget",
            contribution: credits(contribution),
            deposit: credits(deposit),
          })
        }
      >
        {g.round > 24 ? "Settle this month" : "Confirm my budget"}
        <ArrowRight size={17} />
      </button>
    </div>
  );
}

function PersonalPanel({
  g,
  run,
  onAccounts,
}: {
  g: Game;
  run: (c: Command) => boolean;
  onAccounts: () => void;
}) {
  const m = member(g),
    nextLoans = g.loans.filter(
      (l) => l.borrower === PLAYER && l.status === "active",
    );
  const nextDue = nextLoans.reduce(
    (s, l) =>
      s +
      Math.min(l.instalment, l.principal) +
      Math.round(l.principal * 0.01) +
      l.dues.reduce((n, d) => n + d.principal + d.interest, 0),
    0,
  );
  return (
    <aside className="personal-panel">
      <div className="panel-title">
        <Token m={m} size={36} />
        <div>
          <strong>Your seat at the table</strong>
          <span>
            {m.leaving
              ? "Departure in progress"
              : m.active
                ? "Active member"
                : "Inactive member"}{" "}
            · {multiplier(m)}× credit multiplier
          </span>
        </div>
        <span className={"status-dot " + (!m.active ? "off" : "")} />
      </div>
      <div className="cash-hero">
        <span>
          <Wallet size={15} /> PERSONAL CASH
        </span>
        <strong>
          {cash(m.cash)}
          <small> cr</small>
        </strong>
        <p>Yours to save, invest, or contribute.</p>
      </div>
      <div className="personal-grid">
        <Stat
          label="Your share"
          value={cash(m.share)}
          icon={<Sprout size={14} />}
        />
        <Stat
          label="Circle savings"
          value={cash(m.savings)}
          icon={<Coins size={14} />}
        />
        <Stat
          label="Loan balance"
          value={cash(debt(g, PLAYER))}
          icon={<ArrowUpRight size={14} />}
        />
        <Stat
          label="Can borrow"
          value={cash(
            canBorrow(g, PLAYER) && !m.leaving ? capacity(g, PLAYER) : 0,
          )}
          icon={<Landmark size={14} />}
        />
      </div>
      <button className="text-button account-link" onClick={onAccounts}>
        Manage accounts & repayments
        <ChevronRight size={15} />
      </button>
      <div className="panel-divider" />
      {g.phase === "budget" ? (
        <Budget g={g} run={run} />
      ) : (
        <TurnAction g={g} run={run} />
      )}
      {g.phase !== "finished" && (
        <div className="next-due">
          <ReceiptText size={16} />
          <div>
            Next month’s loan payments
            <strong>
              {cash(nextDue)} cr{" "}
              <span>
                ·{" "}
                {m.autoPay
                  ? "automatic payment on"
                  : "automatic payment paused"}
              </span>
            </strong>
          </div>
        </div>
      )}
      <div className="panel-foot">All amounts are fictional credits.</div>
    </aside>
  );
}
function TurnAction({ g, run }: { g: Game; run: (c: Command) => boolean }) {
  const m = member(g),
    selected = g.offers[PLAYER]?.find((o) => o.id === g.draft.selected);
  const neededVotes = g.applications.filter(
    (a) => a.eligible.includes(PLAYER) && !a.votes[PLAYER],
  ).length;
  if (g.phase === "opportunity")
    return (
      <div className="turn-action">
        <div className="section-kicker">YOUR NEXT MOVE</div>
        <h3>
          {selected ? "Your plan is ready." : "What will you make possible?"}
        </h3>
        <p>
          {selected
            ? selected.title +
              " · " +
              (g.draft.amount
                ? cash(g.draft.amount) + " cr requested from the circle."
                : "Funded from your own cash.")
            : "Explore the two opportunities in your hand. You can also keep your cash and pass this month."}
        </p>
        {selected && (
          <button
            className="text-button muted"
            onClick={() => run({ type: "select" })}
          >
            <X size={13} />
            Clear selection
          </button>
        )}
        {!m.active &&
          !m.leaving &&
          m.contributed >= credits(50) &&
          !m.passage && (
            <button
              className="button secondary full"
              onClick={() => run({ type: "reactivate" })}
            >
              Renew my active passage
            </button>
          )}
        <button
          className="button primary full"
          onClick={() => run({ type: "backing" })}
        >
          {selected ? "Take my plan to the circle" : "Pass & meet the circle"}
          <ArrowRight size={17} />
        </button>
      </div>
    );
  if (g.phase === "backing")
    return (
      <div className="turn-action">
        <div className="section-kicker">A LITTLE SHARED CONFIDENCE</div>
        <h3>Would you back a neighbour?</h3>
        <p>
          A pledge puts part of your share behind a member’s loan. It is only
          called if they cannot repay. Backers step out of that loan’s vote.
        </p>
        <div className="inline-metric">
          <span>Your available backing</span>
          <strong>{cash(maxPledge(g, PLAYER))} cr</strong>
        </div>
        <button
          className="button primary full"
          onClick={() => run({ type: "freeze" })}
        >
          Close backing & vote
          <ArrowRight size={17} />
        </button>
      </div>
    );
  if (g.phase === "vote")
    return (
      <div className="turn-action">
        <div className="section-kicker">ONE MEMBER. ONE VOTE.</div>
        <h3>Decide what gets funded.</h3>
        <p>
          Consider the project, the borrower’s evidence, and the circle’s cash.
          Borrowers and backers cannot vote on their own request.
        </p>
        <div className="inline-metric">
          <span>Your decisions remaining</span>
          <strong>{neededVotes}</strong>
        </div>
        <button
          className="button primary full"
          disabled={neededVotes > 0}
          onClick={() => run({ type: "settle" })}
        >
          Settle the month
          <CheckCheck size={17} />
        </button>
        {neededVotes > 0 && (
          <small className="hint">
            Choose yes, no, or abstain on each eligible request.
          </small>
        )}
      </div>
    );
  if (g.phase === "recap")
    return (
      <div className="turn-action">
        <div className="section-kicker">THE MONTH IS CLOSED</div>
        <h3>
          {g.round === 24
            ? "Let your investments play out."
            : "A new month, a new hand."}
        </h3>
        <p>
          {g.round >= 24
            ? "New investing is closed. Existing projects, repayments, contributions, and withdrawals settle through month 31."
            : "Your projects keep working, repayments come due, and the circle opens another round of possibilities."}
        </p>
        <button
          className="button primary full"
          onClick={() => run({ type: "next" })}
        >
          Open month {g.round + 1}
          <ArrowRight size={17} />
        </button>
        {g.round >= 24 && (
          <button
            className="button secondary full"
            onClick={() => run({ type: "runoff" })}
          >
            Finish all remaining months
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    );
  return (
    <div className="turn-action">
      <div className="section-kicker">SEASON COMPLETE</div>
      <Trophy className="finish-icon" />
      <h3>You’ve come full circle.</h3>
      <p>
        Every project has settled. Compare where everyone finished and explore
        the story in your ledger.
      </p>
      <div className="inline-metric">
        <span>Your final net worth</span>
        <strong>{cash(wealth(g, PLAYER))} cr</strong>
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  g,
  onOpen,
}: {
  offer: OfferView;
  g: Game;
  onOpen: () => void;
}) {
  const f = FAMILIES[offer.family],
    selected = g.draft.selected === offer.id;
  return (
    <article className={"offer-card " + (selected ? "selected" : "")}>
      <div className="card-art" style={{ background: f.color }}>
        <div className="card-tag">{f.label}</div>
        <ProjectArt family={offer.family} />
        {selected && (
          <span className="selected-badge">
            <Check size={13} />
            Your pick
          </span>
        )}
      </div>
      <div className="offer-body">
        <h3>{offer.title}</h3>
        <p className="offer-subtitle">{f.subtitle}</p>
        <div className="offer-figures">
          <span>
            Upfront
            <strong>
              {cash(offer.cost)} <small>cr</small>
            </strong>
          </span>
          <span>
            {offer.family === "seasonal" ? "At month 3" : "Monthly receipts"}
            <strong>
              {cash(offer.payments.at(-1)!)} <small>cr</small>
            </strong>
          </span>
          <span>
            Duration
            <strong>
              {offer.term} <small>months</small>
            </strong>
          </span>
        </div>
        <Risk value={offer.estimate} term={offer.term} />
        <button
          className="button card-button"
          onClick={onOpen}
          disabled={g.phase !== "opportunity"}
        >
          {g.phase === "budget"
            ? "Available after budgeting"
            : selected
              ? "Review your plan"
              : "Explore opportunity"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}
function OfferModal({
  g,
  offer,
  run,
  onClose,
}: {
  g: Game;
  offer: OfferView;
  run: (c: Command) => boolean;
  onClose: () => void;
}) {
  const m = member(g),
    max = canBorrow(g, PLAYER) ? Math.min(offer.cost, capacity(g, PLAYER)) : 0,
    min = Math.max(0, offer.cost - m.cash),
    was = g.draft.selected === offer.id;
  const [value, setValue] = useState(
    was
      ? g.draft.amount
      : Math.min(
          max,
          Math.max(min, offer.cost - Math.max(0, m.cash - credits(700))),
        ),
  );
  const [disclosure, setDisclosure] = useState<Disclosure>(
      was ? g.draft.disclosure : "verified",
    ),
    [band, setBand] = useState(was ? g.draft.claimedBand : offer.signal);
  const funds = freeFunds(g, PLAYER),
    ownCover = Math.min(value, funds.share + funds.savings),
    need = Math.ceil(Math.max(0, value - ownCover) * 0.25);
  const schedule = repaymentSchedule(value, offer.term);
  const cofund = offer.cost - value,
    firstDue = schedule[0].total,
    publicRisk = estimate(offer.family, disclosure, band, credibility(m));
  const interest = schedule.reduce((sum, p) => sum + p.interest, 0);
  return (
    <Modal
      title={offer.title}
      eyebrow={FAMILIES[offer.family].label}
      onClose={onClose}
      wide
    >
      <div className="offer-modal-grid">
        <div>
          <div
            className="modal-art"
            style={{ background: FAMILIES[offer.family].color }}
          >
            <ProjectArt family={offer.family} />
          </div>
          <p className="body-copy">{FAMILIES[offer.family].description}</p>
          <Risk
            value={offer.estimate}
            term={offer.term}
            label="Your private inspection estimate"
          />
          <p className="field-note">
            <ShieldCheck size={15} />
            Your inspection says “{BANDS[offer.signal]}”. It is a noisy signal,
            not knowledge of the true risk.
          </p>
          <div className="payout-strip">
            <div className="section-kicker">
              RECEIPTS IF THE PROJECT KEEPS PAYING
            </div>
            <div>
              {offer.payments.map((p, i) => (
                <span key={i}>
                  <small>M{g.round + i + 1}</small>
                  <strong>{cash(p)}</strong>
                </span>
              ))}
            </div>
          </div>
          {value > 0 && (
            <div className="payout-strip loan-strip">
              <div className="section-kicker">
                YOUR LOAN PAYMENTS IN THE SAME MONTHS
              </div>
              <div>
                {schedule.map((p, i) => (
                  <span key={i}>
                    <small>M{g.round + i + 1}</small>
                    <strong>{money(p.total, p.total % 100 !== 0)}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="hint">
            If it fails, future receipts stop. You recover 20% of its remaining
            straight line cost basis. Your loan still has to be repaid.
          </p>
        </div>
        <div className="funding-form">
          <div className="section-kicker">MAKE IT HAPPEN</div>
          <div className="inline-metric">
            <span>Upfront investment</span>
            <strong>{cash(offer.cost)} cr</strong>
          </div>
          <label className="loan-label" htmlFor="loan-amount">
            Borrow from the circle<strong>{cash(value)} cr</strong>
          </label>
          <input
            id="loan-amount"
            aria-label="Circle loan amount"
            className="range"
            type="range"
            min="0"
            max={max}
            step="1"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="range-ends">
            <button onClick={() => setValue(0)}>Use own cash</button>
            <button onClick={() => setValue(max)}>Max {cash(max)}</button>
          </div>
          <label className="exact-amount">
            Exact loan amount{" "}
            <span className="money-input">
              <input
                aria-label="Exact loan amount"
                type="number"
                min="0"
                max={max / 100}
                step="25"
                value={value / 100}
                onChange={(e) =>
                  setValue(
                    Math.max(0, Math.min(max, credits(Number(e.target.value)))),
                  )
                }
              />
              <span>cr</span>
            </span>
          </label>
          <div className="funding-lines">
            <div>
              <span>Your cash invested</span>
              <strong>{cash(cofund)} cr</strong>
            </div>
            <div>
              <span>Cash left afterwards</span>
              <strong className={m.cash < cofund ? "negative" : ""}>
                {cash(m.cash - cofund)} cr
              </strong>
            </div>
            <div>
              <span>First loan instalment + interest</span>
              <strong>{cash(firstDue)} cr</strong>
            </div>
            <div>
              <span>Total scheduled loan interest</span>
              <strong>{money(interest, true)} cr</strong>
            </div>
            {need > 0 && (
              <div>
                <span>Other members’ backing needed</span>
                <strong>{money(need, true)} cr</strong>
              </div>
            )}
          </div>
          {value > 0 && (
            <>
              <label className="select-label" htmlFor="disclosure">
                What will you tell the circle?
              </label>
              <select
                id="disclosure"
                value={disclosure}
                onChange={(e) => setDisclosure(e.target.value as Disclosure)}
              >
                <option value="verified">
                  Attach my inspection · verified
                </option>
                <option value="claim">Make an unverified risk claim</option>
                <option value="withheld">Withhold my inspection</option>
              </select>
              {disclosure === "claim" && (
                <label className="select-label">
                  Your public claim
                  <select
                    aria-label="Claimed risk band"
                    value={band}
                    onChange={(e) => setBand(Number(e.target.value))}
                  >
                    {BANDS.map((b, i) => (
                      <option value={i} key={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="hint">
                {disclosure === "verified"
                  ? "Members see the estimate from your inspection. A verified attachment does not raise your credibility."
                  : disclosure === "claim"
                    ? "Claims are interpreted using your credibility. An audit may later compare your claim with the original inspection."
                    : "Members see a wider estimate based on project type and the fact that evidence was withheld."}
              </p>
              <div className="public-preview">
                <span>The circle will see</span>
                <strong>
                  {pct(publicRisk.low)}–{pct(publicRisk.high)} failure risk
                </strong>
              </div>
            </>
          )}
          {min > max && (
            <p className="field-note warning">
              Your cash and available borrowing do not cover this project yet.
            </p>
          )}
          <button
            className="button primary full"
            disabled={cofund > m.cash || m.leaving}
            onClick={() => {
              if (
                run({
                  type: "select",
                  offer: offer.id,
                  amount: value,
                  disclosure,
                  claimedBand: band,
                })
              )
                onClose();
            }}
          >
            Choose this opportunity
            <Check size={17} />
          </button>
          <p className="hint centered">
            {value
              ? "Funding still needs a vote, enough backing, and available treasury cash."
              : "This is a personal investment. No circle vote is needed."}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function ApplicationCard({
  g,
  app,
  run,
}: {
  g: Game;
  app: ApplicationView;
  run: (c: Command) => boolean;
}) {
  const m = member(g, app.borrower),
    raw = g.applications.find((a) => a.id === app.id)!,
    mine = app.borrower === PLAYER;
  const myPledge = app.pledges.find((p) => p.member === PLAYER)?.amount ?? 0,
    myVote = raw.votes[PLAYER],
    eligible = app.eligible.includes(PLAYER);
  const closed = g.phase === "recap" || g.phase === "finished";
  const canPledge =
    !mine &&
    g.voters.includes(PLAYER) &&
    !member(g).leaving &&
    maxPledge(g, PLAYER) > 0;
  return (
    <article className="application-card">
      <div className="application-heading">
        <Token m={m} />
        <div>
          <strong>
            {m.name}
            {mine ? " · your request" : ""}
          </strong>
          <span>{styleNames[m.style]}</span>
        </div>
        <span className={"pill " + (closed ? "result-" + app.status : "")}>
          {closed
            ? app.status.replace("-", " ")
            : cash(app.amount) + " cr loan"}
        </span>
      </div>
      <h3>{app.title}</h3>
      <div className="application-meta">
        <span>{FAMILIES[app.family].label}</span>
        <span>{app.term} months · 1% / month</span>
      </div>
      <Risk value={app.estimate} term={app.term} />
      <div className="evidence">
        <span>
          {app.disclosure === "verified" ? (
            <ShieldCheck size={15} />
          ) : app.disclosure === "withheld" ? (
            <LockKeyhole size={15} />
          ) : (
            <CircleHelp size={15} />
          )}
          <strong>
            {app.disclosure === "verified"
              ? "Inspection attached"
              : app.disclosure === "withheld"
                ? "Inspection withheld"
                : BANDS[app.claimedBand!] + " risk claimed"}
          </strong>
        </span>
        <small>
          Credibility {pct(app.credibility)} · {app.auditCount} audited claims
        </small>
      </div>
      <div className="application-numbers">
        <div>
          <span>Own funds securing loan</span>
          <strong>{cash(app.ownCover)} cr</strong>
        </div>
        <div>
          <span>Personal cash invested</span>
          <strong>{cash(app.cost - app.amount)} cr</strong>
        </div>
        <div>
          <span>
            {app.family === "seasonal"
              ? "Final project receipt"
              : "Monthly project receipts"}
          </span>
          <strong>{cash(app.payments.at(-1)!)} cr</strong>
        </div>
      </div>
      <div className="backing-line">
        <Handshake size={16} />
        <span>
          {app.needed > 0
            ? money(app.needed, true) + " cr still needs backing"
            : app.backing
              ? money(app.backing, true) +
                " cr backed by " +
                app.pledges
                  .filter((p) => p.amount)
                  .map((p) => member(g, p.member).name)
                  .join(", ")
              : "Covered by the borrower’s own funds"}
        </span>
      </div>
      {g.phase === "backing" && (
        <div className="application-actions">
          {myPledge > 0 ? (
            <button
              className="button secondary full"
              onClick={() =>
                run({ type: "pledge", application: app.id, amount: 0 })
              }
            >
              <X size={14} />
              Remove your {money(myPledge, true)} cr pledge
            </button>
          ) : app.needed > 0 && canPledge ? (
            <button
              className="button secondary full"
              onClick={() =>
                run({
                  type: "pledge",
                  application: app.id,
                  amount: Math.min(app.needed, maxPledge(g, PLAYER)),
                })
              }
            >
              <Handshake size={16} />
              Back {money(Math.min(app.needed, maxPledge(g, PLAYER)), true)} cr
              with my share
            </button>
          ) : (
            <div className="quiet-status">
              {mine
                ? "Other members can back your request."
                : app.needed === 0
                  ? "All required cover is in place."
                  : "You have no available backing for this request."}
            </div>
          )}
        </div>
      )}
      {g.phase === "vote" && (
        <div className="application-actions">
          <div className="vote-requirement">
            {app.required} yes votes needed · {app.eligible.length} eligible
            members
          </div>
          {eligible ? (
            <div className="vote-buttons">
              {(["yes", "no", "abstain"] as Vote[]).map((v) => (
                <button
                  key={v}
                  className={
                    "vote-button " + v + (myVote === v ? " chosen" : "")
                  }
                  onClick={() =>
                    run({ type: "vote", application: app.id, vote: v })
                  }
                >
                  {v === "yes" ? (
                    <Check size={15} />
                  ) : v === "no" ? (
                    <X size={15} />
                  ) : null}
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <div className="quiet-status">
              <LockKeyhole size={14} />
              {mine
                ? "You cannot vote on your own loan."
                : myPledge
                  ? "Your backing means you sit this vote out."
                  : "You are not in this month’s active electorate."}
            </div>
          )}
        </div>
      )}
      {closed && (
        <div className="application-actions">
          <div className="vote-outcome">
            {Object.entries(raw.votes).map(([id, v]) => (
              <span
                key={id}
                title={member(g, id).name + ": " + v}
                className={"vote-chip " + v}
              >
                {member(g, id).name}{" "}
                {v === "yes" ? "✓" : v === "no" ? "×" : "–"}
              </span>
            ))}
          </div>
          <p className="hint">
            {app.status === "funded"
              ? "Funded. First repayment is due next month."
              : app.reason}
          </p>
        </div>
      )}
    </article>
  );
}

function TableContent({
  g,
  run,
  onOffer,
}: {
  g: Game;
  run: (c: Command) => boolean;
  onOffer: (id: string) => void;
}) {
  const apps = applications(g),
    offers = (g.offers[PLAYER] ?? []).map(ownOffer),
    summary = g.history.at(-1);
  const showOffers =
    ["budget", "opportunity"].includes(g.phase) && g.round <= 24;
  return (
    <>
      {showOffers ? (
        <section className="hand-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                A LITTLE CAPITAL. A NEW POSSIBILITY.
              </div>
              <h2>Your opportunity hand</h2>
            </div>
            <span className="small-note">Choose up to one this month</span>
          </div>
          {offers.length ? (
            <div className="offer-grid">
              {offers.map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  g={g}
                  onOpen={() => onOffer(o.id)}
                />
              ))}
            </div>
          ) : (
            <Empty
              title="Your existing projects keep running."
              text="You have begun leaving the circle. Manage your accounts and let the remaining commitments settle."
            />
          )}
        </section>
      ) : null}
      {g.phase === "recap" && summary ? (
        <section className="recap-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MONTH {g.round} · IN THE BOOKS</div>
              <h2>Here’s how the month landed.</h2>
            </div>
            <CheckCheck size={26} />
          </div>
          <div className="recap-grid">
            <Stat
              label="Your project receipts"
              value={cash(summary.personalReceipts)}
              icon={<ArrowDownLeft size={14} />}
            />
            <Stat
              label="Your loan payments"
              value={cash(summary.personalPaid)}
              icon={<ArrowUpRight size={14} />}
            />
            <Stat
              label="Circle net surplus"
              value={money(summary.surplus, true)}
              icon={<TrendingUp size={14} />}
            />
            <Stat
              label="Shared dividends"
              value={money(summary.dividend, true)}
              icon={<Sprout size={14} />}
            />
          </div>
          <p className="body-copy">
            {summary.funded} new project{summary.funded !== 1 ? "s" : ""} funded
            across the circle. {money(summary.retained, true)} cr retained
            collectively.{" "}
            {summary.losses > 0
              ? cash(summary.losses) +
                " cr of unpaid loan assets entered the loss waterfall."
              : "All current loan asset losses are reflected in the treasury."}
          </p>
        </section>
      ) : null}
      {["backing", "vote", "recap"].includes(g.phase) && (
        <section className="requests-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {g.phase === "backing"
                  ? "SHARED PLANS"
                  : g.phase === "vote"
                    ? "THE CIRCLE DECIDES"
                    : "THE DECISIONS"}
              </div>
              <h2>
                {g.phase === "backing"
                  ? "Around the table"
                  : g.phase === "vote"
                    ? "Lend your voice."
                    : "What the circle made possible"}
              </h2>
            </div>
            <span className="small-note">
              {apps.length} loan request{apps.length !== 1 ? "s" : ""}
            </span>
          </div>
          {apps.length ? (
            <div className="application-grid">
              {apps.map((app) => (
                <ApplicationCard key={app.id} g={g} app={app} run={run} />
              ))}
            </div>
          ) : (
            <Empty
              title="A quiet month at the table."
              text="Nobody requested a circle loan. Members may still have invested their own cash. Continue to settle existing commitments and savings."
            />
          )}
        </section>
      )}
      {g.round > 24 && g.phase === "budget" && (
        <Empty
          title="Time to let things settle."
          text="The investment season is closed. Your projects and loans keep running. Keep or reduce your contribution, then settle this month—or finish the remaining months from the results step."
        />
      )}
      {g.phase === "finished" && <Standings g={g} />}
    </>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <Sprout size={26} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Portfolio({ g }: { g: Game }) {
  const projects = g.projects.filter((p) => p.owner === PLAYER).reverse(),
    loans = g.loans.filter((l) => l.borrower === PLAYER).reverse();
  return (
    <section className="tab-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR MONEY AT WORK</div>
          <h2>Your portfolio</h2>
        </div>
        <span className="small-note">
          {projects.filter((p) => p.status === "running").length} projects
          running
        </span>
      </div>
      <div className="portfolio-list">
        {projects.map((p) => (
          <article className="portfolio-item" key={p.id}>
            <div
              className="portfolio-art"
              style={{ background: FAMILIES[p.family].color }}
            >
              <ProjectArt family={p.family} />
            </div>
            <div className="portfolio-info">
              <span className="eyebrow">
                {p.starter ? "OPENING INVESTMENT" : FAMILIES[p.family].label}
              </span>
              <h3>{p.title}</h3>
              <span
                className={
                  "pill result-" +
                  (p.status === "failed" ? "declined" : "funded")
                }
              >
                {p.status}
              </span>
              <div className="project-progress">
                {Array.from({ length: p.term }, (_, i) => (
                  <i key={i} className={i < p.age ? "done" : ""} />
                ))}
              </div>
              <p>
                {p.status === "running"
                  ? p.term - p.age + " months remaining"
                  : p.status === "failed"
                    ? "Future receipts stopped; recovery included below."
                    : "All scheduled receipts settled."}
              </p>
            </div>
            <div className="portfolio-value">
              <span>
                Invested<strong>{cash(p.cost)} cr</strong>
              </span>
              <span>
                Received<strong>{cash(p.receipts)} cr</strong>
              </span>
            </div>
          </article>
        ))}
      </div>
      <h3 className="subheading">Your loans</h3>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Principal left</th>
              <th>Interest due</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td>{g.projects.find((p) => p.id === l.projectId)?.title}</td>
                <td>
                  <span
                    className={
                      "pill " +
                      (l.status === "default" ? "result-declined" : "")
                    }
                  >
                    {l.status}
                  </span>
                </td>
                <td>{money(l.principal, true)}</td>
                <td>{money(loanInterest(l), true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">
        All figures in credits. Written off loan assets remain your recorded
        obligation until repaid; no new interest is charged after default.
      </p>
    </section>
  );
}

function Sparkline({
  values,
  color = "#315741",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length < 2)
    return <span className="sparkline-empty">Season just opened</span>;
  const min = Math.min(...values),
    span = Math.max(1, Math.max(...values) - min);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 130},${32 - ((v - min) / span) * 29}`,
    )
    .join(" ");
  return (
    <svg
      width="130"
      height="36"
      viewBox="0 0 130 36"
      className="sparkline"
      role="img"
      aria-label="Net worth trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Standings({ g }: { g: Game }) {
  const ranking = [...g.members].sort(
      (a, b) => wealth(g, b.id) - wealth(g, a.id),
    ),
    finished = g.phase === "finished",
    rank = ranking.findIndex((m) => m.id === PLAYER) + 1;
  return (
    <section className="tab-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            {finished ? "THE FINAL TABLE" : "SIX MEMBERS. THE SAME RULES."}
          </div>
          <h2>
            {finished
              ? "A season of shared possibility."
              : "The season standings"}
          </h2>
        </div>
        <Trophy size={28} />
      </div>
      <div className="leaderboard-banner">
        <div>
          <span>
            {finished ? "Your final position" : "Your current position"}
          </span>
          <strong>
            #{rank} <small>of 6 members</small>
          </strong>
        </div>
        <div>
          <span>{finished ? "Final net worth" : "Provisional net worth"}</span>
          <strong>
            {cash(wealth(g, PLAYER))} <small>cr</small>
          </strong>
        </div>
        <div>
          <span>Collective reserve</span>
          <strong>
            {cash(g.reserve)} <small>cr</small>
          </strong>
        </div>
      </div>
      <div className="leaderboard">
        {ranking.map((m, i) => (
          <div
            className={"ranking-row " + (m.id === PLAYER ? "is-you" : "")}
            key={m.id}
          >
            <span className="rank">{i + 1}</span>
            <Token m={m} />
            <div className="ranking-name">
              <strong>
                {m.name}
                {m.id === PLAYER ? " · you" : ""}
              </strong>
              <span>{styleNames[m.style]}</span>
            </div>
            <Sparkline values={g.history.map((h) => h.wealth[m.id])} />
            <div className="ranking-wealth">
              <strong>{cash(wealth(g, m.id))}</strong>
              <span>credits</span>
            </div>
          </div>
        ))}
      </div>
      <div className="explanation">
        <Info size={18} />
        <p>
          {finished
            ? "Final net worth is personal cash plus recoverable circle claims, minus all recorded unpaid obligations."
            : "Provisional net worth is personal cash + share + savings + remaining project cost basis − recorded debt. It is a running score, not a prediction of investment value."}{" "}
          Collective reserves belong to the circle and are excluded from
          everyone’s score. This local practice table is not a verified online
          leaderboard.
        </p>
      </div>
    </section>
  );
}
function Ledger({ g }: { g: Game }) {
  const [filter, setFilter] = useState("all"),
    [round, setRound] = useState("all");
  const events = visibleEvents(g)
    .filter(
      (e) =>
        (filter === "all" || e.kind === filter) &&
        (round === "all" || e.round === Number(round)),
    )
    .reverse();
  const b = balance(g);
  return (
    <section className="tab-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE STORY BEHIND THE NUMBERS</div>
          <h2>The circle ledger</h2>
        </div>
        <ReceiptText size={26} />
      </div>
      <div className="balance-equation">
        <span>
          Cash + performing loans
          <strong>{money(b.cash + b.loans, true)}</strong>
        </span>
        <b>=</b>
        <span>
          Member claims + reserve + earnings
          <strong>{money(b.claims + b.reserve + b.earnings, true)}</strong>
        </span>
        <span className="balanced">
          <Check size={14} />
          Balanced
        </span>
      </div>
      <div className="ledger-filters">
        <label>
          Show
          <select
            aria-label="Ledger event type"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All activity</option>
            <option value="loan">Loans & repayments</option>
            <option value="saving">Contributions & savings</option>
            <option value="project">Project receipts</option>
            <option value="loss">Losses & recovery</option>
            <option value="vote">Votes</option>
            <option value="system">Circle events</option>
          </select>
        </label>
        <label>
          Period
          <select
            aria-label="Ledger month"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          >
            <option value="all">All months</option>
            {Array.from({ length: g.round }, (_, i) => (
              <option key={i} value={i + 1}>
                Month {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="ledger-list">
        {events.length ? (
          events.map((e) => (
            <div className={"ledger-event " + e.kind} key={e.id}>
              <span className="ledger-icon">
                {e.kind === "loss" ? (
                  <ShieldCheck size={17} />
                ) : e.kind === "vote" ? (
                  <VoteIcon size={17} />
                ) : e.kind === "saving" ? (
                  <Sprout size={17} />
                ) : (
                  <ArrowDownLeft size={17} />
                )}
              </span>
              <div>
                <div className="event-meta">
                  MONTH {e.round} <span>· {e.rule}</span>
                </div>
                <strong>{e.title}</strong>
                <p>{e.detail}</p>
              </div>
              {e.amount !== undefined && (
                <span className="ledger-amount">
                  {money(e.amount, true)}
                  <small>cr</small>
                </span>
              )}
            </div>
          ))
        ) : (
          <Empty
            title="No entries here yet."
            text="Choose a different month or activity type."
          />
        )}
      </div>
    </section>
  );
}

function MemberModal({
  g,
  id,
  onClose,
}: {
  g: Game;
  id: string;
  onClose: () => void;
}) {
  const m = member(g, id),
    loans = g.loans.filter((l) => l.borrower === id && l.status !== "repaid");
  return (
    <Modal
      title={m.name === "You" ? "Your membership" : m.name + " at the table"}
      eyebrow="A MEMBER OF THE ALDER CIRCLE"
      onClose={onClose}
    >
      <div className="member-intro">
        <Token m={m} size={64} />
        <div>
          <h3>{styleNames[m.style]}</h3>
          <p>
            {m.leaving
              ? "Departing"
              : m.active
                ? "Active member · one vote"
                : "Inactive · funds remain held"}
            {m.everDefaulted ? " · default on record" : ""}
          </p>
        </div>
      </div>
      <div className="personal-grid modal-stats">
        <Stat label="Membership share" value={cash(m.share)} />
        <Stat label="Optional savings" value={cash(m.savings)} />
        <Stat label="Outstanding debt" value={cash(debt(g, id))} />
        <Stat label="Backing others" value={cash(pledged(g, id))} />
      </div>
      <div className="member-facts">
        <div>
          <span>Disclosure credibility</span>
          <strong>{pct(credibility(m))}</strong>
        </div>
        <div>
          <span>Audited claims matched</span>
          <strong>
            {m.matches} / {m.auditedClaims}
          </strong>
        </div>
        <div>
          <span>Clean qualifying loans</span>
          <strong>{m.cleanLoans}</strong>
        </div>
        <div>
          <span>Borrowing multiplier</span>
          <strong>{multiplier(m)}×</strong>
        </div>
        <div>
          <span>Total credit ceiling</span>
          <strong>{cash(ceiling(g, id))} cr</strong>
        </div>
      </div>
      <p className="body-copy">
        Credibility changes how the circle interprets an unverified risk claim.
        It does not change voting power or the credit multiplier. Repayment
        history and eligible contributed funds determine borrowing capacity.
      </p>
      {loans.length > 0 && (
        <p className="hint">
          {loans.length} outstanding loan{loans.length !== 1 ? "s" : ""}. A
          larger share earns a larger share of eligible dividends, but still
          only one active vote.
        </p>
      )}
    </Modal>
  );
}

function AccountsModal({
  g,
  run,
  onClose,
}: {
  g: Game;
  run: (c: Command) => boolean;
  onClose: () => void;
}) {
  const m = member(g),
    free = freeFunds(g, PLAYER),
    editable = ["budget", "opportunity"].includes(g.phase),
    loans = g.loans.filter(
      (l) => l.borrower === PLAYER && l.status !== "repaid",
    );
  const [withdraw, setWithdraw] = useState(100),
    [repayment, setRepayment] = useState(100),
    [loanId, setLoanId] = useState(loans[0]?.id ?? ""),
    [confirmExit, setConfirmExit] = useState(false);
  useEffect(() => {
    if (!loans.some((l) => l.id === loanId)) setLoanId(loans[0]?.id ?? "");
  }, [g.loans, loanId]);
  return (
    <Modal
      title="Your accounts & commitments"
      eyebrow="YOUR SEAT, YOUR CHOICES"
      onClose={onClose}
    >
      <div className="account-summary">
        <span>
          Personal cash<strong>{cash(m.cash)} cr</strong>
        </span>
        <span>
          Free circle savings<strong>{money(free.savings, true)} cr</strong>
        </span>
      </div>
      <h3 className="subheading">Move savings back to your cash</h3>
      <p className="body-copy">
        Withdrawals need one month’s notice. Due requests are paid before new
        lending, proportionally if cash is short. A claim stays in the circle
        until it is paid.
      </p>
      <div className="action-field">
        <span className="money-input">
          <input
            aria-label="Savings withdrawal amount"
            type="number"
            value={withdraw}
            min="0"
            step="25"
            onChange={(e) => setWithdraw(Number(e.target.value))}
          />
          <span>cr</span>
        </span>
        <button
          className="button secondary"
          disabled={
            !editable || withdraw <= 0 || credits(withdraw) > free.savings
          }
          onClick={() => run({ type: "withdraw", amount: credits(withdraw) })}
        >
          Request withdrawal
        </button>
      </div>
      {queued(g, PLAYER) > 0 && (
        <p className="field-note">
          <Check size={14} />
          {money(queued(g, PLAYER), true)} cr is in your withdrawal queue.
        </p>
      )}
      <h3 className="subheading">Loan repayments</h3>
      <button
        className="toggle-row"
        disabled={g.phase === "finished"}
        onClick={() => run({ type: "autopay", enabled: !m.autoPay })}
      >
        <span>
          {m.autoPay ? <Play size={16} /> : <Pause size={16} />}Automatic
          repayment{" "}
          <small>
            {m.autoPay
              ? "Pays dues from your personal cash each month."
              : "Paused. Unpaid dues can lead to default."}
          </small>
        </span>
        <span className={"switch " + (m.autoPay ? "on" : "")}>
          <i />
        </span>
      </button>
      {loans.length > 0 && (
        <>
          <label className="select-label">
            Make an extra repayment
            <select
              aria-label="Loan to repay"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
            >
              {loans.map((l) => (
                <option key={l.id} value={l.id}>
                  {g.projects.find((p) => p.id === l.projectId)?.title} ·{" "}
                  {cash(l.principal + loanInterest(l))} cr
                </option>
              ))}
            </select>
          </label>
          <div className="action-field">
            <span className="money-input">
              <input
                aria-label="Extra repayment amount"
                type="number"
                min="0"
                step="25"
                value={repayment}
                onChange={(e) => setRepayment(Number(e.target.value))}
              />
              <span>cr</span>
            </span>
            <button
              className="button secondary"
              disabled={
                !editable ||
                repayment <= 0 ||
                credits(repayment) > m.cash ||
                !loans.some((l) => l.id === loanId)
              }
              onClick={() =>
                run({ type: "repay", loan: loanId, amount: credits(repayment) })
              }
            >
              Repay now
            </button>
          </div>
        </>
      )}
      {!editable && g.phase !== "finished" && (
        <p className="field-note">
          <Info size={14} />
          Withdrawals and extra repayments reopen during next month’s budget and
          opportunity steps.
        </p>
      )}
      <h3 className="subheading">Membership & exit</h3>
      <p className="body-copy">
        {m.leaving
          ? "Your departure is recorded. Existing projects and obligations keep running; your free claims leave through the withdrawal queue."
          : "You can lower your contribution without leaving. An exit first sets off your own obligations, then queues free claims. Pledges stay attached. The collective reserve stays with the circle."}
      </p>
      {!m.leaving &&
        g.phase !== "finished" &&
        (confirmExit ? (
          <div className="exit-confirm">
            <p>Leave this circle for the rest of this season?</p>
            <button
              className="button danger"
              onClick={() => {
                if (run({ type: "exit" })) {
                  setConfirmExit(false);
                  onClose();
                }
              }}
            >
              Confirm departure
            </button>
            <button
              className="text-button"
              onClick={() => setConfirmExit(false)}
            >
              Keep my seat
            </button>
          </div>
        ) : (
          <button
            className="text-button danger-text"
            disabled={g.phase !== "budget"}
            onClick={() => setConfirmExit(true)}
          >
            <LogOut size={15} />
            Leave the circle
            {g.phase !== "budget" ? " · available during budget" : ""}
          </button>
        ))}
    </Modal>
  );
}
function Rulebook({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="A little guide to the circle"
      eyebrow="THE RULEBOOK · VERSION 0.1"
      onClose={onClose}
      wide
    >
      <p className="rule-intro">
        Build your own future with a little help from a shared pool. The other
        five members are doing the same.
      </p>
      <div className="rules-grid">
        <section>
          <span className="rule-number">01</span>
          <h3>You’re already a member.</h3>
          <p>
            You start with 1,500 cr in personal cash, a 1,000 cr share, 500 cr
            in circle savings, and a small project with a 600 cr loan. Month
            one’s income, receipts, expenses, and loan payment have already
            arrived when the board opens.
          </p>
          <p>
            Every month brings 1,000 cr income and 700 cr living costs. Choose
            what to contribute, deposit as circle savings, or keep outside.
          </p>
        </section>
        <section>
          <span className="rule-number">02</span>
          <h3>Choose what to make possible.</h3>
          <p>
            Two opportunities arrive each month. Start up to one, using your own
            cash and an optional circle loan. Project receipts flow to your
            cash; repayments are due even when a project fails. Some receipts
            arrive monthly, others only at the end.
          </p>
          <p>
            Loan interest is 1% of opening principal per month. Principal is
            repaid in equal instalments, with any rounding remainder in the last
            payment.
          </p>
        </section>
        <section>
          <span className="rule-number">03</span>
          <h3>Evidence is imperfect.</h3>
          <p>
            Your inspection is a noisy signal. Share it, make an unverified
            claim, or withhold it. The circle sees a central 80% range for
            failure risk over the whole project, plus its estimated mean.
            Credibility measures how audited claims matched inspections—not
            whether a project was lucky.
          </p>
          <p>
            All members face the same risk and disclosure rules. Bots have
            distinct strategies and only use information their member could see.
          </p>
        </section>
        <section>
          <span className="rule-number">04</span>
          <h3>The circle has a voice.</h3>
          <p>
            Each active member has one vote. A contribution of at least 50 cr
            and an active passage keep that status. If you lapse, fund 50 cr and
            request a renewed passage, attested by two active members.
          </p>
          <p>
            Borrowers and backers sit out the relevant vote. Approval needs a
            majority of the remaining eligible members, with at least two yes
            votes. Abstaining does not lower that threshold.
          </p>
        </section>
        <section>
          <span className="rule-number">05</span>
          <h3>Keep the cash moving.</h3>
          <p>
            Your borrowing ceiling is eligible share and savings × your
            repayment multiplier, less existing principal. Clean qualifying
            loans lift the multiplier from 1× to 2×. Funds backing others and
            queued withdrawals are excluded.
          </p>
          <p>
            Your own available funds secure a loan first. Any excess needs
            sureties for at least 25%. The treasury honours due withdrawals and
            keeps 10% of member claims in cash before funding whole approved
            requests in a fair seeded order.
          </p>
        </section>
        <section>
          <span className="rule-number">06</span>
          <h3>Returns belong somewhere.</h3>
          <p>
            Eligible opening shares and savings earn 0.1% monthly saver
            interest, credited to savings. Of positive net earnings, 25% goes to
            the collective reserve; the rest is distributed in proportion to
            eligible shares.
          </p>
          <p>
            Reserve is a collective claim on assets, not a second cash pot.
            Shares can earn different returns without creating more votes.
          </p>
        </section>
        <section>
          <span className="rule-number">07</span>
          <h3>Commitments survive bad luck.</h3>
          <p>
            A missed payment blocks new borrowing. Arrears still unpaid after
            the following due date cause default. Losses use the borrower’s
            funds, assigned pledges, current income, reserve, shares, then
            savings. Default stops interest but leaves unpaid obligations
            recorded.
          </p>
          <p>
            Withdrawals have one month’s notice and remain claims until paid.
            Exiting sets off your obligations; it does not release guarantees or
            pay out the reserve.
          </p>
        </section>
        <section>
          <span className="rule-number">08</span>
          <h3>Play the whole season.</h3>
          <p>
            Make decisions for 24 months, then allow seven more months for
            settlement. Final net worth is cash + recoverable circle claims −
            recorded unpaid obligations. No one owns the collective reserve.
          </p>
          <p>
            This is a local practice game with five bots and a save in this
            browser. It implements the single-circle member season. Online
            rooms, recursive circle networks, founding, referrals, and
            negotiable checks are later stages of the blueprint.
          </p>
        </section>
      </div>
      <div className="explanation">
        <Info size={18} />
        <p>
          Source blueprint rules and selected game assumptions are mapped in the
          private repository. Risk frequencies, project terms, scoring, audit
          frequency, and the seasonal turn structure are simulation choices, not
          claims about real financial products.
        </p>
      </div>
    </Modal>
  );
}
function NewGame({
  onClose,
  onNew,
  g,
}: {
  onClose: () => void;
  onNew: (seed: string) => void;
  g: Game;
}) {
  const [seed, setSeed] = useState("alder-" + Date.now().toString(36));
  const exportSave = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(g, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "circle-month-" + g.round + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal
      title="A new seat at a new table"
      eyebrow="START ANOTHER SEASON"
      onClose={onClose}
    >
      <p className="body-copy">
        Starting again replaces this browser’s current season. Each member
        begins with the same position. A different seed deals a different set of
        opportunities and outcomes.
      </p>
      <label className="select-label">
        Table seed
        <input
          className="text-input"
          value={seed}
          maxLength={64}
          onChange={(e) => setSeed(e.target.value)}
        />
      </label>
      <div className="new-actions">
        <button className="button secondary" onClick={exportSave}>
          <Download size={16} />
          Export current season
        </button>
        <button
          className="button primary"
          disabled={!seed.trim()}
          onClick={() => onNew(seed.trim())}
        >
          Start new season
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="hint">
        Exports are local records for inspection. Scores are not verified or
        shared online.
      </p>
    </Modal>
  );
}

export default function App() {
  const [loaded] = useState(loadGame),
    [g, setGame] = useState(loaded.game),
    [tab, setTab] = useState<Tab>("table"),
    [modal, setModal] = useState<ModalState>(null),
    [toast, setToast] = useState(loaded.warning),
    [saveError, setSaveError] = useState(false);
  const [intro, setIntro] = useState(() => {
    try {
      return localStorage.getItem("circle-intro-dismissed") !== "yes";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(g));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [g]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const run = (command: Command) => {
    try {
      const next = act(g, command);
      setGame(next);
      if (next.phase !== g.phase) setTab("table");
      if (command.type === "withdraw")
        setToast("Withdrawal queued. It becomes due next month.");
      if (command.type === "repay")
        setToast("Repayment recorded. Your balances are updated.");
      if (command.type === "reactivate")
        setToast("Passage attested. Your active vote returns next month.");
      return true;
    } catch (e) {
      setToast(
        e instanceof Error ? e.message : "That move could not be completed.",
      );
      return false;
    }
  };
  const titles =
    g.phase === "budget"
      ? [
          "A new month. A little possibility.",
          "Your income and existing commitments have settled. Decide where your money goes next.",
        ]
      : g.phase === "opportunity"
        ? [
            "What will you make possible?",
            "Explore your hand. Put your cash to work, request a loan, or save for another month.",
          ]
        : g.phase === "backing"
          ? [
              "Good things start around a table.",
              "See what your fellow members are planning. Decide whose idea you would back.",
            ]
          : g.phase === "vote"
            ? [
                "The next move belongs to the circle.",
                "Read the evidence. Consider the shared treasury. Cast your vote.",
              ]
            : g.phase === "recap"
              ? [
                  "Another month, written together.",
                  "The votes are in, the accounts are closed, and your circle moves forward.",
                ]
              : [
                  "Every choice leaves a little story.",
                  "Your season is complete. See where your choices—and a little luck—have taken you.",
                ];
  const offer =
    modal?.type === "offer"
      ? (g.offers[PLAYER] ?? []).find((o) => o.id === modal.id)
      : undefined;
  return (
    <>
      <header className="site-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("table");
          }}
          aria-label="Circle game table"
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <strong>
            circle<span>.</span>
          </strong>
          <span className="brand-tagline">Good things, together.</span>
        </a>
        <div className="header-actions">
          <span className="practice-badge">
            <span className="live-dot" />
            Practice · 1 player + 5 bots
          </span>
          <button
            className="header-button"
            onClick={() => setModal({ type: "rules" })}
          >
            <BookOpen size={17} />
            <span>How to play</span>
          </button>
          <button
            className="header-button"
            onClick={() => setModal({ type: "new" })}
          >
            <RotateCcw size={16} />
            <span>New table</span>
          </button>
        </div>
      </header>
      <main className="app-shell">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="mini-line" /> YOUR SEAT AT THE ALDER CIRCLE
            </div>
            <h1>{titles[0]}</h1>
            <p>{titles[1]}</p>
          </div>
          <div className="month-marker">
            <span>{g.round > 24 ? "SETTLEMENT" : "THE SEASON"}</span>
            <strong>
              {g.phase === "finished" ? (
                "Complete"
              ) : (
                <>
                  Month {g.round}
                  <small> / {g.round > 24 ? 31 : 24}</small>
                </>
              )}
            </strong>
          </div>
        </div>
        {intro && g.round === 1 && (
          <div className="welcome-note">
            <span className="welcome-icon">
              <Sprout size={21} />
            </span>
            <p>
              <strong>You already belong here.</strong> You have savings, a
              share in the circle, and a small investment underway. Grow your
              net worth over 24 months while five neighbours make their own
              moves.
            </p>
            <button
              className="text-button"
              onClick={() => setModal({ type: "rules" })}
            >
              Learn the rules
              <ArrowUpRight size={14} />
            </button>
            <button
              className="icon-button"
              aria-label="Dismiss introduction"
              onClick={() => {
                setIntro(false);
                try {
                  localStorage.setItem("circle-intro-dismissed", "yes");
                } catch {}
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <nav className="phase-bar" aria-label="Monthly turn sequence">
          {steps.map((step, i) => (
            <div
              className={
                "phase-step " +
                (phaseIndex(g) === i
                  ? "current"
                  : phaseIndex(g) > i
                    ? "complete"
                    : "")
              }
              key={step}
              aria-current={phaseIndex(g) === i ? "step" : undefined}
            >
              <span>{phaseIndex(g) > i ? <Check size={13} /> : i + 1}</span>
              <strong>{step}</strong>
              {i < 4 && <ChevronRight size={14} />}
            </div>
          ))}
          <span className={"save-state " + (saveError ? "save-error" : "")}>
            <span className="save-dot" />
            {saveError ? "Save unavailable" : "Saved on this browser"}
          </span>
        </nav>
        <div className="game-layout">
          <div className="main-column">
            <Board g={g} onMember={(id) => setModal({ type: "member", id })} />
            <div className="season-track" aria-label="Season progress">
              <span>YOUR SEASON</span>
              <div>
                {Array.from({ length: 24 }, (_, i) => (
                  <i
                    key={i}
                    title={"Month " + (i + 1)}
                    className={
                      i + 1 < g.round ? "past" : i + 1 === g.round ? "now" : ""
                    }
                  />
                ))}
              </div>
              <small>
                {g.round <= 24
                  ? "24 months of possibility"
                  : "Settlement · months 25–31"}
              </small>
            </div>
            <nav className="view-tabs" aria-label="Game views">
              {(
                [
                  {
                    id: "table",
                    label: "The table",
                    icon: <Landmark size={16} />,
                  },
                  {
                    id: "portfolio",
                    label: "My portfolio",
                    icon: <TrendingUp size={16} />,
                  },
                  {
                    id: "ledger",
                    label: "Circle ledger",
                    icon: <ReceiptText size={16} />,
                  },
                  {
                    id: "standings",
                    label: "Standings",
                    icon: <Trophy size={16} />,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  className={tab === t.id ? "active" : ""}
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                >
                  {t.icon}
                  {t.label}
                  {t.id === "portfolio" && (
                    <span className="tab-count">
                      {
                        g.projects.filter(
                          (p) => p.owner === PLAYER && p.status === "running",
                        ).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="tab-content">
              {tab === "table" ? (
                <TableContent
                  g={g}
                  run={run}
                  onOffer={(id) => setModal({ type: "offer", id })}
                />
              ) : tab === "portfolio" ? (
                <Portfolio g={g} />
              ) : tab === "ledger" ? (
                <Ledger g={g} />
              ) : (
                <Standings g={g} />
              )}
            </div>
          </div>
          <PersonalPanel
            g={g}
            run={run}
            onAccounts={() => setModal({ type: "accounts" })}
          />
        </div>
        <footer className="site-footer">
          <span className="footer-brand">circle.</span>
          <span>A game of shared possibility.</span>
          <span>Local practice · seed {g.seed} · rules 0.1</span>
        </footer>
      </main>
      {modal?.type === "rules" && <Rulebook onClose={() => setModal(null)} />}
      {modal?.type === "member" && (
        <MemberModal g={g} id={modal.id} onClose={() => setModal(null)} />
      )}
      {modal?.type === "accounts" && (
        <AccountsModal g={g} run={run} onClose={() => setModal(null)} />
      )}
      {offer && (
        <OfferModal
          key={offer.id}
          g={g}
          offer={ownOffer(offer)}
          run={run}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "new" && (
        <NewGame
          g={g}
          onClose={() => setModal(null)}
          onNew={(seed) => {
            setGame(createGame(seed));
            setModal(null);
            setTab("table");
            setToast("A new table is ready. Make yourself at home.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {toast && (
        <div role="status" className="toast">
          <Info size={17} />
          <span>{toast}</span>
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
