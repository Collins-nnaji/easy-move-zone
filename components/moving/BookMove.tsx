"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { instantQuote, SERVICES, SIZES, today } from "@/lib/moving/model";
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<{ reference: string; quote: number } | null>(
    null,
  );
  const quote = instantQuote({
    service,
    size,
    pickupFloor,
    destinationFloor,
    extras,
  });
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
        quote: typeof data.quote === "number" ? data.quote : quote,
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
          <p className={shared.eyebrow}>YOUR MOVE IS BOOKED</p>
          <h1>
            You&apos;re booked.
            <br />
            We&apos;ll assign the crew.
          </h1>
          <p className={shared.intro}>
            Your price is confirmed. Our team assigns movers and a vehicle, and
            you can follow every step with your reference.
          </p>
          <div className={styles.confirmationSummary}>
            <p>Confirmed price</p>
            <strong>{formatMoney(booked.quote)}</strong>
            <p>Keep your move reference</p>
            <strong style={{ overflowWrap: "anywhere" }}>{booked.reference}</strong>
          </div>
          <Link href={`/track?ref=${booked.reference}`} className="logistics-button">
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
            A home, an office or one heavy item. Your Lagos price is confirmed
            as you fill this in, and the move is booked when you submit.
          </p>
        </div>
      </section>
      <div className={`${shared.container} ${styles.bookingLayout}`}>
        <form onSubmit={submit} className={styles.bookingForm}>
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
              We’re starting in Lagos. The price updates with stairs and the
              help you add.
            </p>
            <div className={styles.bookingFields}>
              <label>
                Pickup address
                <input
                  name="pickup"
                  required
                  maxLength={500}
                  placeholder={
                    area
                      ? `Street address, ${area}, Lagos`
                      : "Street, neighbourhood, Lagos"
                  }
                />
              </label>
              <label>
                Destination address
                <input
                  name="destination"
                  required
                  maxLength={500}
                  placeholder="Street, neighbourhood, Lagos"
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
                  onChange={(event) => setPickupFloor(Number(event.target.value))}
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
              {busy ? "Booking…" : "Book this move"}
            </button>
            <p>
              No payment now. Your price is confirmed instantly. We assign
              movers and a vehicle after you book.
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
              This is a local Lagos price for the vehicle, fuel and crew that
              fit this move. Stairs and extras are added. A long trip, such as
              mainland to the Island, can be adjusted by our team.
            </p>
            <div className={styles.routeEstimate}>
              <p>Your price</p>
              <strong>{formatMoney(quote)}</strong>
              <span>Confirmed when you book.</span>
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
