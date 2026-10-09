"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Review } from "@/lib/marketplace/model";
import s from "./Marketplace.module.css";
export function PublicReviews() {
  const [reviews, setReviews] = useState<Review[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/marketplace?scope=public")
      .then(async (r) => {
        if (!r.ok) throw new Error("Reviews are temporarily unavailable.");
        return r.json();
      })
      .then((d) => setReviews(d.reviews))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      {loading ? (
        <p>Loading reviews…</p>
      ) : error ? (
        <p role="alert" className={s.error}>
          {error}
        </p>
      ) : reviews.length ? (
        <div className={s.grid}>
          {reviews.map((r, i) => (
            <article className={s.card} key={i}>
              <p aria-label={`${r.rating} out of 5 stars`}>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>
              <h3>
                {r.name} · {r.city}
              </h3>
              <p>{r.text}</p>
              <span className={s.pill}>Completed move</span>
              <p className={s.muted}>
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <h2>Every review starts with a real move.</h2>
          <p>
            Published customer reviews will appear here after completed
            bookings. We haven’t added sample testimonials.
          </p>
        </div>
      )}
      <Link href="/profile" className={s.link}>
        Review a completed move in your account
      </Link>
    </>
  );
}
