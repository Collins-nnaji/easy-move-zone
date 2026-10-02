"use client";
import { useEffect, useState } from "react";
import shared from "@/components/produce/CommercePages.module.css";
import styles from "@/components/produce/JourneyPages.module.css";
type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  page_context: string;
  created_at: string;
  management_status: string;
  management_notes: string;
};
function Editor({ enquiry }: { enquiry: Enquiry }) {
  const [status, setStatus] = useState(enquiry.management_status);
  const [notes, setNotes] = useState(enquiry.management_notes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <article className={styles.shipmentOverview} style={{ marginBlock: 24 }}>
      <div className={styles.shipmentTop}>
        <div>
          <p className={shared.eyebrow}>
            {enquiry.subject || "Customer enquiry"}
          </p>
          <h2>{enquiry.name}</h2>
          <p>
            {enquiry.email} · {enquiry.phone}
          </p>
        </div>
      </div>
      <div className={styles.shipmentBody}>
        <div>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {enquiry.message}
          </p>
          <p className={styles.smallNote}>{enquiry.page_context}</p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              const r = await fetch("/api/admin/enquiries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: enquiry.id, status, notes }),
              });
              const d = await r.json();
              if (!r.ok) throw new Error(d.error);
              setMessage("Enquiry saved.");
            } catch (e) {
              setMessage(
                e instanceof Error ? e.message : "Could not save enquiry.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className={styles.bookingFields}>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>
              Internal notes
              <input
                value={notes}
                maxLength={5000}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
          <button
            className="logistics-button"
            style={{ marginTop: 20 }}
            disabled={busy}
          >
            {busy ? "Saving…" : "Save enquiry"}
          </button>
          <p role="status">{message}</p>
        </form>
      </div>
    </article>
  );
}
export function EnquiryManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/enquiries", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setEnquiries(d.enquiries);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, []);
  return (
    <div className={`${shared.page} ${styles.page}`}>
      <div className={`${shared.container} logistics-section`}>
        <p className={shared.eyebrow}>CUSTOMER SUPPORT AND PARTNERSHIPS</p>
        <h1>
          Conversations
          <br />
          that move things.
        </h1>
        <p className={shared.intro}>
          Review moving questions, partner enquiries and damage reports. Keep
          your team’s follow-up notes here.
        </p>
        {busy && <p>Loading enquiries…</p>}
        {error && (
          <p role="alert" className={styles.formError}>
            {error}
          </p>
        )}
        {!busy && !error && !enquiries.length && <p>No enquiries yet.</p>}
        {enquiries.map((e) => (
          <Editor key={e.id} enquiry={e} />
        ))}
      </div>
    </div>
  );
}
