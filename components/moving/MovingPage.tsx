"use client";

import Link from "@/components/ui/AppLink";
import type { ComponentType, ReactNode } from "react";
import { Suspense, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  CircleHelp,
  ListChecks,
  MapPin,
  Search,
  ShieldCheck,
  Truck,
  Users,
  X,
} from "lucide-react";
import { BookMove } from "@/components/moving/BookMove";
import { TrackMove } from "@/components/moving/TrackMove";
import { WorkerHub } from "@/components/moving/WorkerHub";
import { PricingCalculator } from "@/components/marketplace/PricingCalculator";
import { PublicReviews } from "@/components/marketplace/PublicReviews";
import { CustomerDashboard } from "@/components/marketplace/CustomerDashboard";
import { SupportWidget } from "@/components/platform/SupportWidget";
import { HeroFreightArt } from "@/components/platform/FreightArt";
import { authClient } from "@/lib/auth/client";
import { AREAS } from "@/lib/moving/model";
import { FAQ, TIPS } from "@/lib/marketplace/content";

/*
 * Moving, inside the property site (react-router, so it shares the site's
 * navbar, footer and phone tab bar). /moving is a short hero and a grid of
 * cards; each card opens a full-page panel (a modal, closed with ✕, Esc or
 * Back). Every panel has its own URL — /moving/book, /moving/prices,
 * /moving/track, /moving/crew, /moving/how, /moving/areas, /moving/care,
 * /moving/help — so links, SMS updates and the Back button all work.
 * Routes: property/app/pages/MovingRoutes.jsx. Old moving URLs (/book,
 * /track, /profile, /hub…) redirect in middleware.ts.
 */

type Pair = readonly [string, string];

const STEPS: Pair[] = [
  ["Tell us what’s moving", "Items, photos, both addresses and your date."],
  ["Get a reviewed quote", "Pay the deposit; we book the crew and truck."],
  ["Track it to the door", "Live stages, then a signed item checklist."],
];

const ABOUT: Pair[] = [
  ["Who does the move", "Vetted local crews and vehicle owners. Each booking records the assigned crew and vehicle."],
  ["How partners are checked", "ID, guarantor details and vehicle documents are reviewed before a partner can be assigned."],
  ["How it stays accountable", "Reviewed quotes, payment receipts, condition records and a claims log."],
];

const CARE: Pair[] = [
  ["Insurance and cover", "Insurance is not automatically included. If cover is offered, ask for the insurer, covered items, limits, exclusions, claims process and any extra charge in writing before paying."],
  ["Before collection", "Declare fragile, heavy and valuable items and confirm who packs them. Keep jewellery, cash, documents and essentials with you."],
  ["Condition records", "You and the crew record items, condition and photos at pickup and delivery. You sign it; signed records are locked, and signing doesn’t stop a later issue report."],
  ["Damage or missing items", "Report it from My moves or support with your reference, the items and photos. Operations reviews it with the partner; compensation depends on the agreed terms and evidence."],
  ["Rescheduling and cancellations", "Change online up to 48 hours before moving day. Later changes and guest bookings go through support. Paid cancellations go to refund review."],
];

const PRICE_PARTS: Pair[] = [
  ["Vehicle & crew", "A suitable vehicle, fuel and a standard loading crew are in the starting rate."],
  ["Distance & access", "Longer routes, stairs, truck size and area access add to the estimate."],
  ["Optional help", "Packing, unpacking, assembly, cleaning and extra loaders are itemised."],
  ["Paying", "A deposit once your quote is confirmed (Paystack); the balance after delivery."],
];

const PARTNERS: Pair[] = [
  ["Truck owners and moving crews", "Add your vehicles, areas, crew and documents in the crew hub below. We review them before assigning jobs."],
  ["Estate agents and office managers", "Tenant handovers, office relocations and repeat moves with one operations contact."],
];

/* ── Building blocks ─────────────────────────────────────────────── */

function Loading({ label }: { label: string }) {
  return <p className="moving-loading">{label}</p>;
}

/** Plain question-and-answer list, for short reading. */
function QA({ items }: { items: readonly (readonly string[])[] }) {
  return (
    <dl className="moving-qa">
      {items.map(([q, a]) => (
        <div key={q}>
          <dt>{q}</dt>
          <dd>{a}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Questions that open one at a time — for the long lists. */
function Accordion({ items }: { items: readonly (readonly string[])[] }) {
  return (
    <div className="moving-accordion">
      {items.map(([q, a]) => (
        <details key={q}>
          <summary>
            <span>{q}</span>
            <ChevronDown size={18} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="moving-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function SignInCard({ text, primary, signupFirst = false, returnTo }: { text: string; primary: string; signupFirst?: boolean; returnTo: string }) {
  const back = encodeURIComponent(returnTo);
  const signIn = `/auth?redirect=${back}`;
  const signUp = `/auth?mode=signup&redirect=${back}`;
  return (
    <div className="moving-signin">
      <p>{text}</p>
      <div>
        <a href={signupFirst ? signUp : signIn} className="logistics-button">
          {primary} <ArrowRight size={16} />
        </a>
        <a href={signupFirst ? signIn : signUp} className="logistics-text-link">
          {signupFirst ? "I already have an account" : "Create an account"}
        </a>
      </div>
    </div>
  );
}

/* ── Panels (each opens in the full-page modal) ──────────────────── */

function BookPanel() {
  // The form reads service/area/repeat from the URL once; remount when they change.
  const [params] = useSearchParams();
  const key = ["service", "area", "repeat"].map((k) => params.get(k) ?? "").join("|");
  return (
    <Suspense fallback={<Loading label="Loading the booking form…" />}>
      <BookMove key={key} embedded />
    </Suspense>
  );
}

function PricesPanel() {
  return (
    <>
      <PricingCalculator />
      <Block title="What the price includes">
        <QA items={PRICE_PARTS} />
      </Block>
    </>
  );
}

function MyMoves() {
  const { data, isPending } = authClient.useSession();
  if (isPending) return <Loading label="Checking your account…" />;
  if (!data?.user) {
    return (
      <SignInCard
        text="Sign in to see quotes, pay deposits, sign checklists, reschedule or report an issue."
        primary="Sign in"
        returnTo="/moving/track#my-moves"
      />
    );
  }
  return <CustomerDashboard embedded />;
}

function TrackPanel() {
  const [params] = useSearchParams();
  const key = params.get("reference") ?? params.get("ref") ?? "";
  return (
    <>
      <Suspense fallback={<Loading label="Loading tracking…" />}>
        <TrackMove key={key} embedded />
      </Suspense>
      <div id="my-moves">
        <Block title="My moves">
          <MyMoves />
        </Block>
      </div>
    </>
  );
}

function CrewHub() {
  const { data, isPending } = authClient.useSession();
  if (isPending) return <Loading label="Checking your account…" />;
  if (!data?.user) {
    return (
      <SignInCard
        text="Movers and truck owners: sign in, add your profile and documents, and assigned jobs show up here once we approve you."
        primary="Join the crew hub"
        signupFirst
        returnTo="/moving/crew"
      />
    );
  }
  return <WorkerHub embedded />;
}

function CrewPanel() {
  return (
    <>
      <QA items={PARTNERS} />
      <p className="moving-note">
        Shop, agency or office with regular moves? <a href="/contact?service=Business%20account">Talk to our team</a>.
      </p>
      <Block title="Crew hub">
        <CrewHub />
      </Block>
    </>
  );
}

function HowPanel() {
  return (
    <>
      <ol className="moving-steps">
        {STEPS.map(([title, body], i) => (
          <li key={title}>
            <span>{i + 1}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </li>
        ))}
      </ol>
      <Block title="Who moves your things">
        <QA items={ABOUT} />
      </Block>
    </>
  );
}

function AreasPanel() {
  return (
    <>
      <div className="moving-areas">
        {AREAS.map((area) => (
          <Link key={area} href={`/moving/book?area=${encodeURIComponent(area)}`}>
            <MapPin size={14} /> {area}
          </Link>
        ))}
      </div>
      <p className="moving-note">
        Pick an area to start a booking there. The team confirms a truck and crew for your exact addresses and date.
        Intercity or somewhere else? <a href="/contact">Ask us</a>.
      </p>
    </>
  );
}

function CarePanel() {
  return <QA items={CARE} />;
}

function HelpPanel() {
  return (
    <>
      <Block title="Questions and answers">
        <Accordion items={FAQ} />
      </Block>
      <Block title="Moving checklists">
        <div className="moving-tips">
          {TIPS.map((tip) => (
            <div key={tip.slug}>
              <strong>{tip.title}</strong>
              <ol>
                {tip.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Block>
      <Block title="Reviews">
        <div className="moving-reviews">
          <PublicReviews />
        </div>
      </Block>
      <p className="moving-note">
        <Link href="/moving/terms">Moving terms</Link> · <Link href="/moving/privacy">Moving privacy</Link> ·{" "}
        <Link href="/moving/cookies">Cookies</Link> · <a href="/contact">Ask our team</a>
      </p>
    </>
  );
}

type Panel = {
  id: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  sub: string;
  heading: string;
  Body: ComponentType;
  wide?: boolean;
};

export const MOVING_PANELS: Panel[] = [
  { id: "book", icon: Truck, title: "Book a move", sub: "Quote in minutes", heading: "Tell us what’s moving", Body: BookPanel, wide: true },
  { id: "prices", icon: Calculator, title: "Get a price", sub: "No details needed", heading: "A starting price now, a reviewed quote before you pay", Body: PricesPanel, wide: true },
  { id: "track", icon: Search, title: "Track & my moves", sub: "Reference, payments, checklists", heading: "Track a move", Body: TrackPanel, wide: true },
  { id: "crew", icon: Users, title: "Crews & partners", sub: "Drive or move with us", heading: "Crews, truck owners and partners", Body: CrewPanel, wide: true },
  { id: "how", icon: ListChecks, title: "How it works", sub: "Three steps to your door", heading: "How a move works", Body: HowPanel },
  { id: "areas", icon: MapPin, title: "Where we move", sub: "Lagos, Abuja, Port Harcourt", heading: "Where we move", Body: AreasPanel },
  { id: "care", icon: ShieldCheck, title: "Care & cover", sub: "Damage, changes and refunds", heading: "Care and cover", Body: CarePanel },
  { id: "help", icon: CircleHelp, title: "Help & FAQs", sub: "Answers and checklists", heading: "Help before moving day", Body: HelpPanel },
];

/* ── The full-page modal ─────────────────────────────────────────── */

function PanelModal({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const { hash } = useLocation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { Body, icon: Icon } = panel;

  // Deep links such as /moving/track#my-moves scroll inside the panel.
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => {
      bodyRef.current?.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [hash, panel.id]);

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="moving-modal-overlay" />
        <Dialog.Content className="moving-modal" aria-describedby={undefined}>
          <header className="moving-modal-head">
            <div className="moving-modal-title">
              <span className="moving-modal-icon">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div>
                <p>Moving · {panel.title}</p>
                <Dialog.Title>{panel.heading}</Dialog.Title>
              </div>
            </div>
            <Dialog.Close className="moving-modal-close" aria-label="Close">
              <X size={20} />
            </Dialog.Close>
          </header>
          <div className="moving-modal-body" ref={bodyRef}>
            <div className={panel.wide ? "moving-modal-inner moving-modal-wide" : "moving-modal-inner"}>
              <Body />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── /moving and /moving/:panel ──────────────────────────────────── */

export function MovingPage() {
  const { panel: panelId } = useParams();
  const navigate = useNavigate();
  const panel = MOVING_PANELS.find((p) => p.id === panelId) ?? null;

  return (
    <div className="logistics-home moving-page">
      <section className="moving-hero">
        <div className="logistics-container moving-hero-inner">
          <div>
          <HeroFreightArt className="moving-hero-art" />
          <p className="logistics-eyebrow">
            <span /> Moving
          </p>
          <h1>Your move, tracked to the door.</h1>
          <p className="moving-hero-sub">Home and office moves, priced before you book.</p>
          </div>
        </div>
      </section>

      <section className="logistics-container moving-cards-wrap">
        <div className="moving-cards">
          {MOVING_PANELS.map(({ id, icon: Icon, title, sub }) => (
            <Link key={id} href={`/moving/${id}`} className={id === "book" ? "moving-card-tile is-primary" : "moving-card-tile"}>
              <span className="moving-card-icon">
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <strong>{title}</strong>
              <span className="moving-card-sub">{sub}</span>
              <ArrowRight size={16} className="moving-card-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {panel && <PanelModal panel={panel} onClose={() => navigate("/moving")} />}
      <SupportWidget />
    </div>
  );
}
