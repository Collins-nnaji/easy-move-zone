"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { SERVICES, today } from "@/lib/moving/model";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
export function BookMove() {
  const params = useSearchParams();
  const area = params.get("area");
  const [service, setService] = useState(
    SERVICES.find((s) => s.id === params.get("service"))?.id ?? "home",
  );
  const [extras, setExtras] = useState<string[]>(["Loading crew"]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
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
      setReference(data.reference);
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
  if (reference)
    return (
      <div className={`${shared.page} ${styles.page}`}>
        <section
          className={`${shared.container} ${styles.bookingConfirmation}`}
        >
          <CheckCircle2 size={40} color="#2f5d50" />
          <p className={shared.eyebrow}>YOUR MOVE REQUEST IS RECEIVED</p>
          <h1>
            Your move.
            <br />
            One step closer.
          </h1>
          <p className={shared.intro}>
            Our team will review your inventory, access and requested date, then
            contact you with a quote. Your move is booked once you agree the
            price and arrangements.
          </p>
          <div className={styles.confirmationSummary}>
            <p>Keep your move reference</p>
            <strong style={{ overflowWrap: "anywhere" }}>{reference}</strong>
          </div>
          <Link href={`/track?ref=${reference}`} className="logistics-button">
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
            A home, an office or one heavy item. Share the details for a quote
            that accounts for the truck, crew, stairs and access.
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
                  onClick={() => setService(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className={styles.bookingFields}>
              <label>
                Move size
                <select name="size" key={service} required>
                  {(service === "home"
                    ? [
                        "Studio / one bedroom",
                        "Two bedrooms",
                        "Three or more bedrooms",
                      ]
                    : service === "office"
                      ? ["Small office", "Large office"]
                      : ["Single bulky item", "Several items"]
                  ).map((size) => (
                    <option key={size}>{size}</option>
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
              We’re starting in Lagos. Availability in your area is confirmed
              with your quote.
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
                  defaultValue={0}
                  required
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
                  defaultValue={0}
                  required
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
              Choose what you need. Each service is included separately in your
              quote.
            </p>
            <div className={styles.rolePicker}>
              {[
                "Loading crew",
                "Packing",
                "Unpacking",
                "Assembly",
                "Cleaning",
              ].map((x) => (
                <button
                  key={x}
                  type="button"
                  aria-pressed={extras.includes(x)}
                  className={extras.includes(x) ? styles.selectedRole : ""}
                  onClick={() =>
                    setExtras((prev) =>
                      prev.includes(x)
                        ? prev.filter((y) => y !== x)
                        : [...prev, x],
                    )
                  }
                >
                  {x}
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
              {busy ? "Sending request…" : "Request my quote"}
            </button>
            <p>
              No payment now. Your team confirms price, availability and the
              moving plan before you book.
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
              Your quote accounts for distance, truck size, loading help, stairs
              and access restrictions. Packing, assembly and cleaning are
              optional.
            </p>
            <div className={styles.routeEstimate}>
              <p>Your price</p>
              <strong>Confirmed by our team</strong>
              <span>We review the details before quoting.</span>
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
