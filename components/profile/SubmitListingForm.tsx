"use client"

import { useRef, useState } from "react"
import { Upload, Video, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react"

type ListingType = "buy" | "commercial"

interface SubmitListingFormProps {
  cityOptions: Array<{ slug: string; name: string }>
}

interface FormState {
  title: string
  citySlug: string
  country: string
  neighborhood: string
  type: ListingType
  priceUsd: string
  bedrooms: string
  bathrooms: string
  areaSqm: string
  moveInReady: boolean
  schoolsNearby: string
  commuteMinutes: string
  description: string
}

const emptyForm: FormState = {
  title: "",
  citySlug: "",
  country: "",
  neighborhood: "",
  type: "buy",
  priceUsd: "",
  bedrooms: "",
  bathrooms: "",
  areaSqm: "",
  moveInReady: false,
  schoolsNearby: "",
  commuteMinutes: "",
  description: "",
}

interface UploadedMedia {
  url: string
  key: string
  name: string
}

interface MyListing {
  id: string
  title: string
  city_slug: string
  type: string
  price_usd: number
  submission_status: string
  submitted_at: string
  video_url: string | null
  reviewer_notes: string | null
}

function statusBadge(status: string) {
  if (status === "approved") return { label: "Approved", cls: "bg-green-100 text-green-700" }
  if (status === "rejected") return { label: "Rejected", cls: "bg-red-100 text-red-700" }
  if (status === "draft") return { label: "Draft", cls: "bg-gray-100 text-gray-600" }
  return { label: "Pending Review", cls: "bg-yellow-100 text-yellow-700" }
}

export function SubmitListingForm({ cityOptions }: SubmitListingFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [images, setImages] = useState<UploadedMedia[]>([])
  const [video, setVideo] = useState<UploadedMedia | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [myListings, setMyListings] = useState<MyListing[] | null>(null)
  const [loadingListings, setLoadingListings] = useState(false)
  const [tab, setTab] = useState<"submit" | "my_listings">("submit")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Temporary ID used for organizing files in storage before the listing is saved
  const [draftId] = useState(() => crypto.randomUUID())

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadImages(files: FileList) {
    setUploadingImages(true)
    const uploaded: UploadedMedia[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "image")
      fd.append("listingId", draftId)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { url?: string; key?: string; error?: string }
      if (res.ok && data.url && data.key) {
        uploaded.push({ url: data.url, key: data.key, name: file.name })
      } else {
        setSubmitStatus({ type: "error", message: data.error ?? "Image upload failed." })
      }
    }
    setImages((prev) => [...prev, ...uploaded])
    setUploadingImages(false)
  }

  async function uploadVideo(file: File) {
    setUploadingVideo(true)
    setVideo(null)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("type", "video")
    fd.append("listingId", draftId)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = (await res.json()) as { url?: string; key?: string; error?: string }
    if (res.ok && data.url && data.key) {
      setVideo({ url: data.url, key: data.key, name: file.name })
      setSubmitStatus(null)
    } else {
      setSubmitStatus({ type: "error", message: data.error ?? "Video upload failed." })
    }
    setUploadingVideo(false)
  }

  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img.key !== key))
  }

  async function handleSubmit() {
    if (!video) {
      setSubmitStatus({ type: "error", message: "You must upload a property video before submitting." })
      return
    }
    if (!form.title.trim() || !form.citySlug || !form.country.trim() || !form.neighborhood.trim() || !form.priceUsd) {
      setSubmitStatus({ type: "error", message: "Please fill in all required fields." })
      return
    }
    if (!form.description.trim() || form.description.trim().length < 40) {
      setSubmitStatus({ type: "error", message: "Description must be at least 40 characters." })
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        citySlug: form.citySlug,
        country: form.country,
        neighborhood: form.neighborhood,
        type: form.type,
        priceUsd: Number(form.priceUsd),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        areaSqm: Number(form.areaSqm || 0),
        moveInReady: form.moveInReady,
        schoolsNearby: Number(form.schoolsNearby || 0),
        commuteMinutes: Number(form.commuteMinutes || 0),
        description: form.description,
        images: images.map((img) => img.url),
        videoUrl: video.url,
      }),
    })

    const data = (await res.json()) as { id?: string; message?: string; error?: string }
    if (res.ok) {
      setSubmitStatus({ type: "success", message: data.message ?? "Listing submitted! We will review it shortly." })
      setForm(emptyForm)
      setImages([])
      setVideo(null)
      // Refresh my listings if visible
      if (tab === "my_listings") void loadMyListings()
    } else {
      setSubmitStatus({ type: "error", message: data.error ?? "Submission failed." })
    }
    setSubmitting(false)
  }

  async function loadMyListings() {
    setLoadingListings(true)
    const res = await fetch("/api/listings")
    const data = (await res.json()) as { listings?: MyListing[] }
    setMyListings(data.listings ?? [])
    setLoadingListings(false)
  }

  function switchTab(t: "submit" | "my_listings") {
    setTab(t)
    if (t === "my_listings" && myListings === null) {
      void loadMyListings()
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="inline-flex rounded-full border border-[#c8d8f0] bg-[#eef4ff] p-1">
        <button
          type="button"
          onClick={() => switchTab("submit")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "submit" ? "bg-[#155eef] text-white" : "text-[#64748b]"}`}
        >
          Submit new listing
        </button>
        <button
          type="button"
          onClick={() => switchTab("my_listings")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "my_listings" ? "bg-[#155eef] text-white" : "text-[#64748b]"}`}
        >
          My listings
        </button>
      </div>

      {tab === "my_listings" ? (
        <section className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">My submitted listings</h2>
          {loadingListings ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[#64748b]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : !myListings || myListings.length === 0 ? (
            <p className="mt-4 text-sm text-[#64748b]">You have not submitted any listings yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myListings.map((listing) => {
                const badge = statusBadge(listing.submission_status)
                return (
                  <li key={listing.id} className="rounded-xl border border-[#dbe4f0] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#0f172a]">{listing.title}</p>
                        <p className="mt-0.5 text-xs text-[#64748b]">
                          {listing.city_slug} · {listing.type} · ${Number(listing.price_usd).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">
                          Submitted {new Date(listing.submitted_at).toLocaleDateString()}
                        </p>
                        {listing.reviewer_notes ? (
                          <p className="mt-1 text-xs text-[#b45309]">Note: {listing.reviewer_notes}</p>
                        ) : null}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : (
        <>
          {/* Basic info */}
          <section className="emz-gloss-card rounded-2xl p-6">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Property details</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-[#475569] md:col-span-2">
                Listing title <span className="text-red-500">*</span>
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Spacious 3-bed apartment in Lekki Phase 1"
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                City <span className="text-red-500">*</span>
                <select
                  value={form.citySlug}
                  onChange={(e) => update("citySlug", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select city</option>
                  {cityOptions.map((city) => (
                    <option key={city.slug} value={city.slug}>{city.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-[#475569]">
                Country <span className="text-red-500">*</span>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="e.g. Nigeria"
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Neighborhood <span className="text-red-500">*</span>
                <input
                  value={form.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}
                  placeholder="e.g. Lekki Phase 1"
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Listing type <span className="text-red-500">*</span>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value as ListingType)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                >
                  <option value="buy">Buy (residential)</option>
                  <option value="commercial">Commercial</option>
                </select>
              </label>
              <label className="text-sm text-[#475569]">
                Price (USD) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  value={form.priceUsd}
                  onChange={(e) => update("priceUsd", e.target.value)}
                  placeholder="e.g. 150000"
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          </section>

          {/* Property specs */}
          <section className="emz-gloss-card rounded-2xl p-6">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Specifications</h2>
            <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
              <label className="text-sm text-[#475569]">
                Bedrooms
                <input
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(e) => update("bedrooms", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Bathrooms
                <input
                  type="number"
                  min={0}
                  value={form.bathrooms}
                  onChange={(e) => update("bathrooms", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Area (sqm)
                <input
                  type="number"
                  min={0}
                  value={form.areaSqm}
                  onChange={(e) => update("areaSqm", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Schools nearby
                <input
                  type="number"
                  min={0}
                  value={form.schoolsNearby}
                  onChange={(e) => update("schoolsNearby", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Commute to CBD (mins)
                <input
                  type="number"
                  min={0}
                  value={form.commuteMinutes}
                  onChange={(e) => update("commuteMinutes", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-[#475569]">
                  <input
                    type="checkbox"
                    checked={form.moveInReady}
                    onChange={(e) => update("moveInReady", e.target.checked)}
                    className="accent-[#155eef]"
                  />
                  Ready to close
                </label>
              </div>
            </div>
            <label className="mt-3 block text-sm text-[#475569]">
              Description <span className="text-red-500">*</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the property, its features, nearby amenities, title type, etc. (min 40 characters)"
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              />
              <span className="text-xs text-[#94a3b8]">{form.description.length} chars</span>
            </label>
          </section>

          {/* Image upload */}
          <section className="emz-gloss-card rounded-2xl p-6">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Property photos</h2>
            <p className="mt-1 text-sm text-[#64748b]">Upload up to 10 photos. JPEG, PNG, WebP or AVIF. Max 10 MB each.</p>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void uploadImages(e.target.files)
                  e.target.value = ""
                }
              }}
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImages || images.length >= 10}
              className="mt-3 flex items-center gap-2 rounded-xl border-2 border-dashed border-[#c8d8f0] bg-[#f8fbff] px-5 py-4 text-sm font-semibold text-[#155eef] transition hover:border-[#155eef] disabled:opacity-50"
            >
              {uploadingImages ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><ImageIcon className="h-4 w-4" /> Choose photos</>
              )}
            </button>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img) => (
                  <div key={img.key} className="group relative overflow-hidden rounded-xl border border-[#dbe4f0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.key)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Video upload — mandatory */}
          <section className="emz-gloss-card rounded-2xl p-6 ring-2 ring-[#155eef]/30">
            <div className="flex items-center gap-2">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Property video</h2>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">Required</span>
            </div>
            <p className="mt-1 text-sm text-[#64748b]">
              A walkthrough video is <strong>mandatory</strong> before you can submit. MP4, WebM or MOV. Max 500 MB.
            </p>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  void uploadVideo(file)
                  e.target.value = ""
                }
              }}
            />

            {!video ? (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#155eef]/40 bg-[#eef4ff] px-5 py-6 text-sm font-semibold text-[#155eef] transition hover:border-[#155eef] disabled:opacity-50"
              >
                {uploadingVideo ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Uploading video...</>
                ) : (
                  <><Video className="h-5 w-5" /> Upload walkthrough video</>
                )}
              </button>
            ) : (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#dbe4f0] bg-white">
                <video src={video.url} controls className="w-full max-h-64 object-contain bg-black" />
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{video.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="rounded-lg border border-[#dbe4f0] px-3 py-1 text-xs font-semibold text-[#475569] transition hover:bg-[#f3f7fd]"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            {!video && !uploadingVideo && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                You cannot submit without a video
              </p>
            )}
          </section>

          {/* Status message */}
          {submitStatus && (
            <div
              className={`flex items-start gap-2 rounded-xl p-4 text-sm ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              {submitStatus.message}
            </div>
          )}

          {/* Submit button */}
          <section className="emz-gloss-card rounded-2xl p-5">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || uploadingImages || uploadingVideo || !video}
              className="emz-pill-cta flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="h-4 w-4" /> Submit listing for review</>
              )}
            </button>
            {!video && (
              <p className="mt-2 text-xs text-[#94a3b8]">Upload a property video above to enable submission.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
