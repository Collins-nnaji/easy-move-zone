"use client"

import { useMemo, useState } from "react"

type PlatformPage = "home" | "services" | "intelligence" | "markets" | "about" | "design" | "contact"

const NAV_ITEMS: Array<{ id: PlatformPage; label: string }> = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "intelligence", label: "Intelligence" },
  { id: "markets", label: "Markets" },
  { id: "about", label: "About" },
  { id: "design", label: "Design Guide" },
]

export default function HomePage() {
  const [activePage, setActivePage] = useState<PlatformPage>("home")

  const showPage = (id: PlatformPage) => {
    setActivePage(id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <div className="platform">
      <nav className="nav">
        <button className="nav-logo" onClick={() => showPage("home")}>
          Easy<span>Move</span>Zone
        </button>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => showPage(item.id)}
                className={activePage === item.id ? "active" : ""}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => showPage("contact")}
              className={activePage === "contact" ? "nav-cta active" : "nav-cta"}
            >
              Get Started
            </button>
          </li>
          <li>
            <a href="/auth">Portal</a>
          </li>
        </ul>
      </nav>

      <div className={`page ${activePage === "home" ? "active" : ""}`}>
        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span>Trade Bridge · Africa & World</span>
            </div>
            <h1>
              Your market
              <br />
              move, <em>guided.</em>
            </h1>
            <p className="hero-sub">
              EasyMoveZone connects businesses to African markets — and African businesses to the world.
              Market intelligence, ground-level execution, and ongoing advisory in one trusted partner.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => showPage("contact")}>Start Your Move</button>
              <button className="btn-secondary" onClick={() => showPage("services")}>Explore Services</button>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><div className="stat-num">12+</div><div className="stat-label">Active Markets</div></div>
              <div className="stat-item"><div className="stat-num">2</div><div className="stat-label">Directions</div></div>
              <div className="stat-item"><div className="stat-num">1</div><div className="stat-label">Trusted Partner</div></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-map-bg" />
            <div className="hero-visual">
              {[
                ["🇬🇧 London", "🇳🇬 Lagos", "Inbound", "Market Entry · Regulatory · Partnership Setup"],
                ["🇳🇬 Lagos", "🇦🇪 Dubai", "Outbound", "Export Readiness · Distribution · Brand Localization"],
                ["🇺🇸 New York", "🇰🇪 Nairobi", "Inbound", "Intelligence Report · Ground Truth · Launch"],
                ["🇬🇭 Accra", "🇬🇧 London", "Outbound", "Retail Entry · Compliance · Market Visibility"],
              ].map(([from, to, type, meta]) => (
                <div className="corridor-card" key={`${from}-${to}`}>
                  <div className="corridor-header">
                    <div className="corridor-route">{from} <span className="corridor-arrow">→</span> {to}</div>
                    <span className={`corridor-badge ${type === "Outbound" ? "outbound" : ""}`}>{type}</span>
                  </div>
                  <div className="corridor-meta">{meta}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Two directions.<br /><em>One platform.</em></h2>
          <p className="section-sub">
            Whether you&apos;re coming into Africa or taking Africa to the world, EasyMoveZone runs the same
            trusted process in both directions.
          </p>

          <div className="how-grid">
            <div className="how-panel">
              <div className="how-panel-tag tag-inbound">Inbound — World → Africa</div>
              <h3>Entering African Markets</h3>
              <p>For foreign companies moving into Nigeria, Ghana, Kenya, and beyond.</p>
              <ul className="steps-list">
                <li className="step-item"><span className="step-num light">1</span><div><h4>Territory Intelligence</h4><p>Consumer behavior, regulation, competition, risk.</p></div></li>
                <li className="step-item"><span className="step-num light">2</span><div><h4>Ground Truth</h4><p>Vetted introductions to partners, distributors, and buyers.</p></div></li>
                <li className="step-item"><span className="step-num light">3</span><div><h4>Setup & Launch</h4><p>Legal entity, banking, office, and first hires coordinated.</p></div></li>
                <li className="step-item"><span className="step-num light">4</span><div><h4>Ongoing Intelligence</h4><p>Monthly updates and regulatory alerts as you scale.</p></div></li>
              </ul>
            </div>
            <div className="how-panel dark">
              <div className="how-panel-tag tag-outbound">Outbound — Africa → World</div>
              <h3>Taking Africa Global</h3>
              <p>For African SMEs ready to expand into international markets with precision.</p>
              <ul className="steps-list">
                <li className="step-item"><span className="step-num dark-num">1</span><div><h4>Export Readiness</h4><p>Product fit, compliance gaps, and positioning review.</p></div></li>
                <li className="step-item"><span className="step-num dark-num">2</span><div><h4>Market Selection</h4><p>Which market to enter first, why, and when.</p></div></li>
                <li className="step-item"><span className="step-num dark-num">3</span><div><h4>Entry Execution</h4><p>Distribution, localization, compliance, and visibility.</p></div></li>
                <li className="step-item"><span className="step-num dark-num">4</span><div><h4>Growth Retainer</h4><p>Monthly support and partnership expansion support.</p></div></li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <div className={`page ${activePage === "services" ? "active" : ""}`}>
        <section className="section section-tight">
          <div className="section-tag">What We Offer</div>
          <h2 className="section-title">Every service built for<br /><em>one purpose.</em></h2>
          <p className="section-sub">To remove every obstacle between you and your next market.</p>

          <div className="services-grid">
            {[
              ["🗺️", "Market Intelligence Reports", "Deep market research tailored to your target territory.", "From $2,000 · One-time"],
              ["🤝", "Ground Truth Introductions", "Vetted introductions to partners, buyers, and distributors.", "Commission on closed deals"],
              ["🚀", "Full Market Entry Package", "End-to-end execution from intelligence through launch.", "From $15,000 · Project-based"],
              ["📡", "Monthly Intelligence Retainer", "Regulatory updates and opportunity alerts monthly.", "From $1,500/month"],
              ["🌍", "Export Readiness Assessment", "A rigorous check of global expansion readiness.", "From $1,200 · One-time"],
              ["📈", "Global Expansion Co-Pilot", "Hands-on support for African SMEs going global.", "Retainer + success fees"],
            ].map(([icon, title, text, price]) => (
              <article className="service-card" key={title}>
                <span className="service-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="service-price">{price}</div>
              </article>
            ))}
          </div>

          <div className="section-tag">Pricing</div>
          <h2 className="section-title">Straightforward.<br /><em>No surprises.</em></h2>
          <p className="section-sub">Three tiers built for different stages of your move.</p>

          <div className="pricing-grid">
            <article className="pricing-card standard">
              <div className="pricing-badge badge-standard">Explorer</div>
              <div className="pricing-name">Intelligence</div>
              <div className="pricing-amount">$2K</div>
              <div className="pricing-period">per market report</div>
              <button className="btn-pricing btn-pricing-standard" onClick={() => showPage("contact")}>Order a Report</button>
            </article>
            <article className="pricing-card featured">
              <div className="pricing-badge badge-featured">Most Popular</div>
              <div className="pricing-name">Trade Bridge</div>
              <div className="pricing-amount">$2.5K</div>
              <div className="pricing-period">per month · 3-month minimum</div>
              <button className="btn-pricing btn-pricing-featured" onClick={() => showPage("contact")}>Start Bridge Retainer</button>
            </article>
            <article className="pricing-card enterprise">
              <div className="pricing-badge badge-enterprise">Full Service</div>
              <div className="pricing-name">Full Entry</div>
              <div className="pricing-amount">$15K+</div>
              <div className="pricing-period">per market · project-based</div>
              <button className="btn-pricing btn-pricing-enterprise" onClick={() => showPage("contact")}>Discuss Your Entry</button>
            </article>
          </div>
        </section>
      </div>

      <div className={`page ${activePage === "intelligence" ? "active" : ""}`}>
        <section className="intel-hero">
          <div className="section-tag">Market Intelligence</div>
          <h1>Know your terrain<br /><em>before you move.</em></h1>
          <p>Our reports combine data with insider context, so decisions are made with full visibility.</p>
          <button className="btn-primary" onClick={() => showPage("contact")}>Commission a Report</button>
        </section>
        <section className="report-grid">
          {[
            ["🇳🇬", "Nigeria · Lagos", "Consumer Tech Market Entry Guide 2026", "$2,400"],
            ["🇬🇧", "United Kingdom · London", "African Food & Beverage Export Playbook", "$2,200"],
            ["🇦🇪", "UAE · Dubai", "African SME Trade Corridor Report", "$2,800"],
            ["🇰🇪", "Kenya · Nairobi", "Fintech & Mobile Money Landscape 2026", "$2,600"],
            ["🇬🇭", "Ghana · Accra", "Retail & Distribution Network Guide", "$1,900"],
            ["🇺🇸", "United States · New York", "African Creative Industries Export Guide", "$3,200"],
          ].map(([flag, market, title, price]) => (
            <article className="report-card" key={title}>
              <div className="report-thumb">{flag}</div>
              <div className="report-body">
                <div className="report-market">{market}</div>
                <h3>{title}</h3>
                <p>Regulation, buyers, distribution dynamics, and practical market entry intelligence.</p>
                <div className="report-meta"><span>Updated 2026</span><strong>{price}</strong></div>
              </div>
            </article>
          ))}
        </section>
      </div>

      <div className={`page ${activePage === "markets" ? "active" : ""}`}>
        <section className="section section-tight">
          <div className="section-tag">Active Corridors</div>
          <h2 className="section-title">Where we<br /><em>operate.</em></h2>
          <p className="section-sub">Active intelligence networks and vetted partner relationships in each corridor.</p>
          <div className="markets-grid-page">
            {[
              ["🇳🇬", "Nigeria", "Primary Market · Lagos & Abuja"],
              ["🇬🇭", "Ghana", "Active Market · Accra"],
              ["🇰🇪", "Kenya", "Active Market · Nairobi"],
              ["🇬🇧", "United Kingdom", "Outbound Destination · London"],
              ["🇦🇪", "UAE", "Inbound & Outbound · Dubai"],
              ["🇺🇸", "United States", "Outbound Destination · NY & DC"],
              ["🇿🇦", "South Africa", "Coming Soon · Johannesburg"],
              ["🇸🇳", "Senegal", "Coming Soon · Dakar"],
            ].map(([flag, name, status]) => (
              <div className="market-tile" key={name}>
                <span className="market-flag">{flag}</span>
                <div className="market-name">{name}</div>
                <div className="market-status">{status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`page ${activePage === "about" ? "active" : ""}`}>
        <section className="about-hero">
          <div className="section-tag about-hero-tag">Our Story</div>
          <h1>Built on the belief that<br /><em>every great move</em><br />changes everything.</h1>
          <p>EasyMoveZone was founded on a simple truth: movement changes trajectories.</p>
        </section>
        <section className="genesis-section">
          <div className="genesis-quote">
            <blockquote>
              &quot;Go from your country, your people and your father&apos;s household to the land I will show you...&quot;
            </blockquote>
            <div className="genesis-source">Genesis 12:1–3</div>
          </div>
          <div className="genesis-text">
            <h2>The unseen destination<br />is the <em>point.</em></h2>
            <p>We built EasyMoveZone for businesses that know their product can travel.</p>
            <p>Our role is to become your eyes on the ground and your execution partner.</p>
            <p>Move with confidence backed by context, network, and disciplined strategy.</p>
          </div>
        </section>
        <section className="values-grid">
          {[
            "Truth Before Comfort",
            "Movement Is Our Mission",
            "Africa Is the Opportunity",
            "The Blessing Flows Both Ways",
            "Relationships Over Transactions",
            "Living Intelligence, Not Static Reports",
          ].map((title, index) => (
            <article className="value-card" key={title}>
              <div className="value-num">{String(index + 1).padStart(2, "0")}</div>
              <h3>{title}</h3>
              <p>Built into every engagement, every recommendation, and every execution milestone.</p>
            </article>
          ))}
        </section>
      </div>

      <div className={`page ${activePage === "design" ? "active" : ""}`}>
        <section className="design-page">
          <div className="section-tag">Design System</div>
          <h1 className="section-title">EasyMoveZone<br /><em>Style Guide</em></h1>
          <p>The visual language of the platform: color, typography, components, and rhythm.</p>
          <div className="design-block">
            <h3>Color Palette</h3>
            <div className="color-row">
              {["#0d0d0d", "#f5f0e8", "#ede8de", "#c9a84c", "#e8c96a", "#1a3a2a", "#b85c2a", "#1a4a6b"].map((hex) => (
                <div className="color-swatch" key={hex}>
                  <div className="swatch-color" style={{ background: hex }} />
                  <div className="swatch-label">{hex}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="design-block">
            <h3>Button System</h3>
            <div className="component-row">
              <button className="btn-primary">Primary Action</button>
              <button className="btn-secondary">Secondary Action</button>
            </div>
          </div>
        </section>
      </div>

      <div className={`page ${activePage === "contact" ? "active" : ""}`}>
        <section className="contact-layout">
          <div className="contact-left">
            <div className="section-tag contact-left-tag">Get Started</div>
            <h2>Tell us about<br />your <em>move.</em></h2>
            <p>
              Every engagement starts with a free 30-minute strategy call. We listen first, then
              propose the right path.
            </p>
            <div className="contact-info">
              <div><strong>Headquarters</strong><span>Lagos, Nigeria · London, UK</span></div>
              <div><strong>Email</strong><span>hello@easymovezone.com</span></div>
              <div><strong>Response Time</strong><span>Within 24 hours on business days</span></div>
            </div>
          </div>
          <div className="contact-right">
            <h3>Start the conversation.</h3>
            <div className="form-row">
              <input className="form-input" placeholder="First Name" />
              <input className="form-input" placeholder="Last Name" />
            </div>
            <input className="form-input" placeholder="Company / Business" />
            <input className="form-input" placeholder="Email Address" />
            <select className="form-input">
              <option>Select your direction</option>
              <option>Enter an African market (Inbound)</option>
              <option>Expand an African business globally (Outbound)</option>
              <option>Commission a market intelligence report</option>
            </select>
            <textarea className="form-input form-textarea" placeholder="Tell us about your move..." />
            <button className="form-submit">Send & Request Strategy Call →</button>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-logo">Easy<span>Move</span>Zone</div>
          <p>The intelligence layer between African markets and the world.</p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul><li>Market Entry</li><li>Intelligence Reports</li><li>Monthly Retainer</li></ul>
        </div>
        <div className="footer-col">
          <h4>Markets</h4>
          <ul><li>Nigeria</li><li>Ghana</li><li>Kenya</li></ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul><li>About</li><li>Partners</li><li>Contact</li></ul>
        </div>
      </footer>
      <div className="footer-bottom">
        <p>© {year} EasyMoveZone. All rights reserved.</p>
        <p>Lagos · London · Dubai</p>
      </div>

      <style jsx global>{`
        .platform {
          --ink: #0d0d0d;
          --cream: #f5f0e8;
          --warm: #ede8de;
          --gold: #c9a84c;
          --gold-light: #e8c96a;
          --rust: #b85c2a;
          --forest: #1a3a2a;
          --sky: #1a4a6b;
          --text: #1a1a1a;
          --muted: #6b6560;
          --border: rgba(0, 0, 0, 0.1);
          --white: #ffffff;
          background: var(--cream);
          color: var(--text);
          min-height: 100vh;
          font-family: var(--font-outfit), sans-serif;
        }
        .platform * { box-sizing: border-box; }
        .platform .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(245, 240, 232, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
        }
        .platform .nav-logo {
          border: 0;
          background: transparent;
          font-family: var(--font-playfair), serif;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
        }
        .platform .nav-logo span { color: var(--gold); }
        .platform .nav-links {
          list-style: none;
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .platform .nav-links button,
        .platform .nav-links a {
          border: 0;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 100px;
          cursor: pointer;
        }
        .platform .nav-links .active,
        .platform .nav-links button:hover,
        .platform .nav-links a:hover {
          background: var(--warm);
          color: var(--ink);
        }
        .platform .nav-cta {
          background: var(--ink) !important;
          color: var(--cream) !important;
          padding: 8px 16px !important;
        }
        .platform .page { display: none; padding-top: 64px; min-height: 70vh; }
        .platform .page.active { display: block; animation: fadeIn 0.35s ease; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .platform .hero {
          min-height: calc(100vh - 64px);
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .platform .hero-left { padding: 80px; display: flex; flex-direction: column; justify-content: center; }
        .platform .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--warm);
          border: 1px solid rgba(201, 168, 76, 0.3);
          padding: 6px 14px 6px 8px;
          border-radius: 100px;
          margin-bottom: 28px;
          width: fit-content;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--muted);
        }
        .platform .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
        .platform h1, .platform .section-title, .platform h2, .platform h3 {
          font-family: var(--font-playfair), serif;
        }
        .platform .hero h1 { font-size: clamp(44px, 5vw, 72px); line-height: 1; margin-bottom: 20px; letter-spacing: -2px; }
        .platform em { color: var(--gold); font-style: italic; }
        .platform .hero-sub { max-width: 470px; color: var(--muted); line-height: 1.7; margin-bottom: 34px; }
        .platform .hero-actions { display: flex; gap: 10px; margin-bottom: 50px; }
        .platform .btn-primary,
        .platform .btn-secondary,
        .platform .form-submit,
        .platform .btn-pricing {
          border: 0;
          border-radius: 100px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
        }
        .platform .btn-primary { background: var(--ink); color: var(--cream); padding: 12px 24px; }
        .platform .btn-primary:hover { background: var(--forest); }
        .platform .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--ink); padding: 12px 24px; }
        .platform .btn-secondary:hover { background: var(--warm); }
        .platform .hero-stats { display: flex; gap: 36px; }
        .platform .stat-num { font-family: var(--font-playfair), serif; font-size: 28px; font-weight: 700; }
        .platform .stat-label { font-size: 11px; color: var(--muted); }
        .platform .hero-right {
          background: var(--forest);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .platform .hero-map-bg {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.8) 1px, transparent 0);
          background-size: 24px 24px;
        }
        .platform .hero-visual { position: relative; z-index: 2; width: 100%; padding: 44px; }
        .platform .corridor-card {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 22px;
          margin-bottom: 14px;
        }
        .platform .corridor-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          align-items: center;
        }
        .platform .corridor-route { color: var(--cream); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .platform .corridor-arrow { color: var(--gold); }
        .platform .corridor-badge {
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--gold-light);
          background: rgba(201, 168, 76, 0.14);
          border: 1px solid rgba(201, 168, 76, 0.2);
        }
        .platform .corridor-badge.outbound {
          background: rgba(184, 92, 42, 0.2);
          color: #f0b291;
          border-color: rgba(184, 92, 42, 0.25);
        }
        .platform .corridor-meta { font-size: 12px; color: rgba(245, 240, 232, 0.6); }
        .platform .section {
          max-width: 1380px;
          margin: 0 auto;
          padding: 96px 80px;
        }
        .platform .section-tight { padding-top: 80px; }
        .platform .section-tag {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 14px;
        }
        .platform .section-title {
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .platform .section-sub { color: var(--muted); line-height: 1.7; max-width: 520px; margin-bottom: 52px; }
        .platform .how-grid { display: grid; grid-template-columns: 1fr 1fr; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); }
        .platform .how-panel { background: var(--cream); padding: 50px; }
        .platform .how-panel.dark { background: var(--forest); }
        .platform .how-panel h3 { font-size: 28px; margin-bottom: 10px; }
        .platform .how-panel p { color: var(--muted); margin-bottom: 26px; line-height: 1.6; }
        .platform .how-panel.dark h3 { color: var(--cream); }
        .platform .how-panel.dark p { color: rgba(245, 240, 232, 0.6); }
        .platform .how-panel-tag {
          display: inline-block;
          border-radius: 100px;
          padding: 5px 11px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.4px;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .platform .tag-inbound { background: rgba(26, 74, 107, 0.12); color: var(--sky); }
        .platform .tag-outbound { background: rgba(201, 168, 76, 0.18); color: var(--gold-light); }
        .platform .steps-list { list-style: none; display: grid; gap: 14px; }
        .platform .step-item { display: flex; gap: 12px; align-items: flex-start; }
        .platform .step-item h4 { margin: 0 0 4px; font-size: 14px; }
        .platform .step-item p { margin: 0; font-size: 13px; line-height: 1.4; }
        .platform .step-num {
          width: 30px;
          height: 30px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .platform .light { background: var(--warm); color: var(--ink); }
        .platform .dark-num { background: rgba(201, 168, 76, 0.17); color: var(--gold-light); }
        .platform .how-panel.dark .step-item h4 { color: var(--cream); }
        .platform .how-panel.dark .step-item p { color: rgba(245, 240, 232, 0.63); }
        .platform .services-grid,
        .platform .pricing-grid,
        .platform .report-grid,
        .platform .markets-grid-page,
        .platform .values-grid {
          display: grid;
          gap: 20px;
        }
        .platform .services-grid, .platform .pricing-grid, .platform .report-grid, .platform .values-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .platform .markets-grid-page { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .platform .service-card,
        .platform .report-card,
        .platform .market-tile,
        .platform .value-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 26px;
        }
        .platform .service-icon { font-size: 28px; display: block; margin-bottom: 16px; }
        .platform .service-card h3 { font-size: 22px; margin-bottom: 10px; }
        .platform .service-card p { font-size: 14px; line-height: 1.65; color: var(--muted); margin-bottom: 16px; }
        .platform .service-price { color: var(--gold); font-weight: 600; font-size: 12px; }
        .platform .pricing-card { border-radius: 20px; padding: 32px; }
        .platform .pricing-card.standard { background: var(--white); border: 1px solid var(--border); }
        .platform .pricing-card.featured { background: var(--forest); color: var(--cream); transform: scale(1.02); }
        .platform .pricing-card.enterprise { background: var(--ink); color: var(--cream); }
        .platform .pricing-badge { display: inline-block; border-radius: 100px; padding: 4px 10px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; font-weight: 700; }
        .platform .badge-standard { background: var(--warm); color: var(--muted); }
        .platform .badge-featured { background: rgba(201, 168, 76, 0.2); color: var(--gold-light); }
        .platform .badge-enterprise { background: rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.7); }
        .platform .pricing-name { font-family: var(--font-playfair), serif; font-size: 24px; }
        .platform .pricing-amount { font-family: var(--font-playfair), serif; font-size: 42px; margin: 4px 0; }
        .platform .pricing-period { font-size: 13px; opacity: 0.75; margin-bottom: 24px; }
        .platform .btn-pricing { width: 100%; padding: 12px; font-weight: 600; }
        .platform .btn-pricing-standard { background: var(--warm); color: var(--ink); }
        .platform .btn-pricing-featured { background: var(--gold); color: var(--ink); }
        .platform .btn-pricing-enterprise { background: rgba(255, 255, 255, 0.14); color: var(--cream); border: 1px solid rgba(255, 255, 255, 0.2); }
        .platform .intel-hero { padding: 100px 80px 54px; border-bottom: 1px solid var(--border); background: var(--warm); }
        .platform .intel-hero h1 { font-size: clamp(36px, 4vw, 60px); line-height: 1; margin-bottom: 14px; }
        .platform .intel-hero p { max-width: 550px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
        .platform .report-grid { max-width: 1380px; margin: 0 auto; padding: 54px 80px; }
        .platform .report-thumb {
          height: 126px;
          border-radius: 14px;
          background: linear-gradient(145deg, #1a3a2a, #375b49);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 46px;
          margin-bottom: 18px;
        }
        .platform .report-market { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); margin-bottom: 8px; }
        .platform .report-card h3 { font-size: 20px; margin-bottom: 8px; }
        .platform .report-card p { color: var(--muted); font-size: 14px; line-height: 1.55; margin-bottom: 14px; }
        .platform .report-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
        .platform .report-meta strong { color: var(--ink); font-size: 14px; }
        .platform .market-tile { background: rgba(255, 255, 255, 0.55); }
        .platform .market-flag { font-size: 30px; display: block; margin-bottom: 10px; }
        .platform .market-name { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
        .platform .market-status { font-size: 12px; color: var(--muted); }
        .platform .about-hero {
          background: var(--ink);
          padding: 120px 80px 80px;
        }
        .platform .about-hero-tag { color: var(--gold-light); }
        .platform .about-hero h1 { color: var(--cream); font-size: clamp(42px, 5vw, 68px); line-height: 1; margin-bottom: 20px; }
        .platform .about-hero p { color: rgba(245, 240, 232, 0.65); max-width: 540px; line-height: 1.7; }
        .platform .genesis-section {
          max-width: 1380px;
          margin: 0 auto;
          padding: 90px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .platform .genesis-quote { background: var(--forest); border-radius: 20px; padding: 36px; }
        .platform .genesis-quote blockquote { color: var(--cream); line-height: 1.6; font-style: italic; font-size: 20px; }
        .platform .genesis-source { margin-top: 16px; color: var(--gold); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
        .platform .genesis-text h2 { font-size: 40px; line-height: 1.08; margin-bottom: 18px; }
        .platform .genesis-text p { color: var(--muted); line-height: 1.7; margin-bottom: 12px; }
        .platform .values-grid { max-width: 1380px; margin: 0 auto; padding: 0 80px 90px; }
        .platform .value-num { font-family: var(--font-playfair), serif; font-size: 40px; color: rgba(201, 168, 76, 0.23); }
        .platform .value-card h3 { font-size: 22px; margin: 10px 0 8px; }
        .platform .value-card p { color: var(--muted); line-height: 1.6; font-size: 14px; }
        .platform .design-page { max-width: 1200px; margin: 0 auto; padding: 96px 80px; }
        .platform .design-page > p { color: var(--muted); margin-bottom: 32px; }
        .platform .design-block { margin-bottom: 36px; }
        .platform .design-block h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--gold);
          margin-bottom: 14px;
          font-weight: 700;
        }
        .platform .color-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .platform .color-swatch { width: 90px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--white); }
        .platform .swatch-color { height: 60px; }
        .platform .swatch-label { padding: 7px; font-size: 10px; text-align: center; color: var(--muted); }
        .platform .component-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .platform .contact-layout { min-height: calc(100vh - 64px); display: grid; grid-template-columns: 1fr 1fr; }
        .platform .contact-left {
          background: var(--forest);
          color: var(--cream);
          padding: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .platform .contact-left-tag { color: var(--gold-light); }
        .platform .contact-left h2 { font-size: clamp(34px, 4vw, 50px); line-height: 1.1; margin-bottom: 16px; }
        .platform .contact-left p { color: rgba(245, 240, 232, 0.65); line-height: 1.7; margin-bottom: 24px; }
        .platform .contact-info { display: grid; gap: 12px; }
        .platform .contact-info strong { display: block; font-size: 13px; color: var(--cream); margin-bottom: 2px; }
        .platform .contact-info span { font-size: 13px; color: rgba(245, 240, 232, 0.65); }
        .platform .contact-right {
          background: var(--cream);
          padding: 80px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
        }
        .platform .contact-right h3 { font-size: 30px; margin-bottom: 8px; }
        .platform .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .platform .form-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--white);
          padding: 12px 14px;
          color: var(--ink);
          font-size: 14px;
          outline: none;
        }
        .platform .form-input:focus { border-color: var(--gold); }
        .platform .form-textarea { min-height: 110px; resize: vertical; }
        .platform .form-submit { background: var(--ink); color: var(--cream); padding: 14px; margin-top: 6px; }
        .platform .footer {
          background: var(--ink);
          padding: 70px 80px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 50px;
        }
        .platform .footer-logo {
          color: var(--cream);
          font-family: var(--font-playfair), serif;
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 12px;
        }
        .platform .footer-logo span { color: var(--gold); }
        .platform .footer-brand p { color: rgba(245, 240, 232, 0.5); max-width: 270px; line-height: 1.6; font-size: 14px; }
        .platform .footer-col h4 {
          color: rgba(245, 240, 232, 0.45);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }
        .platform .footer-col ul { list-style: none; display: grid; gap: 8px; color: rgba(245, 240, 232, 0.7); font-size: 14px; }
        .platform .footer-bottom {
          display: flex;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.3);
          color: rgba(245, 240, 232, 0.35);
          padding: 16px 80px 20px;
          font-size: 12px;
        }

        @media (max-width: 1200px) {
          .platform .services-grid,
          .platform .pricing-grid,
          .platform .report-grid,
          .platform .values-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .platform .markets-grid-page { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .platform .hero-left, .platform .section, .platform .report-grid, .platform .genesis-section, .platform .values-grid, .platform .contact-left, .platform .contact-right, .platform .about-hero, .platform .design-page, .platform .intel-hero, .platform .footer, .platform .footer-bottom {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
        @media (max-width: 900px) {
          .platform .nav { height: auto; align-items: flex-start; gap: 12px; padding-top: 10px; padding-bottom: 10px; flex-direction: column; }
          .platform .nav-links { flex-wrap: wrap; }
          .platform .page { padding-top: 96px; }
          .platform .hero, .platform .contact-layout, .platform .genesis-section, .platform .how-grid { grid-template-columns: 1fr; }
          .platform .services-grid,
          .platform .pricing-grid,
          .platform .report-grid,
          .platform .markets-grid-page,
          .platform .values-grid,
          .platform .footer { grid-template-columns: 1fr; }
          .platform .form-row { grid-template-columns: 1fr; }
          .platform .footer-bottom { flex-direction: column; gap: 8px; }
        }
      `}</style>
    </div>
  )
}
