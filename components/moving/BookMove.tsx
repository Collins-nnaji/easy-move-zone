"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { SERVICES, SIZES, today } from "@/lib/moving/model";
import {
  estimateMove,
  DEFAULT_PRICING,
  CITIES,
  TRUCKS,
  type PricingRules,
  type Account,
} from "@/lib/marketplace/model";
import type { Move } from "@/lib/moving/model";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
export function BookMove() {
  const params = useSearchParams();
  const area = params.get("area");
  const initialService =
    SERVICES.find((s) => s.id === params.get("service"))?.id ?? "home";
  const [service, setService] =
    useState<(typeof SERVICES)[number]["id"]>(initialService);
  const [size, setSize] = useState(SIZES[initialService][0]);
  const [pickupFloor, setPickupFloor] = useState(0);
  const [destinationFloor, setDestinationFloor] = useState(0);
  const [extras, setExtras] = useState<string[]>([]);
  const [city, setCity] = useState<string>(CITIES.find((c) => c === area) ?? "Lagos");
  const [distanceKm, setDistanceKm] = useState(10);
  const [truckSize, setTruckSize] = useState("Auto");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rules, setRules] = useState<PricingRules>(DEFAULT_PRICING);
  const [profile, setProfile] = useState<Account | null>(null);
  const [repeat, setRepeat] = useState<Move | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/marketplace?scope=public")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setRules(d.pricing);
      })
      .catch(() => {});
    fetch("/api/marketplace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d) return;
        setProfile(d.profile);
        const m = d.moves.find(
          (m: Move) => m.reference === params.get("repeat"),
        );
        if (m) {
          setRepeat(m);
          setPickup(m.pickup);
          setDestination(m.destination);
          setCity(m.city ?? "Lagos");
          setDistanceKm(m.distanceKm ?? 10);
          setTruckSize(m.truckSize ?? "Auto");
          setSize(m.size);
          setExtras(m.extras);
          setPickupFloor(m.pickupFloor);
          setDestinationFloor(m.destinationFloor);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [params]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<{
    reference: string;
    estimate: { low: number; high: number };
  } | null>(null);
  const estimate = estimateMove(
    {
      city,
      distanceKm,
      truckSize,
      pickup,
      destination,
      service,
      size,
      pickupFloor,
      destinationFloor,
      extras,
    },
    rules,
  );
  const requestId = useRef<string | null>(null);
  async function selectPhotos(files: FileList | null) {
    setError("");
    setPhotos([]);
    if (!files) return;
    if (
      files.length > 3 ||
      Array.from(files).some(
        (f) =>
          f.size > 2000000 ||
          !["image/jpeg", "image/png", "image/webp"].includes(f.type),
      )
    ) {
      setError("Choose up to 3 JPG, PNG or WebP photos, each under 2 MB.");
      return;
    }
    setPhotoBusy(true);
    try {
      setPhotos(
        await Promise.all(
          Array.from(files).map(
            (f) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = reject;
                reader.readAsDataURL(f);
              }),
          ),
        ),
      );
    } catch {
      setError("Could not read the photos. Please select them again.");
    } finally {
      setPhotoBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          city,
          distanceKm,
          truckSize,
          notifications: fields.notifications === "on",
          service,
          extras,
          photos,
          pickupFloor: Number(fields.pickupFloor),
          destinationFloor: Number(fields.destinationFloor),
          requestId: requestId.current,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBooked({
        reference: data.reference,
        estimate: data.estimate ?? estimate,
      });
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Please check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (booked)
    return (
      <div className={`${shared.page} ${styles.page}`}>
        <section
          className={`${shared.container} ${styles.bookingConfirmation}`}
        >
          <CheckCircle2 size={40} color="#2f5d50" />
          <p className={shared.eyebrow}>YOUR REQUEST IS SAVED</p>
          <h1>
            Request received.
            <br />
            We&apos;ll review your photos.
          </h1>
          <p className={shared.intro}>
            Our team reviews your inventory, route and photos, then confirms a
            quote. Pay the deposit to secure the booking and follow every step
            with your reference.
          </p>
          <div className={styles.confirmationSummary}>
            <p>Estimated range</p>
            <strong>
              {formatMoney(booked.estimate.low)}–
              {formatMoney(booked.estimate.high)}
            </strong>
            <p>Keep your move reference</p>
            <strong style={{ overflowWrap: "anywhere" }}>
              {booked.reference}
            </strong>
          </div>
          <Link
            href={`/track?ref=${booked.reference}`}
            className="logistics-button"
          >
            Track this move <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    );
  return (
    <div className={`${shared.page} ${styles.page}`}>
      <section className={styles.bookingHero}>
        <div className={shared.container}>
          <p className={shared.eyebrow}>YOUR MOVE, MADE EASY</p>
          <h1>
            Tell us what
            <br />
            needs moving.
          </h1>
          <p className={shared.intro}>
            A home, an office or one heavy item. Get an estimated range now; we
            confirm the quote after reviewing your photos and route.
          </p>
        </div>
      </section>
      <div className={`${shared.container} ${styles.bookingLayout}`}>
        <form
          onSubmit={submit}
          onChange={() => {
            requestId.current = null;
          }}
          className={styles.bookingForm}
        >
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>01</span>What are we moving?
            </legend>
            <div className={styles.rolePicker}>
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={service === s.id}
                  className={service === s.id ? styles.selectedRole : ""}
                  onClick={() => {
                    setService(s.id);
                    setSize(SIZES[s.id][0]);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className={styles.bookingFields}>
              <label>
                Move size
                <select
                  name="size"
                  required
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                >
                  {SIZES[service].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Item checklist
                <input
                  defaultValue={repeat?.inventory}
                  name="inventory"
                  required
                  minLength={2}
                  maxLength={2000}
                  placeholder="e.g. sofa, fridge, 2 beds, 15 boxes"
                />
              </label>
              <label>
                Photos (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => void selectPhotos(e.target.files)}
                />
                <small>
                  Up to 3 photos, 2 MB each.{" "}
                  {photoBusy ? "Reading photos…" : `${photos.length} selected.`}
                </small>
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>02</span>Addresses and access
            </legend>
            <p>
              Choose Lagos, Abuja or Port Harcourt. Availability is reviewed for
              your exact addresses and date.
            </p>
            <div className={styles.bookingFields}>
              <label>
                City
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Estimated road distance (km)
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                />
                <small>
                  Within the selected city. Our team checks the route before
                  confirming.
                </small>
              </label>
              <label>
                Vehicle preference
                <select
                  value={truckSize}
                  onChange={(e) => setTruckSize(e.target.value)}
                >
                  {TRUCKS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              {profile?.addresses.length ? (
                <>
                  <label>
                    Saved pickup
                    <select
                      defaultValue=""
                      onChange={(e) => setPickup(e.target.value)}
                    >
                      <option value="">Choose an address</option>
                      {profile.addresses.map((a) => (
                        <option key={a.label + a.address} value={a.address}>
                          {a.label} · {a.address}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Saved destination
                    <select
                      defaultValue=""
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <option value="">Choose an address</option>
                      {profile.addresses.map((a) => (
                        <option key={a.label + a.address} value={a.address}>
                          {a.label} · {a.address}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
              <label>
                Pickup address
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  name="pickup"
                  required
                  maxLength={500}
                  placeholder={
                    area
                      ? `Street address, ${area}, ${city}`
                      : `Street, neighbourhood, ${city}`
                  }
                />
              </label>
              <label>
                Destination address
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  name="destination"
                  required
                  maxLength={500}
                  placeholder={`Street, neighbourhood, ${city}`}
                />
              </label>
              <label>
                Pickup floor
                <input
                  name="pickupFloor"
                  type="number"
                  min={0}
                  max={50}
                  value={pickupFloor}
                  required
                  onChange={(event) =>
                    setPickupFloor(Number(event.target.value))
                  }
                />
                <small>0 = ground floor</small>
              </label>
              <label>
                Destination floor
                <input
                  name="destinationFloor"
                  type="number"
                  min={0}
                  max={50}
                  value={destinationFloor}
                  required
                  onChange={(event) =>
                    setDestinationFloor(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Preferred move date
                <input
                  name="date"
                  type="date"
                  required
                  min={today()}
                  defaultValue={today()}
                />
              </label>
              <label>
                Access instructions
                <input
                  defaultValue={repeat?.access}
                  name="access"
                  maxLength={2000}
                  placeholder="Lift, stairs, parking, estate entry or narrow roads"
                />
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>03</span>A little extra help
            </legend>
            <p>
              The price already includes a vehicle and a loading crew. Add
              packing, cleaning or extra hands only if you need them.
            </p>
            <div className={styles.rolePicker}>
              {(
                [
                  ["Loading crew", "Extra loaders"],
                  ["Packing", "Packing"],
                  ["Unpacking", "Unpacking"],
                  ["Assembly", "Assembly"],
                  ["Cleaning", "Cleaning"],
                  ["Packing materials", "Packing materials"],
                  ["Fumigation", "Fumigation"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={extras.includes(value)}
                  className={extras.includes(value) ? styles.selectedRole : ""}
                  onClick={() =>
                    setExtras((prev) =>
                      prev.includes(value)
                        ? prev.filter((item) => item !== value)
                        : [...prev, value],
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.bookingFieldset}>
            <legend>
              <span>04</span>How to reach you
            </legend>
            <div className={styles.bookingFields}>
              <label>
                Your name
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                Phone / WhatsApp
                <input
                  name="phone"
                  type="tel"
                  required
                  pattern="[+0-9 ()\-]{7,40}"
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+234…"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </label>
            </div>
          </fieldset>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input type="checkbox" name="notifications" /> Send me move status
            updates by WhatsApp and SMS. You can track online without opting in.
          </label>
          <p>
            <Link href="/auth?redirect=/book">Sign in</Link> to save move
            history, addresses and condition records. Submitting agrees to our{" "}
            <Link href="/legal/terms">terms</Link> and{" "}
            <Link href="/damage-policy">damage policy</Link>.
          </p>
          {error && (
            <p role="alert" className={styles.formError}>
              {error}
            </p>
          )}
          <div className={styles.bookingSubmit}>
            <button className="logistics-button" disabled={busy || photoBusy}>
              {busy ? (
                <Loader2 size={18} className={styles.spinner} />
              ) : (
                <ArrowRight size={18} />
              )}
              {busy ? "Sending…" : "Request reviewed quote"}
            </button>
            <p>
              No payment until your quote is reviewed. A deposit secures the
              booking; the balance is due after delivery.
            </p>
          </div>
        </form>
        <aside className={styles.bookingAside}>
          <div className={styles.routePlanner}>
            <p className={shared.overline}>
              CLEAR PRICING. CAREFUL COORDINATION.
            </p>
            <h3>{SERVICES.find((s) => s.id === service)?.name}</h3>
            <p className={styles.plannerNote}>
              Your range includes a vehicle and standard crew, estimated
              distance, floors and selected extras. Our team confirms access,
              inventory and availability.
            </p>
            <div className={styles.routeEstimate}>
              <p>Estimated range</p>
              <strong style={{ fontSize: 28 }}>
                {formatMoney(estimate.low)}–{formatMoney(estimate.high)}
              </strong>
              <span>
                Reviewed quote before payment · {rules.depositPercent}% deposit
              </span>
            </div>
            <p className={styles.plannerNote}>
              Keep an item checklist and photos before collection. Report any
              missing or damaged items through support with your move reference.
            </p>
          </div>
          <div className={styles.bookingHelp}>
            <h3>Need help planning?</h3>
            <p>
              Share your questions and we’ll help you work out the next step.
            </p>
            <Link href="/contact" className="logistics-text-link">
              Talk to our team <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
