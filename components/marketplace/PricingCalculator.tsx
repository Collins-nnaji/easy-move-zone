"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SERVICES, SIZES } from "@/lib/moving/model";
import {
  CITIES,
  TRUCKS,
  DEFAULT_PRICING,
  estimateMove,
} from "@/lib/marketplace/model";
import { formatMoney } from "@/lib/money";
import s from "./Marketplace.module.css";
export function PricingCalculator() {
  const [rules, setRules] = useState(DEFAULT_PRICING),
    [service, setService] = useState<"home" | "office" | "item">("home"),
    [size, setSize] = useState<string>(SIZES.home[0]),
    [city, setCity] = useState("Lagos"),
    [distance, setDistance] = useState(10),
    [floor, setFloor] = useState(0),
    [truck, setTruck] = useState("Auto"),
    [packing, setPacking] = useState(false);
  useEffect(() => {
    fetch("/api/marketplace?scope=public")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setRules(d.pricing);
      })
      .catch(() => {});
  }, []);
  const estimate = estimateMove(
    {
      service,
      size,
      city,
      distanceKm: distance,
      truckSize: truck,
      pickupFloor: floor,
      destinationFloor: 0,
      extras: packing ? ["Packing"] : [],
    },
    rules,
  );
  return (
    <div className={s.grid}>
      <div className={`${s.card} ${s.form}`}>
        <label>
          Move type
          <select
            value={service}
            onChange={(e) => {
              const v = e.target.value as typeof service;
              setService(v);
              setSize(SIZES[v][0]);
            }}
          >
            {SERVICES.map((x) => (
              <option value={x.id} key={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Size
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES[service].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          City
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Road distance (km)
          <input
            type="number"
            min={1}
            max={500}
            value={distance}
            onChange={(e) =>
              setDistance(Math.min(500, Math.max(1, Number(e.target.value))))
            }
          />
        </label>
        <label>
          Total floors at both addresses
          <input
            type="number"
            min={0}
            max={100}
            value={floor}
            onChange={(e) =>
              setFloor(Math.min(100, Math.max(0, Number(e.target.value))))
            }
          />
        </label>
        <label>
          Vehicle preference
          <select value={truck} onChange={(e) => setTruck(e.target.value)}>
            {TRUCKS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              checked={packing}
              onChange={(e) => setPacking(e.target.checked)}
            />{" "}
            Include packing
          </span>
        </label>
      </div>
      <div className={s.card} aria-live="polite">
        <p className={s.eyebrow}>YOUR ESTIMATED RANGE</p>
        <strong className={s.metric}>
          {formatMoney(estimate.low)}–{formatMoney(estimate.high)}
        </strong>
        <p>
          Vehicle, fuel and standard crew included. Inventory photos, road
          access and availability determine your reviewed quote.
        </p>
        <p>
          Pay {rules.depositPercent}% after the quote is confirmed. Pay the
          remaining balance after delivery.
        </p>
        <Link href={`/book?service=${service}`} className="logistics-button">
          Plan this move
        </Link>
        <p className={s.muted}>
          These are configurable starting rates, not a guarantee of availability
          or a market price comparison.
        </p>
      </div>
    </div>
  );
}
