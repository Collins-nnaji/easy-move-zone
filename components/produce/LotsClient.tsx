"use client";

import Link from "next/link";
import Image from "next/image";
import { useProduceCatalog } from "./CatalogProvider";
import type { ProduceCatalog } from "@/lib/produce/model";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { formatNaira, formatReady } from "@/lib/produce/catalog";
import { ProduceArt } from "./ProduceArt";
import styles from "./CommercePages.module.css";

type Market = "all" | "domestic" | "export";
type Sort = "recommended" | "price-low" | "price-high" | "ready";

function ProduceListing({ lot }: { lot: ProduceCatalog["lots"][number] }) {
  const { commodityById, placeLabel } = useProduceCatalog();
  const commodity = commodityById(lot.commodityId);
  const [quantity, setQuantity] = useState(String(lot.tonnes));
  const weight = Number(quantity);
  const validWeight =
    Number.isFinite(weight) && weight >= 0.1 && weight <= lot.tonnes;
  const enquiry = new URLSearchParams({
    service: "Produce purchase",
    message: `I am interested in ${validWeight ? weight : lot.tonnes} tonnes of ${commodity?.name ?? "produce"} (${lot.id}) from ${placeLabel(lot.originId)}. Please confirm availability, quality and the purchase price, and help arrange delivery.`,
  });

  return (
    <article className={styles.listing}>
      <div className={styles.productArt}>
        {lot.imageUrl || commodity?.imageUrl ? (
          <Image
            src={lot.imageUrl || commodity?.imageUrl || ""}
            alt={commodity?.name ?? "Produce"}
            width={280}
            height={240}
            unoptimized
            className={styles.listingPhoto}
          />
        ) : (
          <ProduceArt crop={lot.commodityId} />
        )}
        <span>
          {commodity?.lane === "export"
            ? "For export"
            : commodity?.lane === "both"
              ? "Domestic & export"
              : "Domestic"}
        </span>
      </div>
      <div className={styles.productInfo}>
        <p className={styles.overline}>{placeLabel(lot.originId)}</p>
        <h3>{commodity?.name}</h3>
        <p className={styles.grade}>{lot.grade}</p>
        <div className={styles.productFacts}>
          <span>
            {lot.tonnes} tonnes
            {lot.sample !== false ? " in sample listing" : " listed"}
          </span>
          <span>Ready {formatReady(lot.ready)}</span>
        </div>
        <p className={styles.price}>
          {formatNaira(lot.pricePerTonne)} <span>/ tonne</span>
        </p>
        <details className={styles.productDetails}>
          <summary>Quantity & listing details</summary>
          <div className={styles.detailBody}>
            <p>
              {lot.seller} · {lot.id}
            </p>
            <label htmlFor={`quantity-${lot.id}`}>
              Quantity to enquire about (tonnes)
            </label>
            <input
              id={`quantity-${lot.id}`}
              type="number"
              min="0.1"
              max={lot.tonnes}
              step="0.1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={!validWeight}
              aria-describedby={`estimate-${lot.id}`}
            />
            <p id={`estimate-${lot.id}`}>
              {validWeight
                ? `${lot.sample !== false ? "Sample produce cost" : "Estimated produce cost"}: ${formatNaira(lot.pricePerTonne * weight)}. Transport is quoted separately.`
                : `Enter a quantity from 0.1 to ${lot.tonnes} tonnes.`}
            </p>
            <Link href={`/book?lot=${lot.id}`} className={styles.quietLink}>
              Already buying this produce? Arrange transport{" "}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </details>
        {validWeight ? (
          <Link
            href={`/contact?${enquiry.toString()}`}
            className={styles.requestLink}
          >
            Enquire about this produce <ArrowUpRight size={17} />
          </Link>
        ) : (
          <button type="button" disabled className={styles.requestLink}>
            Enter a valid quantity to enquire
          </button>
        )}
      </div>
    </article>
  );
}

export function LotsClient() {
  const {
    commodities: COMMODITIES,
    lots: LOTS,
    commodityById,
    placeLabel,
    settings,
  } = useProduceCatalog();
  const [crop, setCrop] = useState("all");
  const [market, setMarket] = useState<Market>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("recommended");
  const lots = useMemo(() => {
    const term = search.trim().toLowerCase();
    const results = LOTS.filter((lot) => {
      const commodity = commodityById(lot.commodityId);
      const matchesCrop = crop === "all" || lot.commodityId === crop;
      const matchesMarket =
        market === "all" ||
        commodity?.lane === market ||
        commodity?.lane === "both";
      const matchesSearch =
        !term ||
        [
          commodity?.name,
          lot.grade,
          lot.seller,
          lot.id,
          placeLabel(lot.originId),
        ].some((value) => value?.toLowerCase().includes(term));
      return matchesCrop && matchesMarket && matchesSearch;
    });
    if (sort === "price-low")
      results.sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    if (sort === "price-high")
      results.sort((a, b) => b.pricePerTonne - a.pricePerTonne);
    if (sort === "ready")
      results.sort((a, b) => a.ready.localeCompare(b.ready));
    return results;
  }, [crop, market, search, sort, LOTS, commodityById, placeLabel]);
  const hasFilters = crop !== "all" || market !== "all" || Boolean(search);
  function resetFilters() {
    setCrop("all");
    setMarket("all");
    setSearch("");
    setSort("recommended");
  }

  return (
    <div className={styles.page}>
      <section className={styles.buyHero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>BUY NIGERIAN PRODUCE</p>
            <h1 style={{ whiteSpace: "pre-line" }}>{settings.buyTitle}</h1>
            <p className={styles.intro}>{settings.buyDescription}</p>
            <div className={styles.actions}>
              <a href="#produce" className="logistics-button">
                Explore produce <ArrowRight size={18} />
              </a>
              <Link
                href="/contact?service=Produce+sourcing"
                className="logistics-text-link"
              >
                Ask us to source it <ArrowUpRight size={17} />
              </Link>
            </div>
            <p className={styles.heroNote}>
              <Check size={15} /> Produce and transport, coordinated by one
              team.
            </p>
          </div>
          <div className={styles.buyVisual}>
            <div className={styles.visualCaption}>
              <span>GROWN IN NIGERIA</span>
              <span>01 / ORIGIN SERIES</span>
            </div>
            {settings.buyImage ? (
              <Image
                src={settings.buyImage}
                alt="Nigerian produce"
                width={560}
                height={480}
                unoptimized
                className={styles.heroProduce}
              />
            ) : (
              <ProduceArt crop="cocoa" className={styles.heroProduce} />
            )}
            <div className={styles.visualFooter}>
              <div>
                <span>FROM THE SOURCE</span>
                <strong>Nigerian cocoa</strong>
              </div>
              <span>Farm → Buyer</span>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.assuranceStrip}>
        <div className={styles.container}>
          {[
            "Clear weights & quality details",
            "Purchase support from our team",
            "Delivery arranged for you",
          ].map((item) => (
            <span key={item}>
              <Check size={15} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section
        className={`${styles.container} ${styles.catalogue}`}
        id="produce"
        aria-labelledby="produce-heading"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>THE PRODUCE COLLECTION</p>
            <h2 id="produce-heading">Find your next supply.</h2>
          </div>
          <p>
            Explore produce listings to plan your purchase. Our team confirms
            stock, quality and pricing before you commit.
          </p>
        </div>
        <div className={styles.filterBar}>
          <label className={styles.search}>
            <Search size={18} />
            <span className={styles.srOnly}>
              Search produce, location or supplier
            </span>
            <input
              type="search"
              placeholder="Search produce or location"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className={styles.filterSelect}>
            <SlidersHorizontal size={16} />
            <span className={styles.srOnly}>Filter by produce</span>
            <select
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
            >
              <option value="all">All produce types</option>
              {COMMODITIES.map((commodity) => (
                <option key={commodity.id} value={commodity.id}>
                  {commodity.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterSelect}>
            <span className={styles.srOnly}>Sort listings</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
            >
              <option value="recommended">Featured first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="ready">Ready date: earliest</option>
            </select>
          </label>
        </div>
        <div className={styles.catalogueMeta}>
          <div className={styles.filterTabs} aria-label="Filter by use">
            {(
              [
                ["all", "All produce"],
                ["domestic", "For local markets"],
                ["export", "For export"],
              ] as const
            ).map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={market === id}
                onClick={() => setMarket(id)}
                className={market === id ? styles.activeFilter : ""}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.resultMeta}>
            <span role="status">
              {lots.length} {lots.length === 1 ? "listing" : "listings"}
            </span>
            {hasFilters && (
              <button type="button" onClick={resetFilters}>
                Clear filters <X size={13} />
              </button>
            )}
          </div>
        </div>
        {lots.length ? (
          <div className={styles.listings}>
            {lots.map((lot) => (
              <ProduceListing key={lot.id} lot={lot} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Search size={30} strokeWidth={1.3} />
            <h3>No produce matches your search.</h3>
            <p>
              Try another crop or location, or ask our team to help source what
              you need.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={resetFilters}
                className="logistics-button"
              >
                Reset filters
              </button>
              <Link
                href="/contact?service=Produce+sourcing"
                className="logistics-text-link"
              >
                Ask our team <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        )}
        <p className={styles.catalogueFootnote}>
          Listed prices are for produce only. Availability, final purchase
          prices and delivery costs are confirmed by our team.
        </p>
      </section>
      <section className={styles.softSection}>
        <div className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>FROM ENQUIRY TO DELIVERY</p>
              <h2>A simpler way to stock up.</h2>
            </div>
            <p>
              We bring the people, produce and transport together. You have one
              team to speak to throughout.
            </p>
          </div>
          <ol className={styles.steps}>
            {[
              [
                "Tell us what you want",
                "Choose a listing or share the produce, quality and quantity your business needs.",
              ],
              [
                "We confirm the details",
                "Our team checks availability and agrees the purchase price and delivery arrangements with you.",
              ],
              [
                "We coordinate the move",
                "Once arrangements are confirmed, we organise collection and transport to your destination.",
              ],
            ].map(([title, body], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${styles.container} ${styles.closing}`}>
        <div>
          <p className={styles.eyebrow}>YOUR NEXT PURCHASE</p>
          <h2>
            Can’t find what
            <br />
            you’re looking for?
          </h2>
        </div>
        <div>
          <p>
            Tell us the produce, quantity and destination. We’ll help you
            explore your options for a one-off purchase or regular supply.
          </p>
          <Link
            href="/contact?service=Produce+sourcing"
            className="logistics-button"
          >
            Talk to our sourcing team <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
