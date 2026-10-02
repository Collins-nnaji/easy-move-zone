"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Ship,
  Trash2,
  Truck,
  X,
  FileText,
  Sprout,
} from "lucide-react";
import type { Collection, ProduceCatalog } from "@/lib/produce/model";
import type { ManagedShipment } from "@/lib/produce/store";
import { STATUS_STEPS } from "@/lib/produce/shipments";
import {
  FIELDS,
  SECTION_NAMES,
  entryTitle,
  type Field,
} from "./produce-fields";
import styles from "./PlatformManager.module.css";

type Section =
  | Collection
  | "overview"
  | "shipments"
  | "enquiries"
  | "media"
  | "settings";
type Media = { id: string; name: string; url: string };
type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  created_at: string;
  page_context?: string;
  management_status: string;
  management_notes: string;
};
const SECTIONS: { id: Section; label: string; icon: typeof Truck }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shipments", label: "Delivery requests", icon: Truck },
  { id: "enquiries", label: "Enquiries", icon: Mail },
  { id: "lots", label: "Produce listings", icon: Package },
  { id: "commodities", label: "Produce types", icon: Sprout },
  { id: "corridors", label: "Delivery routes", icon: MapPin },
  { id: "exportLanes", label: "Export destinations", icon: Ship },
  { id: "exportDocuments", label: "Export documents", icon: FileText },
  { id: "places", label: "Locations", icon: MapPin },
  { id: "media", label: "Pictures", icon: ImagePlus },
  { id: "settings", label: "Page content", icon: Settings },
];
async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch(path, {
    method,
    cache: "no-store",
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "The request could not be completed.");
  return data;
}

function Editor({
  title,
  fields,
  initial,
  catalog,
  media,
  onUpload,
  onSave,
  onClose,
  newRecord = false,
}: {
  title: string;
  fields: Field[];
  initial: Record<string, unknown>;
  catalog: ProduceCatalog;
  media: Media[];
  onUpload: (file: File) => Promise<Media>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  newRecord?: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  function change(key: string, value: unknown) {
    setDraft((old) => ({ ...old, [key]: value }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(key: string, file: File) {
    setBusy(true);
    setError("");
    try {
      const picture = await onUpload(file);
      change(key, picture.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="editor-heading"
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className={styles.editorHeader}>
          <div>
            <p>PLATFORM EDITOR</p>
            <h2 id="editor-heading">{title}</h2>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={22} />
          </button>
        </div>
        <div className={styles.editorFields}>
          {initial.id !== undefined && (
            <label>
              Record ID
              <input
                required
                pattern="[a-zA-Z0-9_-]+"
                maxLength={80}
                readOnly={!newRecord}
                value={String(draft.id ?? "")}
                onChange={(e) => change("id", e.target.value)}
              />
              <small>
                {newRecord
                  ? "Choose a unique ID using letters, numbers or hyphens."
                  : "The ID stays fixed so existing references keep working."}
              </small>
            </label>
          )}
          {fields.map((field) => {
            const value = draft[field.key];
            const choices = field.ref
              ? (field.ref === "commodities"
                  ? catalog.commodities
                  : catalog.places.filter(
                      (p) => field.ref !== "ports" || p.kind === "port",
                    )
                ).map((item) => ({ id: item.id, label: item.name }))
              : field.options?.map((item) => ({
                  id: item,
                  label:
                    STATUS_STEPS.find((step) => step.id === item)?.label ??
                    item.replaceAll("-", " "),
                }));
            if (field.type === "boolean")
              return (
                <label className={styles.checkbox} key={field.key}>
                  <input
                    type="checkbox"
                    checked={value !== false}
                    onChange={(e) => change(field.key, e.target.checked)}
                  />
                  {field.label}
                </label>
              );
            if (field.type === "crops")
              return (
                <fieldset className={styles.cropOptions} key={field.key}>
                  <legend>{field.label}</legend>
                  {catalog.commodities.map((crop) => (
                    <label key={crop.id}>
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(value) && value.includes(crop.id)
                        }
                        onChange={(e) => {
                          const old = Array.isArray(value) ? value : [];
                          change(
                            field.key,
                            e.target.checked
                              ? [...old, crop.id]
                              : old.filter((id) => id !== crop.id),
                          );
                        }}
                      />
                      {crop.name}
                    </label>
                  ))}
                </fieldset>
              );
            if (field.type === "image")
              return (
                <fieldset key={field.key} className={styles.pictureField}>
                  <legend>{field.label}</legend>
                  {typeof value === "string" && value && (
                    <Image
                      src={value}
                      alt="Selected picture preview"
                      width={400}
                      height={220}
                      unoptimized
                    />
                  )}
                  <label>
                    Choose from your pictures
                    <select
                      value={
                        media.some((item) => item.url === value)
                          ? String(value)
                          : ""
                      }
                      onChange={(e) => change(field.key, e.target.value)}
                    >
                      <option value="">No library picture selected</option>
                      {media.map((item) => (
                        <option value={item.url} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Upload a picture
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(field.key, file);
                      }}
                    />
                  </label>
                  <label>
                    Or paste an HTTPS picture URL
                    <input
                      type="text"
                      value={String(value ?? "")}
                      onChange={(e) => change(field.key, e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <small>
                    JPEG, PNG or WebP, up to 3 MB. Leave blank to use the
                    default illustration.
                  </small>
                </fieldset>
              );
            return (
              <label key={field.key}>
                {field.label}
                {choices ? (
                  <select
                    required={!field.optional}
                    value={String(value ?? "")}
                    onChange={(e) => change(field.key, e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {choices.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    required={!field.optional}
                    maxLength={2000}
                    rows={4}
                    value={String(value ?? "")}
                    onChange={(e) => change(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    required={!field.optional}
                    readOnly={field.readonly}
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : "text"
                    }
                    min={field.type === "number" ? 0.1 : undefined}
                    max={
                      field.type === "number" ? (field.max ?? 1e10) : undefined
                    }
                    step={field.type === "number" ? "any" : undefined}
                    maxLength={1000}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      change(
                        field.key,
                        field.type === "number"
                          ? e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />
                )}
              </label>
            );
          })}
          {initial.active !== undefined && (
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) => change("active", e.target.checked)}
              />
              Show on the public website
            </label>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
        <div className={styles.editorFooter}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={styles.secondaryButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className={styles.primaryButton}
          >
            {busy ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <Check size={16} />
            )}
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function PlatformManager() {
  const [section, setSection] = useState<Section>("overview");
  const [catalog, setCatalog] = useState<ProduceCatalog | null>(null);
  const [revision, setRevision] = useState(0);
  const [shipments, setShipments] = useState<ManagedShipment[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{
    title: string;
    fields: Field[];
    data: Record<string, unknown>;
    kind: "catalog" | "shipment" | "enquiry" | "settings";
    collection?: Collection;
    newRecord?: boolean;
  } | null>(null);
  async function reload() {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      api("/api/admin/produce"),
      api("/api/admin/produce/shipments"),
      api("/api/admin/produce/enquiries"),
      api("/api/admin/produce/media"),
    ]);
    const errors: string[] = [];
    results.forEach((r, index) => {
      if (r.status === "rejected") {
        errors.push(
          r.reason instanceof Error ? r.reason.message : "Could not load data.",
        );
        return;
      }
      if (index === 0) {
        setCatalog(r.value.catalog);
        setRevision(r.value.revision);
      }
      if (index === 1) setShipments(r.value.shipments);
      if (index === 2) setEnquiries(r.value.enquiries);
      if (index === 3) setMedia(r.value.media);
    });
    setError([...new Set(errors)].join(" "));
    setLoading(false);
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void reload();
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function choose(id: Section) {
    setSection(id);
    setSearch("");
    setNotice("");
  }
  async function upload(file: File): Promise<Media> {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/produce/media", {
      method: "POST",
      body,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error ?? "Could not upload picture.");
    setMedia((old) => [data, ...old]);
    return data;
  }
  async function save(data: Record<string, unknown>) {
    if (!editor) return;
    if (editor.kind === "catalog" || editor.kind === "settings") {
      const result = await api("/api/admin/produce", "POST", {
        revision,
        collection: editor.collection ?? "settings",
        action: editor.newRecord ? "create" : "update",
        data,
      });
      setCatalog(result.catalog);
      setRevision(result.revision);
    }
    if (editor.kind === "shipment") {
      const result = await api("/api/admin/produce/shipments", "PATCH", data);
      setShipments((old) =>
        old.map((item) =>
          item.reference === result.shipment.reference ? result.shipment : item,
        ),
      );
    }
    if (editor.kind === "enquiry") {
      await api("/api/admin/produce/enquiries", "PATCH", data);
      setEnquiries((old) =>
        old.map((item) =>
          item.id === data.id
            ? {
                ...item,
                management_status: String(data.status),
                management_notes: String(data.notes),
              }
            : item,
        ),
      );
    }
    setEditor(null);
    setNotice("Changes saved successfully.");
  }
  async function remove(collection: Collection, id: string) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/admin/produce", "POST", {
        collection,
        id,
        action: "delete",
        revision,
      });
      setCatalog(result.catalog);
      setRevision(result.revision);
      setNotice("Record deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }
  function editRecord(collection: Collection, entry?: Record<string, unknown>) {
    const data = entry
      ? { ...entry, active: entry.active !== false }
      : {
          id: `${collection.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`,
          active: true,
          ...Object.fromEntries(
            FIELDS[collection].map((field) => [
              field.key,
              field.type === "crops"
                ? []
                : field.type === "boolean"
                  ? true
                  : field.key === "unit"
                    ? "tonne"
                    : "",
            ]),
          ),
        };
    setEditor({
      title: `${entry ? "Edit" : "Add"} ${SECTION_NAMES[collection].toLowerCase()}`,
      fields: FIELDS[collection],
      data,
      kind: "catalog",
      collection,
      newRecord: !entry,
    });
  }
  function editShipment(item: ManagedShipment) {
    setEditor({
      title: `Manage ${item.reference}`,
      kind: "shipment",
      data: {
        reference: item.reference,
        status: item.status,
        internalNotes: item.internalNotes ?? "",
      },
      fields: [
        { key: "reference", label: "Shipment reference", readonly: true },
        {
          key: "status",
          label: "Shipment stage",
          options: STATUS_STEPS.map((s) => s.id),
        },
        {
          key: "internalNotes",
          label: "Internal notes (hidden from customers)",
          type: "textarea",
          optional: true,
        },
      ],
    });
  }
  function editEnquiry(item: Enquiry) {
    setEditor({
      title: `Enquiry from ${item.name}`,
      kind: "enquiry",
      data: {
        id: item.id,
        status: item.management_status,
        notes: item.management_notes,
      },
      fields: [
        {
          key: "status",
          label: "Status",
          options: ["new", "in-progress", "closed"],
        },
        {
          key: "notes",
          label: "Internal notes",
          type: "textarea",
          optional: true,
        },
      ],
    });
  }
  const isCollection = section in SECTION_NAMES;
  const collection = isCollection ? (section as Collection) : null;
  const title =
    SECTIONS.find((item) => item.id === section)?.label ?? "Overview";
  const term = search.trim().toLowerCase();
  const filteredShipments = shipments.filter((item) =>
    [
      item.reference,
      item.contact,
      item.status,
      catalog?.commodities.find((c) => c.id === item.commodityId)?.name,
    ].some((value) => value?.toLowerCase().includes(term)),
  );
  const filteredEnquiries = enquiries.filter((item) =>
    [item.name, item.email, item.message, item.management_status].some(
      (value) => value.toLowerCase().includes(term),
    ),
  );
  const entries =
    catalog && collection
      ? (catalog[collection] as unknown as Record<string, unknown>[]).filter(
          (item) => JSON.stringify(item).toLowerCase().includes(term),
        )
      : [];
  const location = (id: string) =>
    catalog?.places.find((p) => p.id === id)?.name ?? id;

  return (
    <div className={styles.manager}>
      <div className={styles.sidebar}>
        <p>MANAGE YOUR PLATFORM</p>
        {SECTIONS.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => choose(item.id)}
            className={section === item.id ? styles.activeSection : ""}
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}
      </div>
      <main className={styles.workspace}>
        <div className={styles.pageHeader}>
          <div>
            <p>EASYMOVEZONE OPERATIONS</p>
            <h1>{title}</h1>
            <span>
              {section === "overview"
                ? "Your content, customers and deliveries in one place."
                : "Changes are saved centrally and used by the public website."}
            </span>
          </div>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loading}
            onClick={() => void reload()}
          >
            <RefreshCw size={15} className={loading ? styles.spinner : ""} />
            {loading ? "Loading…" : "Refresh data"}
          </button>
        </div>
        <label className={styles.mobileSection}>
          Manage
          <select
            value={section}
            onChange={(e) => choose(e.target.value as Section)}
          >
            {SECTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <div role="alert" className={styles.error}>
            {error}
            <p>Use Refresh data to reload before retrying any changes.</p>
          </div>
        )}
        {notice && (
          <p role="status" className={styles.notice}>
            <Check size={16} />
            {notice}
          </p>
        )}
        {loading && !catalog && (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
            <p>Loading the platform…</p>
          </div>
        )}
        {catalog && section === "overview" && (
          <>
            <div className={styles.metrics}>
              {[
                {
                  label: "Delivery requests",
                  value: shipments.length,
                  id: "shipments",
                },
                {
                  label: "New enquiries",
                  value: enquiries.filter((e) => e.management_status === "new")
                    .length,
                  id: "enquiries",
                },
                {
                  label: "Published listings",
                  value: catalog.lots.filter((l) => l.active !== false).length,
                  id: "lots",
                },
                {
                  label: "Published routes",
                  value: catalog.corridors.filter((l) => l.active !== false)
                    .length,
                  id: "corridors",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => choose(item.id as Section)}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            <section className={styles.overviewPanel}>
              <div>
                <h2>Keep the platform moving.</h2>
                <p>
                  Add produce, update delivery stages or refresh the pictures
                  your customers see.
                </p>
              </div>
              <div className={styles.quickActions}>
                <button
                  onClick={() => {
                    choose("lots");
                    editRecord("lots");
                  }}
                >
                  <Plus size={18} />
                  Add produce listing
                </button>
                <button onClick={() => choose("shipments")}>
                  <Truck size={18} />
                  Manage deliveries
                </button>
                <button onClick={() => choose("settings")}>
                  <Settings size={18} />
                  Edit page content
                </button>
                <button onClick={() => choose("media")}>
                  <ImagePlus size={18} />
                  Manage pictures
                </button>
              </div>
            </section>
            <div className={styles.panelHeading}>
              <h2>Latest delivery requests</h2>
              <button
                className={styles.textButton}
                onClick={() => choose("shipments")}
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>
            {!shipments.length ? (
              <div className={styles.empty}>
                <Truck size={28} />
                <h3>No delivery requests yet.</h3>
                <p>Requests sent through Arrange Delivery will appear here.</p>
                <Link href="/book" className={styles.textButton}>
                  View the delivery page <ArrowUpRight size={15} />
                </Link>
              </div>
            ) : (
              shipments.slice(0, 5).map((item) => (
                <button
                  className={styles.deliveryRow}
                  key={item.reference}
                  onClick={() => editShipment(item)}
                >
                  <div>
                    <strong>{item.reference}</strong>
                    <span>
                      {location(item.originId)} → {location(item.destinationId)}
                    </span>
                  </div>
                  <span className={styles.badge}>
                    {STATUS_STEPS.find((s) => s.id === item.status)?.label}
                  </span>
                  <Pencil size={16} />
                </button>
              ))
            )}
          </>
        )}
        {catalog && collection && (
          <>
            <div className={styles.toolbar}>
              <label>
                <Search size={17} />
                <input
                  type="search"
                  placeholder={`Search ${title.toLowerCase()}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button
                className={styles.primaryButton}
                onClick={() => editRecord(collection)}
              >
                <Plus size={16} />
                Add new
              </button>
            </div>
            <p className={styles.resultCount}>{entries.length} records</p>
            <div className={styles.records}>
              {entries.map((entry) => (
                <article key={String(entry.id)} className={styles.recordRow}>
                  {typeof entry.imageUrl === "string" && entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt=""
                      width={64}
                      height={56}
                      unoptimized
                    />
                  ) : (
                    <span className={styles.recordIcon}>
                      <Package size={20} />
                    </span>
                  )}
                  <div>
                    <h3>{entryTitle(collection, entry, catalog)}</h3>
                    <span>{String(entry.id)}</span>
                  </div>
                  <span className={styles.badge}>
                    {entry.active === false ? "Hidden" : "Published"}
                  </span>
                  <div className={styles.rowActions}>
                    <button
                      aria-label={`Edit ${entryTitle(collection, entry, catalog)}`}
                      onClick={() => editRecord(collection, entry)}
                    >
                      <Pencil size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      disabled={busy}
                      aria-label={`Delete ${entryTitle(collection, entry, catalog)}`}
                      onClick={() => void remove(collection, String(entry.id))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!entries.length && (
              <div className={styles.empty}>
                <Package size={28} />
                <h3>No records found.</h3>
                <p>Add a new record or try another search.</p>
              </div>
            )}
          </>
        )}
        {catalog && section === "shipments" && (
          <>
            <div className={styles.toolbar}>
              <label>
                <Search size={17} />
                <input
                  placeholder="Search reference, customer or status"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <p className={styles.resultCount}>
              {filteredShipments.length} requests
            </p>
            {filteredShipments.map((item) => (
              <article key={item.reference} className={styles.shipmentRecord}>
                <div className={styles.panelHeading}>
                  <div>
                    <h3>{item.reference}</h3>
                    <p>
                      {location(item.originId)} → {location(item.destinationId)}
                    </p>
                  </div>
                  <span className={styles.badge}>
                    {STATUS_STEPS.find((s) => s.id === item.status)?.label}
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Produce / weight</dt>
                    <dd>
                      {catalog.commodities.find(
                        (c) => c.id === item.commodityId,
                      )?.name ?? item.commodityId}{" "}
                      · {item.tonnes} tonnes
                    </dd>
                  </div>
                  <div>
                    <dt>Customer</dt>
                    <dd>{item.contact}</dd>
                  </div>
                  <div>
                    <dt>Ready date</dt>
                    <dd>{item.readyDate}</dd>
                  </div>
                  <div>
                    <dt>Received</dt>
                    <dd>
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </dd>
                  </div>
                  {item.collectionAddress && (
                    <div>
                      <dt>Collection address</dt>
                      <dd>{item.collectionAddress}</dd>
                    </div>
                  )}
                  {item.deliveryAddress && (
                    <div>
                      <dt>Delivery address</dt>
                      <dd>{item.deliveryAddress}</dd>
                    </div>
                  )}
                </dl>
                {item.internalNotes && (
                  <p className={styles.internalNote}>
                    Internal notes: {item.internalNotes}
                  </p>
                )}
                <div className={styles.recordFooter}>
                  <button
                    className={styles.primaryButton}
                    onClick={() => editShipment(item)}
                  >
                    <Pencil size={15} />
                    Update status & notes
                  </button>
                  <Link
                    href={`/track?ref=${item.reference}`}
                    className={styles.textButton}
                  >
                    View customer tracking <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
            {!filteredShipments.length && (
              <div className={styles.empty}>
                <Truck size={28} />
                <h3>No matching delivery requests.</h3>
                <p>Submitted requests will be stored here for your team.</p>
              </div>
            )}
          </>
        )}
        {section === "enquiries" && (
          <>
            <div className={styles.toolbar}>
              <label>
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search customer, message or status"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <p className={styles.resultCount}>
              {filteredEnquiries.length} enquiries
            </p>
            {filteredEnquiries.map((item) => (
              <article className={styles.shipmentRecord} key={item.id}>
                <div className={styles.panelHeading}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </p>
                  </div>
                  <span className={styles.badge}>{item.management_status}</span>
                </div>
                <p className={styles.enquirySubject}>
                  {item.subject ?? item.page_context ?? "Customer enquiry"}
                </p>
                <p className={styles.enquiryMessage}>{item.message}</p>
                {item.management_notes && (
                  <p className={styles.internalNote}>
                    Internal notes: {item.management_notes}
                  </p>
                )}
                <div className={styles.recordFooter}>
                  <button
                    className={styles.primaryButton}
                    onClick={() => editEnquiry(item)}
                  >
                    <Pencil size={15} />
                    Manage enquiry
                  </button>
                  <span>
                    {new Date(item.created_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </article>
            ))}
            {!filteredEnquiries.length && (
              <div className={styles.empty}>
                <Mail size={28} />
                <h3>No matching enquiries.</h3>
                <p>Messages from the contact form will appear here.</p>
              </div>
            )}
          </>
        )}
        {section === "media" && (
          <>
            <div className={styles.uploadPanel}>
              <ImagePlus size={30} />
              <div>
                <h2>Add your own pictures.</h2>
                <p>
                  Upload JPEG, PNG or WebP files up to 3 MB. Assign them to
                  listings, produce types, routes or page headers in the editor.
                </p>
              </div>
              <label
                className={styles.primaryButton}
                tabIndex={0}
                role="button"
                aria-disabled={busy}
                onKeyDown={(event) => {
                  if (!busy && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    event.currentTarget.querySelector("input")?.click();
                  }
                }}
              >
                {busy ? "Uploading…" : "Upload picture"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    setError("");
                    try {
                      await upload(file);
                      setNotice(
                        "Picture uploaded. Choose it in a page or listing editor.",
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Upload failed.",
                      );
                    } finally {
                      setBusy(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
            <div className={styles.mediaGrid}>
              {media.map((item) => (
                <article key={item.id}>
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <h3>{item.name}</h3>
                  <button
                    disabled={busy}
                    className={styles.textButton}
                    onClick={async () => {
                      if (!confirm("Delete this picture?")) return;
                      setBusy(true);
                      setError("");
                      try {
                        await api("/api/admin/produce/media", "DELETE", {
                          id: item.id,
                        });
                        setMedia((old) => old.filter((m) => m.id !== item.id));
                        setNotice("Picture deleted.");
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Delete failed.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    Delete picture
                  </button>
                </article>
              ))}
            </div>
            {!media.length && (
              <div className={styles.empty}>
                <ImagePlus size={28} />
                <h3>Your picture library starts here.</h3>
                <p>
                  Uploaded pictures will be available in the content editors.
                </p>
              </div>
            )}
          </>
        )}
        {catalog && section === "settings" && (
          <div className={styles.settingsList}>
            {["home", "buy", "export", "routes", "track"].map((prefix) => (
              <article className={styles.settingsRow} key={prefix}>
                <div>
                  <p>
                    {prefix === "home"
                      ? "Homepage"
                      : prefix === "buy"
                        ? "Buy produce"
                        : prefix === "export"
                          ? "Export"
                          : prefix === "routes"
                            ? "Routes"
                            : "Track shipment"}
                  </p>
                  <h2 style={{ whiteSpace: "pre-line" }}>
                    {
                      catalog.settings[
                        `${prefix}Title` as keyof typeof catalog.settings
                      ]
                    }
                  </h2>
                  <span>
                    {
                      catalog.settings[
                        `${prefix}Description` as keyof typeof catalog.settings
                      ]
                    }
                  </span>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    const fields: Field[] = [
                      {
                        key: `${prefix}Title`,
                        label: "Main heading (use new lines for line breaks)",
                        type: "textarea",
                      },
                      {
                        key: `${prefix}Description`,
                        label: "Introduction",
                        type: "textarea",
                      },
                      ...(prefix !== "track"
                        ? [
                            {
                              key: `${prefix}Image`,
                              label: "Header picture",
                              type: "image",
                              optional: true,
                            } as Field,
                          ]
                        : []),
                    ];
                    setEditor({
                      title: `Edit ${prefix} page`,
                      fields,
                      data: { ...catalog.settings },
                      kind: "settings",
                    });
                  }}
                >
                  <Pencil size={15} />
                  Edit page
                </button>
              </article>
            ))}
          </div>
        )}
        {editor && catalog && (
          <Editor
            key={`${editor.kind}-${editor.collection ?? ""}-${String(editor.data.id ?? editor.data.reference ?? "settings")}`}
            title={editor.title}
            fields={editor.fields}
            initial={editor.data}
            catalog={catalog}
            media={media}
            onUpload={upload}
            onSave={save}
            onClose={() => setEditor(null)}
            newRecord={editor.newRecord}
          />
        )}
      </main>
    </div>
  );
}
