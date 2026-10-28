import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from 'recharts';
import {
  FaArrowRight, FaCheck, FaCheckCircle, FaTimes, FaChartPie, FaMoneyBillWave, FaKey, FaTools,
  FaFileAlt, FaCog, FaHome, FaExclamationTriangle, FaRegClock, FaUniversity, FaTable,
  FaChevronLeft, FaDownload, FaBuilding, FaRegCompass, FaBullhorn, FaExternalLinkAlt, FaUserCheck, FaClipboardCheck,
} from 'react-icons/fa';
import { api } from '../api';
import { EmptyPropertiesArt } from '../components/graphics';
import {
  PLAN_BY_ID, STATUS_LABEL, STATUS_TONE, EXPENSE_CATEGORY_LABEL, EXPENSE_STATUS_LABEL,
  EXPENSE_STATUS_TONE, PAYOUT_STATUS_LABEL, PAYOUT_STATUS_TONE, RENT_STATUS_LABEL,
  RENT_STATUS_TONE, TENANCY_STATUS_LABEL, TENANCY_STATUS_TONE, RENT_FREQUENCY_LABEL,
  PAYOUT_CYCLES, annualiseRent, MANAGEMENT_STEPS,
} from '../config/management';
import { formatMoneyFull } from '../utils/format';
import {
  MANAGE_ADD_URL, MANAGE_ONBOARDING_URL, MANAGE_MAINTENANCE_URL, MANAGE_COLLECTIONS_URL, MANAGE_JOURNEYS_URL,
  MANAGE_PROPERTIES_URL, RENT_URL,
} from '../config/platform';
import {
  perPeriod, RENTAL_STATUS_LABEL, APPLICATION_STATUS_LABEL, INSPECTION_KIND_LABEL, INSPECTION_STATUS_LABEL,
  INSPECTION_CONDITION_LABEL,
} from '../config/rentals';
import ScreeningChecks from '../components/ScreeningChecks';
import {
  TENANT_CATEGORY_LABEL, TENANT_URGENCY_LABEL, TENANT_REQUEST_STATUS_LABEL, TENANT_REQUEST_STATUS_TONE,
} from '../config/tenant';
import { LOCALE } from '../config/markets';

/**
 * The Manage console's data sections.
 *
 * These used to be the private innards of a standalone `/manage/portal` page.
 * They are exported now because the console shell (`ConsoleShell`) owns the
 * navigation and the page chrome, and routes each of these in as a sub-page —
 * so Manage is one application rather than a handful of separate screens.
 */

/**
 * Series colors for the finance chart. Validated as a categorical set against a
 * white chart surface (lightness band, chroma, CVD separation, contrast) — do
 * not swap one out without re-validating the trio.
 */
const SERIES = {
  net: { key: 'net', label: 'Net to you', color: '#426f62' },
  fees: { key: 'fees', label: 'Fees & VAT', color: '#0369a1' },
  costs: { key: 'costs', label: 'Property costs', color: '#b45309' },
};


/* ── Shared console furniture ──────────────────────── */

/** Scope switcher in the console header — "all properties", or just one. */
export const PropertySelect = styled.select`
  background: #fff; color: var(--color-ink);
  border: 1px solid var(--color-line-strong); border-radius: 999px;
  padding: 0.6rem 1rem; font-family: var(--font-sans); font-size: 0.9rem; font-weight: 600;
  cursor: pointer; max-width: 100%;
  &:focus { outline: none; border-color: var(--color-green); }
`;


/** In-section back control — e.g. stepping out of a single payment statement. */
export const BackBtn = styled.button`
  display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none;
  cursor: pointer; padding: 0; font-size: 0.8rem; font-weight: 600;
  color: var(--color-ink-muted); margin-bottom: 1rem;
  &:hover { color: var(--color-green-deep); }
`;

/** The console's workhorse container: a white card on the grey console body. */
export const Card = styled.section`
  background: #fff; border: 1px solid var(--color-line); border-radius: var(--radius-lg);
  padding: 1.35rem 1.45rem;
  @media (max-width: 720px) { padding: 1.1rem; }
`;

export const CardHead = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
  flex-wrap: wrap; margin-bottom: 1.15rem;
`;

export const CardTitle = styled.h2`
  font-family: var(--font-display); font-size: 1.15rem; font-weight: 700;
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 0.5rem;
  svg { color: var(--color-green); font-size: 0.85rem; }
`;

export const CardNote = styled.div` font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); `;

/* ── KPIs ─────────────────────────────────────────── */
export const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); gap: 0.85rem;
`;

export const Kpi = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1.05rem 1.15rem;
  .k {
    font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.05em;
    text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 0.45rem;
  }
  .v {
    font-family: var(--font-display); font-size: 1.55rem; font-weight: 700; letter-spacing: -0.025em;
    color: ${(p) => p.$tone || 'var(--color-ink)'}; line-height: 1.05;
  }
  .m { font-size: 0.78rem; color: var(--color-ink-muted); margin-top: 0.35rem; }
`;

/* ── Lists & tables ───────────────────────────────── */
export const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.9rem 0; border-bottom: 1px solid var(--color-line);
  &:last-child { border-bottom: none; }
  .t { font-size: 0.95rem; font-weight: 600; color: var(--color-ink); }
  .s { font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-ink-faint); margin-top: 0.25rem; }
  .amt { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; white-space: nowrap; }
  @media (max-width: 560px) { flex-direction: column; align-items: flex-start; .amt { white-space: normal; } }
`;

export const ClickRow = styled(Row).attrs({ as: 'button' })`
  width: 100%; text-align: left; background: none; border-top: none; border-left: none; border-right: none;
  cursor: pointer;
  &:hover .t { color: var(--color-green-deep); }
`;

export const Pill = styled.span`
  display: inline-flex; align-items: center; gap: 0.3rem; white-space: nowrap;
  font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.03em;
  border-radius: 999px; padding: 0.28rem 0.62rem;
  background: ${(p) => ({
    good: 'var(--color-green-soft)', info: 'rgba(3,105,161,0.1)', warn: 'rgba(180,83,9,0.1)',
  }[p.$tone] || 'var(--color-bg-sunken)')};
  color: ${(p) => ({
    good: 'var(--color-green-deep)', info: '#0369a1', warn: '#b45309',
  }[p.$tone] || 'var(--color-ink-muted)')};
  border: 1px solid ${(p) => ({
    good: 'rgba(47, 93, 80,0.25)', info: 'rgba(3,105,161,0.2)', warn: 'rgba(180,83,9,0.2)',
  }[p.$tone] || 'var(--color-line-strong)')};
`;

export const Table = styled.div`
  width: 100%; overflow-x: auto;
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 460px; }
  th {
    text-align: left; font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.05em;
    text-transform: uppercase; color: var(--color-ink-faint); font-weight: 500;
    padding: 0.5rem 0.75rem 0.5rem 0; border-bottom: 1px solid var(--color-line-strong);
  }
  td { padding: 0.65rem 0.75rem 0.65rem 0; border-bottom: 1px solid var(--color-line); color: var(--color-ink); }
  td.num, th.num { text-align: right; padding-right: 0; font-variant-numeric: tabular-nums; }
  tr:last-child td { border-bottom: none; }
`;

const ChartWrap = styled.div`
  height: 290px; width: 100%;
  @media (max-width: 720px) { height: 240px; }
`;

const CostBars = styled.div`
  display: flex; flex-direction: column; gap: 0.7rem;
  .r { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem 0.85rem; align-items: center; }
  .lab { font-size: 0.88rem; color: var(--color-ink); }
  .amt { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; font-variant-numeric: tabular-nums; }
  .track { grid-column: 1 / -1; height: 7px; border-radius: 999px; background: var(--color-bg-sunken); overflow: hidden; }
  .fill { height: 100%; border-radius: 999px; background: ${SERIES.costs.color}; }
`;

const Toggle = styled.div`
  display: inline-flex; gap: 0.25rem; padding: 0.22rem;
  background: var(--color-bg-sunken); border: 1px solid var(--color-line-strong); border-radius: 999px;
`;

const ToggleBtn = styled.button`
  border: none; cursor: pointer; border-radius: 999px; padding: 0.4rem 0.8rem;
  font-family: var(--font-mono); font-size: 0.72rem;
  background: ${(p) => (p.$on ? '#fff' : 'transparent')};
  color: ${(p) => (p.$on ? 'var(--color-ink)' : 'var(--color-ink-faint)')};
  box-shadow: ${(p) => (p.$on ? '0 1px 3px rgba(13,17,23,0.12)' : 'none')};
`;

export const Actions = styled.div` display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.9rem; `;

export const Btn = styled.button`
  display: inline-flex; align-items: center; gap: 0.45rem; cursor: pointer;
  border-radius: 999px; padding: 0.65rem 1.15rem;
  font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700;
  border: 1px solid ${(p) => (p.$ghost ? 'var(--color-line-strong)' : 'transparent')};
  background: ${(p) => (p.$ghost ? '#fff' : 'var(--color-green-deep)')};
  color: ${(p) => (p.$ghost ? 'var(--color-ink-muted)' : '#fff')};
  &:hover:not(:disabled) { border-color: ${(p) => (p.$ghost ? 'var(--color-ink-faint)' : 'transparent')}; background: ${(p) => (p.$ghost ? '#fff' : 'var(--color-green-forest)')}; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export const Field = styled.div` margin-bottom: 1rem; `;

export const Label = styled.label`
  display: block; font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-ink-soft); margin-bottom: 0.45rem;
`;

export const Input = styled.input`
  width: 100%; background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong); border-radius: 11px;
  padding: 0.8rem 0.95rem; font-family: var(--font-sans); font-size: 0.95rem;
  color: var(--color-ink); outline: none;
  &:focus { border-color: var(--color-green); background: #fff; }
`;

export const Select = styled.select`
  width: 100%; background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong); border-radius: 11px;
  padding: 0.8rem 0.95rem; font-family: var(--font-sans); font-size: 0.95rem;
  color: var(--color-ink); cursor: pointer; outline: none;
  &:focus { border-color: var(--color-green); }
`;

export const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  @media (max-width: 620px) { grid-template-columns: minmax(0, 1fr); }
`;

export const Empty = styled.div`
  border: 1px dashed var(--color-line-strong); border-radius: 14px;
  padding: 1.75rem 1.25rem; text-align: center; color: var(--color-ink-muted); font-size: 0.92rem;
`;

export const Notice = styled.div`
  display: flex; align-items: flex-start; gap: 0.7rem;
  border-radius: 14px; padding: 0.95rem 1.1rem; font-size: 0.9rem; line-height: 1.45;
  background: ${(p) => (p.$warn ? 'rgba(180,83,9,0.08)' : 'var(--color-green-soft)')};
  border: 1px solid ${(p) => (p.$warn ? 'rgba(180,83,9,0.22)' : 'rgba(47, 93, 80,0.2)')};
  color: var(--color-ink);
  svg { color: ${(p) => (p.$warn ? '#b45309' : 'var(--color-green)')}; margin-top: 0.15rem; flex-shrink: 0; }
`;

export const ErrorMsg = styled.p` color: #b91c1c; font-size: 0.88rem; margin: 0.6rem 0 0; `;


/* ── Helpers ──────────────────────────────────────── */
const money = (v, currency = 'NGN') => formatMoneyFull(v, currency || 'NGN');

function portalCurrency(data) {
  const properties = data?.properties || [];
  if (data?.scopedTo) return properties.find((p) => p.id === data.scopedTo)?.currency || 'NGN';
  const currencies = [...new Set(properties.map((p) => p.currency).filter(Boolean))];
  return currencies.length === 1 ? currencies[0] : 'NGN';
}

function shortDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

function tooltipStyle() {
  return {
    borderRadius: 12,
    border: '1px solid rgba(13,17,23,0.1)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    boxShadow: '0 12px 30px rgba(13,17,23,0.12)',
  };
}

/* ─────────────────────────── Finance chart ─────────────────────────── */
export function RentFlowChart({ series, currency = 'NGN' }) {
  const [view, setView] = useState('chart');
  const hasData = series.some((m) => m.rent > 0 || m.costs > 0 || m.fees > 0);

  if (!hasData) {
    return <Empty>No money has moved through this property yet. Your first statement appears here once rent clears.</Empty>;
  }

  if (view === 'table') {
    return (
      <>
        <Toggle style={{ marginBottom: '1rem' }}>
          <ToggleBtn $on={false} onClick={() => setView('chart')}>Chart</ToggleBtn>
          <ToggleBtn $on>Table</ToggleBtn>
        </Toggle>
        <Table>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th className="num">Rent collected</th>
                <th className="num">Fees &amp; VAT</th>
                <th className="num">Property costs</th>
                <th className="num">Paid to you</th>
              </tr>
            </thead>
            <tbody>
              {series.map((m) => (
                <tr key={m.key}>
                  <td>{m.month} {String(m.year).slice(2)}</td>
                  <td className="num">{money(m.rent, currency)}</td>
                  <td className="num">{money(m.fees, currency)}</td>
                  <td className="num">{money(m.costs, currency)}</td>
                  <td className="num">{money(m.net, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </>
    );
  }

  return (
    <>
      <Toggle style={{ marginBottom: '1rem' }}>
        <ToggleBtn $on>Chart</ToggleBtn>
        <ToggleBtn $on={false} onClick={() => setView('table')}>Table</ToggleBtn>
      </Toggle>
      <ChartWrap>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="rgba(13,17,23,0.07)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: 'rgba(13,17,23,0.12)' }}
              tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }}
            />
            <YAxis
              width={54}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }}
              tickFormatter={(v) => money(v, currency)}
            />
            <RTooltip
              cursor={{ fill: 'rgba(13,17,23,0.04)' }}
              formatter={(value, name) => [money(value, currency), name]}
              contentStyle={tooltipStyle()}
            />
            <Legend
              verticalAlign="bottom"
              height={30}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}
            />
            {/* Stack order runs bottom-up: what you keep sits on the baseline. */}
            <Bar dataKey={SERIES.net.key} name={SERIES.net.label} stackId="rent" fill={SERIES.net.color} stroke="#fff" strokeWidth={2} />
            <Bar dataKey={SERIES.fees.key} name={SERIES.fees.label} stackId="rent" fill={SERIES.fees.color} stroke="#fff" strokeWidth={2} />
            <Bar dataKey={SERIES.costs.key} name={SERIES.costs.label} stackId="rent" fill={SERIES.costs.color} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrap>
    </>
  );
}

/* ─────────────────────────── Portfolio roll-up ─────────────────────────── */
const Occupancy = styled.div`
  display: flex; align-items: center; gap: 0.5rem; min-width: 96px;
  .track { flex: 1; height: 6px; border-radius: 999px; background: var(--color-bg-sunken); overflow: hidden; }
  .fill {
    display: block; height: 100%; border-radius: 999px;
    background: ${(p) => (p.$pct >= 100 ? 'var(--color-green)' : p.$pct > 0 ? '#b45309' : 'var(--color-line-strong)')};
    width: ${(p) => Math.min(100, p.$pct)}%;
  }
  .n { font-family: var(--font-mono); font-size: 0.74rem; color: var(--color-ink-muted); }
`;

export function PortfolioSection({ email, onOpenProperty }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.management.portfolio(email)
      .then((d) => { if (active) { setData(d); setError(''); } })
      .catch((err) => { if (active) setError(err?.message || 'Could not load your portfolio.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [email]);

  if (loading && !data) return <Card><Empty>Loading your portfolio…</Empty></Card>;
  if (error && !data) return <Card><Empty>{error}</Empty></Card>;

  const totals = data?.totals || null;
  const properties = data?.properties || [];
  const series = data?.finance?.series || [];
  const hasMoney = series.some((row) => row.rent || row.costs || row.fees);
  const currencies = [...new Set(properties.map((p) => p.currency).filter(Boolean))];
  const portfolioCurrency = currencies.length === 1 ? currencies[0] : null;

  if (!properties.length) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <EmptyPropertiesArt />
          <CardTitle style={{ justifyContent: 'center', marginTop: '1.25rem' }}>Nothing under management yet</CardTitle>
          <p style={{ color: 'var(--color-ink-muted)', lineHeight: 1.55, margin: '0.6rem 0 1.25rem', maxWidth: '46ch', marginInline: 'auto' }}>
            Once a property is with us, this tab shows what every one of them is earning, what came out of
            it, and which one needs your attention.
          </p>
          <Actions style={{ justifyContent: 'center' }}>
            <Btn as={Link} to={MANAGE_ADD_URL}>Hand over a property <FaArrowRight size={11} /></Btn>
            <Btn $ghost as={Link} to={MANAGE_ONBOARDING_URL}>Find my plan first</Btn>
          </Actions>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Kpis>
        <Kpi>
          <div className="k">Under management</div>
          <div className="v">{totals.propertyCount}</div>
          <div className="m">{totals.activeCount} active · {totals.totalUnits} unit{totals.totalUnits === 1 ? '' : 's'}</div>
        </Kpi>
        <Kpi>
          <div className="k">Occupancy</div>
          <div className="v">{totals.occupancyPct}%</div>
          <div className="m">{totals.letUnits} of {totals.totalUnits} let</div>
        </Kpi>
        <Kpi>
          <div className="k">Contracted rent</div>
          <div className="v">{portfolioCurrency ? money(totals.contractedRentAnnual, portfolioCurrency) : 'By property'}</div>
          <div className="m">{portfolioCurrency ? 'a year, on current tenancies' : 'multiple working currencies'}</div>
        </Kpi>
        <Kpi $tone="var(--color-green-ink)">
          <div className="k">Paid out to you</div>
          <div className="v">{portfolioCurrency ? money(totals.paidOut12m, portfolioCurrency) : 'By property'}</div>
          <div className="m">last 12 months</div>
        </Kpi>
        <Kpi $tone={totals.arrears > 0 ? '#b45309' : undefined}>
          <div className="k">Arrears</div>
          <div className="v">{portfolioCurrency ? money(totals.arrears, portfolioCurrency) : 'By property'}</div>
          <div className="m">{totals.arrears > 0 ? 'past due and being chased' : 'nothing outstanding'}</div>
        </Kpi>
        <Kpi $tone={totals.pendingApprovalCount > 0 ? '#b45309' : undefined}>
          <div className="k">Waiting on you</div>
          <div className="v">{totals.pendingApprovalCount}</div>
          <div className="m">{totals.pendingApprovalCount > 0 ? 'spend approvals pending' : 'nothing to approve'}</div>
        </Kpi>
      </Kpis>

      {hasMoney && portfolioCurrency && (
        <Card>
          <CardHead>
            <CardTitle><FaChartPie /> Where the rent went</CardTitle>
            <CardNote>ACROSS EVERY PROPERTY</CardNote>
          </CardHead>
          <RentFlowChart series={series} currency={portfolioCurrency} />
        </Card>
      )}

      <Card>
        <CardHead>
          <CardTitle><FaBuilding /> Property by property</CardTitle>
          <CardNote>LAST 12 MONTHS</CardNote>
        </CardHead>
        <Table>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Status</th>
                <th>Occupancy</th>
                <th className="num">Contracted rent</th>
                <th className="num">Paid to you</th>
                <th className="num">Arrears</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onOpenProperty(p.id)}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-faint)' }}>
                      {[p.city, p.state].filter(Boolean).join(', ') || p.ref}
                    </div>
                  </td>
                  <td><Pill $tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status] || p.status}</Pill></td>
                  <td>
                    <Occupancy $pct={p.occupancyPct}>
                      <span className="track"><span className="fill" /></span>
                      <span className="n">{p.letUnits}/{p.units}</span>
                    </Occupancy>
                  </td>
                  <td className="num">{money(p.contractedRentAnnual, p.currency)}</td>
                  <td className="num">{money(p.paidOut12m, p.currency)}</td>
                  <td className="num" style={p.arrears > 0 ? { color: '#b91c1c', fontWeight: 700 } : undefined}>{money(p.arrears, p.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </Card>
    </>
  );
}

/* ─────────────────────────── Sections ─────────────────────────── */
/**
 * A summary with every figure zeroed. The portal returns `summary: null` until
 * a property is under management, and an owner staring at a blank dashboard
 * cannot tell an empty portfolio from a broken page — so the dashboard always
 * renders its full shape and shows zero where there is nothing yet.
 */
const EMPTY_SUMMARY = {
  propertyCount: 0, totalUnits: 0, letUnits: 0, occupancyPct: 0,
  contractedRentAnnual: 0, rentCollected12m: 0, feesCharged12m: 0, costs12m: 0,
  paidOut12m: 0, arrears: 0, pendingApprovalCount: 0, pendingApprovalValue: 0,
  unreadMessages: 0, nextPayout: null, lastPayout: null,
};

const Steps = styled.ol`
  list-style: none;
  margin: 0.4rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

/* One step: a numbered dot on a line that runs down to the next step. */
const Step = styled.li`
  position: relative;
  display: flex;
  gap: 0.85rem;
  padding-bottom: 1rem;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 30px;
    bottom: 2px;
    width: 2px;
    background: ${(p) => (p.$state === 'done' ? 'var(--color-green)' : 'var(--color-line)')};
  }
  &:last-child { padding-bottom: 0; }

  .dot {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 700;
    border: 2px solid ${(p) => (p.$state === 'todo' ? 'var(--color-line-strong)' : 'var(--color-green)')};
    background: ${(p) => (p.$state === 'todo' ? '#fff' : p.$state === 'done' ? 'var(--color-green)' : 'var(--color-green-deep)')};
    color: ${(p) => (p.$state === 'todo' ? 'var(--color-ink-faint)' : '#fff')};
  }
  .body { flex: 1; min-width: 0; padding-top: 0.2rem; }
  .t { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-weight: 600; color: ${(p) => (p.$state === 'todo' ? 'var(--color-ink-muted)' : 'var(--color-ink)')}; }
  .tag { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 0.12rem 0.45rem; border-radius: 999px; background: var(--color-green-soft); color: var(--color-green-deep); }
  .b { margin: 0.2rem 0 0; font-size: 0.9rem; line-height: 1.5; color: var(--color-ink-muted); }
`;

const Aside = styled.p`
  margin: 1.1rem 0 0;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-line);
  font-size: 0.88rem;
  color: var(--color-ink-muted);
  a { color: var(--color-green-deep); font-weight: 600; }
`;

/**
 * Until a property is under management, the dashboard leads with the road
 * there, in order: the one thing to do now (hand it over) is the only big
 * button, and the steps after it say what EasyMoveZone does next and when.
 */
export function GetStarted({ handedOver, onStartOnboarding }) {
  const current = handedOver ? 1 : 0;
  return (
    <Card>
      <CardHead>
        <CardTitle><FaRegCompass /> {handedOver ? 'Your property is with us' : 'Get started in 5 steps'}</CardTitle>
      </CardHead>
      <p style={{ color: 'var(--color-ink-muted)', lineHeight: 1.55, margin: 0 }}>
        {handedOver
          ? 'We have your handover. Here is what happens next. The figures below fill in once rent starts moving.'
          : 'Hand your property to EasyMoveZone and we let it, run it and pay you. Only the first step is yours.'}
      </p>
      <Steps>
        {MANAGEMENT_STEPS.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'todo';
          return (
            <Step key={step.title} $state={state} aria-current={state === 'now' ? 'step' : undefined}>
              <span className="dot" aria-hidden="true">{state === 'done' ? <FaCheck size={11} /> : i + 1}</span>
              <div className="body">
                <div className="t">
                  {step.title}
                  {state === 'now' && <span className="tag">{i === 0 ? 'Your next step' : 'In progress'}</span>}
                  {state === 'done' && <span className="sr-only">(done)</span>}
                </div>
                <p className="b">{step.body}</p>
                {state === 'now' && i === 0 && (
                  <Actions>
                    <Btn as={Link} to={MANAGE_ADD_URL}>Add your property <FaArrowRight size={11} /></Btn>
                    <Btn $ghost onClick={onStartOnboarding}>Help me pick a plan</Btn>
                  </Actions>
                )}
                {state === 'now' && i > 0 && (
                  <Actions>
                    <Btn $ghost as={Link} to={MANAGE_PROPERTIES_URL}>See my property <FaArrowRight size={11} /></Btn>
                  </Actions>
                )}
              </div>
            </Step>
          );
        })}
      </Steps>
      <Aside>
        Renovating between tenants? That lives under <Link to={MANAGE_JOURNEYS_URL}>Journeys</Link>.
      </Aside>
    </Card>
  );
}

export function Overview({ data, onGo, onStartOnboarding }) {
  // `onGo` takes a console path — the shell routes, it no longer swaps local state.
  const s = data?.summary || EMPTY_SUMMARY;
  const live = s.propertyCount > 0;
  const next = s.nextPayout;
  const expenses = data?.expenses || [];
  const pending = expenses.filter((e) => e.status === 'pending');
  const series = data?.finance?.series || [];
  const currency = portalCurrency(data);

  return (
    <>
      {!live && <GetStarted handedOver={(data?.properties || []).length > 0} onStartOnboarding={onStartOnboarding} />}

      <Kpis>
        <Kpi>
          <div className="k">Rent collected</div>
          <div className="v">{money(s.rentCollected12m, currency)}</div>
          <div className="m">gross, last 12 months</div>
        </Kpi>
        <Kpi $tone={live ? 'var(--color-green-ink)' : undefined}>
          <div className="k">Paid out to you</div>
          <div className="v">{money(s.paidOut12m, currency)}</div>
          <div className="m">net of fees and costs</div>
        </Kpi>
        <Kpi>
          <div className="k">Spent on repairs</div>
          <div className="v">{money(s.costs12m, currency)}</div>
          <div className="m">maintenance and property costs</div>
        </Kpi>
        <Kpi>
          <div className="k">Fees &amp; VAT</div>
          <div className="v">{money(s.feesCharged12m, currency)}</div>
          <div className="m">what EasyMoveZone charged</div>
        </Kpi>
        <Kpi $tone={s.arrears > 0 ? '#b45309' : undefined}>
          <div className="k">Arrears</div>
          <div className="v">{money(s.arrears, currency)}</div>
          <div className="m">{s.arrears > 0 ? 'being chased by your manager' : 'nothing outstanding'}</div>
        </Kpi>
        <Kpi>
          <div className="k">Occupancy</div>
          <div className="v">{live ? `${s.occupancyPct}%` : '—'}</div>
          <div className="m">
            {live
              ? `${s.letUnits} of ${s.totalUnits} unit${s.totalUnits === 1 ? '' : 's'} let · ${s.propertyCount} propert${s.propertyCount === 1 ? 'y' : 'ies'}`
              : 'no units under management'}
          </div>
        </Kpi>
      </Kpis>

      {s.pendingApprovalCount > 0 && (
        <Notice $warn>
          <FaExclamationTriangle />
          <div>
            <strong>{s.pendingApprovalCount} cost{s.pendingApprovalCount === 1 ? '' : 's'} need your approval</strong>
            {' '}({money(s.pendingApprovalValue, currency)}). Work is on hold until you decide.
            <Actions>
              <Btn onClick={() => onGo(MANAGE_MAINTENANCE_URL)}>Review now <FaArrowRight size={11} /></Btn>
            </Actions>
          </div>
        </Notice>
      )}

      <Card>
        <CardHead>
          <CardTitle><FaChartPie /> Where your rent went</CardTitle>
          <CardNote>LAST 12 MONTHS</CardNote>
        </CardHead>
        <RentFlowChart series={series} currency={currency} />
      </Card>

      <Card>
        <CardHead>
          <CardTitle><FaMoneyBillWave /> Next payment out</CardTitle>
          {next && <Pill $tone={PAYOUT_STATUS_TONE[next.status]}>{PAYOUT_STATUS_LABEL[next.status]}</Pill>}
        </CardHead>
        {next ? (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-green-ink)' }}>
              {money(next.net_amount, next.currency || currency)}
            </div>
            <CardNote style={{ marginTop: '0.4rem' }}>
              {next.ref} · scheduled {shortDate(next.scheduled_for)} · covers {shortDate(next.period_start)} – {shortDate(next.period_end)}
            </CardNote>
            <Actions>
              <Btn $ghost onClick={() => onGo(MANAGE_COLLECTIONS_URL)}>See the statement <FaArrowRight size={11} /></Btn>
            </Actions>
          </>
        ) : s.lastPayout ? (
          <>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
              Nothing scheduled right now. Your last payment was <strong>{money(s.lastPayout.net_amount, s.lastPayout.currency || currency)}</strong> on {shortDate(s.lastPayout.paid_on)}.
            </div>
            <Actions>
              <Btn $ghost onClick={() => onGo(MANAGE_COLLECTIONS_URL)}>Payment history <FaArrowRight size={11} /></Btn>
            </Actions>
          </>
        ) : (
          <Empty>No payments yet. Once rent clears, your statement and remittance appear here.</Empty>
        )}
      </Card>

      <Card>
        <CardHead>
          <CardTitle><FaRegClock /> Rent due next</CardTitle>
          <CardNote>{data?.upcomingRent?.length || 0} SCHEDULED</CardNote>
        </CardHead>
        {data?.upcomingRent?.length ? data.upcomingRent.map((c) => (
          <Row key={c.id}>
            <div>
              <div className="t">{c.period_label || 'Rent'}</div>
              <div className="s">due {shortDate(c.due_date)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Pill $tone={RENT_STATUS_TONE[c.status]}>{RENT_STATUS_LABEL[c.status]}</Pill>
              <span className="amt">{money(c.amount, c.currency || currency)}</span>
            </div>
          </Row>
        )) : <Empty>No rent scheduled yet.</Empty>}
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHead><CardTitle><FaTools /> Waiting on you</CardTitle></CardHead>
          {pending.slice(0, 3).map((e) => (
            <Row key={e.id}>
              <div>
                <div className="t">{EXPENSE_CATEGORY_LABEL[e.category] || e.category}{e.vendor ? ` · ${e.vendor}` : ''}</div>
                <div className="s">{shortDate(e.incurred_on)}</div>
              </div>
              <span className="amt">{money(e.amount, e.currency || currency)}</span>
            </Row>
          ))}
          <Actions><Btn onClick={() => onGo(MANAGE_MAINTENANCE_URL)}>Review all <FaArrowRight size={11} /></Btn></Actions>
        </Card>
      )}

      {live && (
        <Card>
          <CardHead><CardTitle><FaRegCompass /> Your management plan</CardTitle></CardHead>
          <p style={{ color: 'var(--color-ink-muted)', lineHeight: 1.55, margin: '0 0 0.25rem', fontSize: '0.94rem' }}>
            Portfolio changed, or the property is doing something different now? Re-run onboarding and
            we will re-check which plan fits.
          </p>
          <Actions><Btn $ghost onClick={onStartOnboarding}>Re-run onboarding <FaArrowRight size={11} /></Btn></Actions>
        </Card>
      )}
    </>
  );
}

export function PaymentsOut({ data, email, onRefresh }) {
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!openId) { setDetail(null); return undefined; }
    setDetail(null);
    api.management.payout(openId, email)
      .then((d) => { if (active) setDetail(d); })
      .catch((err) => { if (active) setError(err?.message || 'Could not load that statement.'); });
    return () => { active = false; };
  }, [openId, email]);

  const payouts = data.payouts || [];
  const paid = payouts.filter((p) => p.status === 'paid');
  const totalPaid = paid.reduce((sum, p) => sum + Number(p.net_amount || 0), 0);
  const currency = portalCurrency(data);

  if (openId) {
    return (
      <Card>
        <BackBtn onClick={() => setOpenId(null)}><FaChevronLeft size={10} /> All payments</BackBtn>
        {!detail ? <Empty>Loading statement…</Empty> : (
          <>
            <CardHead>
              <CardTitle><FaMoneyBillWave /> Statement {detail.payout.ref}</CardTitle>
              <Pill $tone={PAYOUT_STATUS_TONE[detail.payout.status]}>{PAYOUT_STATUS_LABEL[detail.payout.status]}</Pill>
            </CardHead>
            <CardNote style={{ marginBottom: '1.25rem' }}>
              {shortDate(detail.payout.period_start)} – {shortDate(detail.payout.period_end)} ·{' '}
              {detail.payout.address}
              {detail.payout.paid_on ? ` · paid ${shortDate(detail.payout.paid_on)}` : ''}
              {detail.payout.bank_ref ? ` · ref ${detail.payout.bank_ref}` : ''}
            </CardNote>

            <Table>
              <table>
                <tbody>
                  <tr><td>Rent collected</td><td className="num">{money(detail.payout.gross_rent, detail.payout.currency)}</td></tr>
                  <tr><td>Management fee · {Number(detail.payout.fee_pct || 0)}%</td><td className="num">−{money(detail.payout.fee_amount, detail.payout.currency)}</td></tr>
                  <tr><td>VAT on fee</td><td className="num">−{money(detail.payout.vat_amount, detail.payout.currency)}</td></tr>
                  <tr><td>Property costs</td><td className="num">−{money(detail.payout.expense_amount, detail.payout.currency)}</td></tr>
                  {Number(detail.payout.adjustment) !== 0 && (
                    <tr><td>Balance brought forward</td><td className="num">{money(detail.payout.adjustment, detail.payout.currency)}</td></tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: 700 }}>Paid to you</td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--color-green-ink)' }}>{money(detail.payout.net_amount, detail.payout.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </Table>

            {detail.rentLines?.length > 0 && (
              <>
                <CardTitle style={{ fontSize: '1rem', margin: '1.75rem 0 0.75rem' }}>Rent received</CardTitle>
                <Table>
                  <table>
                    <thead><tr><th>Period</th><th>Received</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      {detail.rentLines.map((r) => (
                        <tr key={r.id}>
                          <td>{r.period_label || 'Rent'}</td>
                          <td>{shortDate(r.received_on)}</td>
                          <td className="num">{money(r.amount_received, r.currency || detail.payout.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Table>
              </>
            )}

            {detail.expenseLines?.length > 0 && (
              <>
                <CardTitle style={{ fontSize: '1rem', margin: '1.75rem 0 0.75rem' }}>Costs deducted</CardTitle>
                <Table>
                  <table>
                    <thead><tr><th>Cost</th><th>Date</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      {detail.expenseLines.map((e) => (
                        <tr key={e.id}>
                          <td>
                            {EXPENSE_CATEGORY_LABEL[e.category] || e.category}
                            {e.vendor ? ` · ${e.vendor}` : ''}
                            {e.receipt_url ? <> · <a href={e.receipt_url} target="_blank" rel="noreferrer">receipt</a></> : null}
                          </td>
                          <td>{shortDate(e.incurred_on)}</td>
                          <td className="num">{money(e.amount, e.currency || detail.payout.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Table>
              </>
            )}

            <Actions>
              <Btn $ghost onClick={() => window.print()}><FaDownload size={11} /> Save as PDF</Btn>
            </Actions>
          </>
        )}
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    );
  }

  return (
    <>
      <Kpis>
        <Kpi $tone="var(--color-green-ink)">
          <div className="k">Paid out, all time</div>
          <div className="v">{money(totalPaid, currency)}</div>
          <div className="m">across {paid.length} payment{paid.length === 1 ? '' : 's'}</div>
        </Kpi>
        <Kpi>
          <div className="k">Next payment</div>
          <div className="v">{data.summary?.nextPayout ? money(data.summary.nextPayout.net_amount, data.summary.nextPayout.currency || currency) : '—'}</div>
          <div className="m">
            {data.summary?.nextPayout ? `scheduled ${shortDate(data.summary.nextPayout.scheduled_for)}` : 'nothing scheduled'}
          </div>
        </Kpi>
        <Kpi>
          <div className="k">Fees & VAT</div>
          <div className="v">{money(data.summary?.feesCharged12m, currency)}</div>
          <div className="m">last 12 months</div>
        </Kpi>
      </Kpis>

      <Card>
        <CardHead>
          <CardTitle><FaMoneyBillWave /> Payments out</CardTitle>
          <CardNote>NEWEST FIRST</CardNote>
        </CardHead>
        {payouts.length ? payouts.map((p) => (
          <ClickRow key={p.id} onClick={() => setOpenId(p.id)}>
            <div>
              <div className="t">{money(p.net_amount, p.currency || currency)}</div>
              <div className="s">
                {p.ref} · {shortDate(p.period_start)} – {shortDate(p.period_end)}
                {p.paid_on ? ` · paid ${shortDate(p.paid_on)}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Pill $tone={PAYOUT_STATUS_TONE[p.status]}>{PAYOUT_STATUS_LABEL[p.status]}</Pill>
              <FaArrowRight size={11} color="var(--color-ink-faint)" />
            </div>
          </ClickRow>
        )) : (
          <Empty>
            No payments yet. Once your tenant&apos;s rent clears, we raise a statement, net off the fee and costs,
            and remit the balance on your payout cycle.
          </Empty>
        )}
        {onRefresh && payouts.length > 0 && (
          <Actions><Btn $ghost onClick={onRefresh}>Refresh</Btn></Actions>
        )}
      </Card>
    </>
  );
}

export function Finance({ data, email, propertyId }) {
  const [months, setMonths] = useState(12);
  const [finance, setFinance] = useState(data.finance);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setFinance(data.finance); setMonths(12); }, [data.finance]);

  const changeMonths = async (next) => {
    setMonths(next);
    setLoading(true);
    try {
      setFinance(await api.management.finance(email, { propertyId, months: next }));
    } catch {
      /* keep the previous window on failure */
    } finally {
      setLoading(false);
    }
  };

  const totals = finance.totals;
  const maxCost = Math.max(1, ...finance.byCategory.map((c) => c.amount));
  const takeRate = totals.rent > 0 ? Math.round((totals.fees / totals.rent) * 100) : 0;
  const costRate = totals.rent > 0 ? Math.round((totals.costs / totals.rent) * 100) : 0;
  const currency = portalCurrency(data);

  return (
    <>
      <Kpis>
        <Kpi>
          <div className="k">Rent collected</div>
          <div className="v">{money(totals.rent, currency)}</div>
          <div className="m">over {months} months</div>
        </Kpi>
        <Kpi $tone="#0369a1">
          <div className="k">Fees &amp; VAT</div>
          <div className="v">{money(totals.fees, currency)}</div>
          <div className="m">{takeRate}% of rent collected</div>
        </Kpi>
        <Kpi $tone="#b45309">
          <div className="k">Property costs</div>
          <div className="v">{money(totals.costs, currency)}</div>
          <div className="m">{costRate}% of rent collected</div>
        </Kpi>
        <Kpi $tone="var(--color-green-ink)">
          <div className="k">Net to you</div>
          <div className="v">{money(totals.net, currency)}</div>
          <div className="m">{money(totals.remitted, currency)} remitted so far</div>
        </Kpi>
      </Kpis>

      <Card>
        <CardHead>
          <CardTitle><FaChartPie /> Rent, fees and costs</CardTitle>
          <Toggle>
            {[6, 12, 24].map((m) => (
              <ToggleBtn key={m} $on={months === m} onClick={() => changeMonths(m)} disabled={loading}>
                {m}m
              </ToggleBtn>
            ))}
          </Toggle>
        </CardHead>
        <RentFlowChart series={finance.series} currency={currency} />
      </Card>

      <Card>
        <CardHead>
          <CardTitle><FaTools /> What the costs were</CardTitle>
          <CardNote>{months} MONTHS</CardNote>
        </CardHead>
        {finance.byCategory.length ? (
          <CostBars>
            {finance.byCategory.map((c) => (
              <div className="r" key={c.id}>
                <span className="lab">{c.label}</span>
                <span className="amt">{money(c.amount, currency)}</span>
                <span className="track"><span className="fill" style={{ width: `${Math.max(3, (c.amount / maxCost) * 100)}%` }} /></span>
              </div>
            ))}
          </CostBars>
        ) : <Empty>No costs recorded in this window.</Empty>}
      </Card>
    </>
  );
}

/**
 * Who has applied for the owner's homes and how each one's screening
 * stands: identity, income, a reference and a previous landlord. The owner
 * sees the checks and the stage, never who the applicant is — that stays
 * with the desk until they become the tenant.
 */
export function Applicants({ data }) {
  const applicants = data.applicants || [];
  return (
    <>
      <Notice>
        <FaUserCheck />
        <div>
          <b>Every applicant is checked before we recommend them.</b> We confirm their identity, income or work,
          a reference and, where they have one, their last landlord. You see each result here as we go.
        </div>
      </Notice>
      <Card>
        <CardHead>
          <CardTitle><FaUserCheck /> Applicants</CardTitle>
          <CardNote>{applicants.length} IN PROGRESS</CardNote>
        </CardHead>
        {applicants.length ? applicants.map((a) => (
          <Row key={a.id} style={{ flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: '1 1 320px' }}>
              <div className="t">Applicant {a.ref}{a.unit_label ? ` · ${a.unit_label}` : ''}</div>
              <div className="s">
                For {a.listing_title}
                {a.move_in_date ? ` · wants to move in ${shortDate(a.move_in_date)}` : ''}
                {a.household_size ? ` · household of ${a.household_size}` : ''}
                {' · '}applied {shortDate(a.created_at)}
              </div>
              <ScreeningChecks screening={a.screening} />
            </div>
            <Pill $tone={a.status === 'approved' || a.status === 'let' ? 'good' : a.status === 'declined' ? 'warn' : 'info'}>
              {APPLICATION_STATUS_LABEL[a.status] || a.status}
            </Pill>
          </Row>
        )) : (
          <Empty>No applicants yet. When someone applies for one of your homes, their checks appear here.</Empty>
        )}
      </Card>
    </>
  );
}

/**
 * Move-in, routine and move-out inspections of the owner's homes: when we
 * are visiting, what we found, and the report.
 */
export function Inspections({ data }) {
  const inspections = data.inspections || [];
  const next = inspections
    .filter((i) => i.status === 'scheduled' && i.scheduled_for)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))[0];
  return (
    <>
      {next && (
        <Notice>
          <FaRegClock />
          <div><b>Next visit: {INSPECTION_KIND_LABEL[next.kind].toLowerCase()} on {shortDate(next.scheduled_for)}.</b> We let the tenant know beforehand.</div>
        </Notice>
      )}
      <Card>
        <CardHead>
          <CardTitle><FaClipboardCheck /> Inspections</CardTitle>
          <CardNote>{inspections.filter((i) => i.status === 'completed').length} DONE</CardNote>
        </CardHead>
        {inspections.length ? inspections.map((i) => (
          <Row key={i.id} style={{ flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: '1 1 320px' }}>
              <div className="t">{INSPECTION_KIND_LABEL[i.kind]}{i.unit_label ? ` · ${i.unit_label}` : ''}</div>
              <div className="s">
                {i.status === 'completed' ? `Done ${shortDate(i.completed_at || i.scheduled_for)}` : i.scheduled_for ? `Booked for ${shortDate(i.scheduled_for)}` : 'Date to be agreed'}
                {i.condition ? ` · ${INSPECTION_CONDITION_LABEL[i.condition]}` : ''}
              </div>
              {i.summary && <div className="s" style={{ marginTop: '0.3rem', color: 'var(--color-ink)' }}>{i.summary}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {i.report_url && <a href={i.report_url} target="_blank" rel="noreferrer" style={{ fontWeight: 650, color: 'var(--color-green-deep)' }}>Report</a>}
              <Pill $tone={i.status === 'completed' ? (i.condition === 'needs_work' ? 'warn' : 'good') : i.status === 'cancelled' ? undefined : 'info'}>
                {INSPECTION_STATUS_LABEL[i.status]}
              </Pill>
            </div>
          </Row>
        )) : (
          <Empty>No inspections yet. On Full Management we inspect at move-in, every few months, and at move-out, with photos.</Empty>
        )}
      </Card>
    </>
  );
}

export function Tenancies({ data }) {
  const tenancies = data.tenancies || [];
  const charges = data.rentCharges || [];

  return (
    <>
      {/* EasyMoveZone runs the tenancy; owners and tenants never need to deal with each other. */}
      <Notice>
        <FaKey />
        <div>
          <b>We deal with your tenants, so you don't have to.</b> Vetting, rent, repairs, renewals and move-outs all
          go through your EasyMoveZone manager. Tenants contact us, not you — ask your manager anything about a tenancy.
        </div>
      </Notice>
      <Card>
        <CardHead>
          <CardTitle><FaKey /> Tenancies</CardTitle>
          <CardNote>{tenancies.filter((t) => t.status === 'active').length} ACTIVE</CardNote>
        </CardHead>
        {tenancies.length ? tenancies.map((t) => (
          <Row key={t.id}>
            <div>
              <div className="t">{t.tenant_name || 'Tenant to be confirmed'}{t.unit_label ? ` · ${t.unit_label}` : ''}</div>
              <div className="s">
                {shortDate(t.start_date)} – {t.end_date ? shortDate(t.end_date) : 'open'}
                {' · '}{money(annualiseRent(t.rent_amount, t.rent_frequency), t.currency)}/yr
                {t.deposit ? ` · deposit ${money(t.deposit, t.currency)}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Pill $tone={TENANCY_STATUS_TONE[t.status]}>{TENANCY_STATUS_LABEL[t.status]}</Pill>
              <span className="amt">{money(t.rent_amount, t.currency)}<span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-ink-faint)' }}> {RENT_FREQUENCY_LABEL[t.rent_frequency]}</span></span>
            </div>
          </Row>
        )) : (
          <Empty>No tenancy yet. Once we let the property, the tenant, term and rent appear here.</Empty>
        )}
      </Card>

      <Card>
        <CardHead>
          <CardTitle><FaRegClock /> Rent ledger</CardTitle>
          <CardNote>MOST RECENT FIRST</CardNote>
        </CardHead>
        {charges.length ? (
          <Table>
            <table>
              <thead>
                <tr>
                  <th>Period</th><th>Due</th><th>Status</th>
                  <th className="num">Due</th><th className="num">Received</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((c) => (
                  <tr key={c.id}>
                    <td>{c.period_label || 'Rent'}</td>
                    <td>{shortDate(c.due_date)}</td>
                    <td><Pill $tone={RENT_STATUS_TONE[c.status]}>{RENT_STATUS_LABEL[c.status]}</Pill></td>
                    <td className="num">{money(c.amount, c.currency)}</td>
                    <td className="num">{money(c.amount_received, c.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        ) : <Empty>No rent has been raised yet.</Empty>}
      </Card>
    </>
  );
}

export function Maintenance({ data, email, onRefresh }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const expenses = data.expenses || [];
  const pending = expenses.filter((e) => e.status === 'pending');
  const history = expenses.filter((e) => e.status !== 'pending');

  const decide = async (id, decision) => {
    setBusyId(id); setError('');
    try {
      await api.management.decideExpense(id, email, decision);
      await onRefresh();
    } catch (err) {
      setError(err?.message || 'Could not record your decision.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHead>
          <CardTitle style={pending.length ? { color: '#b45309' } : undefined}>
            <FaExclamationTriangle style={pending.length ? { color: '#b45309' } : undefined} /> Needs your approval
          </CardTitle>
          <CardNote>{pending.length} WAITING</CardNote>
        </CardHead>
        {pending.length ? pending.map((e) => (
          <div key={e.id} style={{ borderBottom: '1px solid var(--color-line)', padding: '1rem 0' }}>
            <Row style={{ border: 'none', padding: 0 }}>
              <div>
                <div className="t">{EXPENSE_CATEGORY_LABEL[e.category] || e.category}{e.vendor ? ` · ${e.vendor}` : ''}</div>
                <div className="s">raised {shortDate(e.incurred_on)}</div>
              </div>
              <span className="amt">{money(e.amount, e.currency)}</span>
            </Row>
            {e.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.5, margin: '0.6rem 0 0' }}>
                {e.description}
              </p>
            )}
            <Actions>
              <Btn disabled={busyId === e.id} onClick={() => decide(e.id, 'approve')}>
                <FaCheckCircle size={11} /> {busyId === e.id ? 'Saving…' : 'Approve'}
              </Btn>
              <Btn $ghost disabled={busyId === e.id} onClick={() => decide(e.id, 'reject')}>
                <FaTimes size={11} /> Decline
              </Btn>
              {e.receipt_url && (
                <Btn $ghost as="a" href={e.receipt_url} target="_blank" rel="noreferrer">Quote / receipt</Btn>
              )}
            </Actions>
          </div>
        )) : (
          <Empty>Nothing waiting on you. Costs above your approval limit land here before any work starts.</Empty>
        )}
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>

      <TenantReports data={data} onRefresh={onRefresh} />

      <Card>
        <CardHead>
          <CardTitle><FaTools /> Cost history</CardTitle>
          <CardNote>{history.length} ITEM{history.length === 1 ? '' : 'S'}</CardNote>
        </CardHead>
        {history.length ? (
          <Table>
            <table>
              <thead>
                <tr><th>Cost</th><th>Date</th><th>Status</th><th className="num">Amount</th></tr>
              </thead>
              <tbody>
                {history.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {EXPENSE_CATEGORY_LABEL[e.category] || e.category}
                      {e.vendor ? ` · ${e.vendor}` : ''}
                      {e.receipt_url ? <> · <a href={e.receipt_url} target="_blank" rel="noreferrer">receipt</a></> : null}
                    </td>
                    <td>{shortDate(e.incurred_on)}</td>
                    <td><Pill $tone={EXPENSE_STATUS_TONE[e.status]}>{EXPENSE_STATUS_LABEL[e.status]}</Pill></td>
                    <td className="num">{money(e.amount, e.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        ) : <Empty>No costs recorded yet.</Empty>}
      </Card>
    </>
  );
}

/**
 * What tenants reported through their portal: repairs and notices to leave,
 * with where the desk has got to. No tenant contact details — the desk deals
 * with the tenant; anything that costs money still arrives above for approval.
 */
function TenantReports({ data, onRefresh }) {
  const reports = data.tenantRequests || [];
  const [openId, setOpenId] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!reports.length) return null;

  const send = async (id) => {
    if (!note.trim()) return;
    setBusy(true); setError('');
    try {
      await api.management.noteOnTenantRequest(id, note.trim());
      setNote('');
      await onRefresh?.();
    } catch (err) {
      setError(err?.message || 'Could not send your note.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHead>
        <CardTitle><FaKey /> Reported by your tenants</CardTitle>
        <CardNote>{reports.length} REPORT{reports.length === 1 ? '' : 'S'}</CardNote>
      </CardHead>
      {reports.map((q) => (
        <div key={q.id} style={{ borderBottom: '1px solid var(--color-line)', padding: '0.85rem 0' }}>
          <Row style={{ border: 'none', padding: 0 }}>
            <div>
              <div className="t">{q.title}</div>
              <div className="s">
                {TENANT_CATEGORY_LABEL[q.category] || q.category}
                {q.unit_label ? ` · ${q.unit_label}` : ''}
                {q.location ? ` · ${q.location}` : ''}
                {q.category === 'repair' ? ` · ${TENANT_URGENCY_LABEL[q.urgency] || q.urgency}` : ''}
                {' · '}{shortDate(q.created_at)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Pill $tone={TENANT_REQUEST_STATUS_TONE[q.status]}>{TENANT_REQUEST_STATUS_LABEL[q.status] || q.status}</Pill>
              <Btn $ghost style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => { setOpenId(openId === q.id ? null : q.id); setNote(''); setError(''); }}>
                {openId === q.id ? 'Hide' : `Conversation${q.messages?.length ? ` (${q.messages.length})` : ''}`}
              </Btn>
            </div>
          </Row>
          {openId === q.id && (
            <div style={{ marginTop: '0.7rem', display: 'grid', gap: '0.45rem' }}>
              {(q.messages || []).map((m) => (
                <div key={m.id} style={{ fontSize: '0.86rem', padding: '0.5rem 0.7rem', borderRadius: 10, background: m.sender === 'admin' ? 'var(--color-green-wash)' : m.sender === 'owner' ? 'rgba(3,105,161,0.08)' : 'var(--color-bg-sunken)' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-ink-faint)' }}>
                    {m.sender === 'admin' ? 'Your manager' : m.sender === 'owner' ? 'You (to your manager only)' : 'Tenant'} · {shortDate(m.created_at)}
                  </div>
                  {m.body}
                </div>
              ))}
              {!q.messages?.length && <Empty style={{ padding: '0.9rem' }}>No messages yet.</Empty>}
              <Input
                as="textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A note for your manager — e.g. a contractor you trust. Your tenant does not see it."
                style={{ minHeight: 64, resize: 'vertical' }}
              />
              <Actions style={{ marginTop: 0 }}>
                <Btn disabled={busy || !note.trim()} onClick={() => send(q.id)}>{busy ? 'Sending…' : 'Send to my manager'}</Btn>
              </Actions>
              {error && <ErrorMsg>{error}</ErrorMsg>}
            </div>
          )}
        </div>
      ))}
    </Card>
  );
}

export function Documents({ data }) {
  const docs = data.documents || [];
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  /**
   * Files sit in private storage, so the raw URL would not load: ask the API
   * for a short-lived link. The tab opens inside the click (so pop-up
   * blockers allow it) and is pointed at the link once it arrives.
   */
  const open = async (id) => {
    setBusyId(id); setError('');
    const win = window.open('', '_blank');
    try {
      const url = await api.management.documentUrl(id);
      if (win) win.location.href = url; else window.location.href = url;
    } catch (err) {
      if (win) win.close();
      setError(err?.message || 'Could not open that document.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHead>
        <CardTitle><FaFileAlt /> Documents</CardTitle>
        <CardNote>{docs.length} FILE{docs.length === 1 ? '' : 'S'}</CardNote>
      </CardHead>
      {docs.length ? docs.map((d) => (
        <Row key={d.id}>
          <div>
            <div className="t">{d.name}</div>
            <div className="s">{d.kind} · added {shortDate(d.created_at)}</div>
          </div>
          <Btn $ghost disabled={busyId === d.id} onClick={() => open(d.id)}>{busyId === d.id ? 'Opening…' : 'Open'}</Btn>
        </Row>
      )) : (
        <Empty>
          Nothing filed yet. Tenancy agreements, inventories, receipts and compliance certificates appear here as
          your manager produces them.
        </Empty>
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Card>
  );
}

export function Settings({ data, email, propertyId, onRefresh }) {
  const properties = data.properties || [];
  const target = propertyId
    ? properties.find((p) => p.id === propertyId)
    : properties.length === 1 ? properties[0] : null;

  const [form, setForm] = useState({ bank: '', accountName: '', accountNumber: '', cycle: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      bank: target?.payout_bank || '',
      accountName: target?.payout_account_name || '',
      accountNumber: '',
      cycle: target?.payout_cycle || 'monthly',
    });
    setSaved(false);
  }, [target]);

  if (!target) {
    return (
      <Card>
        <CardHead><CardTitle><FaUniversity /> Payment details</CardTitle></CardHead>
        <Empty>Pick a single property above to set where its net rent is sent.</Empty>
      </Card>
    );
  }

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.management.savePayoutMethod(target.id, email, form);
      setSaved(true);
      await onRefresh();
    } catch (err) {
      setError(err?.message || 'Could not save your payment details.');
    } finally {
      setSaving(false);
    }
  };

  const plan = PLAN_BY_ID[target.plan];

  return (
    <>
      <Card>
        <CardHead>
          <CardTitle><FaUniversity /> Where we send your rent</CardTitle>
          {target.payout_account_last4 && <Pill $tone="good">•••• {target.payout_account_last4}</Pill>}
        </CardHead>
        <Notice>
          <FaCheckCircle />
          <div>
            We store only your bank, the account name and the last four digits. Your manager confirms the full
            number with you directly before the first payment.
          </div>
        </Notice>
        <div style={{ marginTop: '1.25rem' }}>
          <TwoCol>
            <Field>
              <Label>Bank</Label>
              <Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="e.g. GTBank" />
            </Field>
            <Field>
              <Label>Account name</Label>
              <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="As it appears on the account" />
            </Field>
          </TwoCol>
          <TwoCol>
            <Field>
              <Label>Account number</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder={target.payout_account_last4 ? `•••••• ${target.payout_account_last4}` : '10 digits'}
              />
            </Field>
            <Field>
              <Label>Payout cycle</Label>
              <Select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })}>
                {PAYOUT_CYCLES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
          </TwoCol>
          <Actions>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save payment details'}</Btn>
            {saved && <Pill $tone="good"><FaCheckCircle size={9} /> Saved</Pill>}
          </Actions>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </div>
      </Card>

      <Card>
        <CardHead><CardTitle><FaHome /> Management terms</CardTitle></CardHead>
        <Table>
          <table>
            <tbody>
              <tr><td>Property</td><td className="num">{target.address}</td></tr>
              <tr><td>Plan</td><td className="num">{plan?.name || target.plan}</td></tr>
              <tr>
                <td>Management fee</td>
                <td className="num">
                  {target.agreed_fee_pct != null
                    ? `${Number(target.agreed_fee_pct)}% agreed`
                    : `${target.quote?.ratePct ?? plan?.ratePct}% indicative`}
                </td>
              </tr>
              <tr><td>Repair approval limit</td><td className="num">{target.repair_limit != null ? money(target.repair_limit, target.currency) : 'Every cost needs approval'}</td></tr>
              <tr><td>Property manager</td><td className="num">{target.manager_name || 'Being assigned'}</td></tr>
              <tr><td>Status</td><td className="num">{STATUS_LABEL[target.status] || target.status}</td></tr>
            </tbody>
          </table>
        </Table>
        <Actions>
          <Btn $ghost as={Link} to={`${MANAGE_PROPERTIES_URL}?ref=${encodeURIComponent(target.ref)}`}>
            Message your manager <FaArrowRight size={11} />
          </Btn>
        </Actions>
      </Card>
    </>
  );
}

/* ─────────────────────────── Portal ─────────────────────────── */

/* ── Letting: advertising a vacant property on the Rent page ──────── */

const RENTAL_TONE = { reviewing: 'info', live: 'good', let: 'good', withdrawn: undefined };

const LetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.6rem;
  @media (max-width: 560px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  div { background: var(--color-bg-sunken); border-radius: 10px; padding: 0.55rem 0.7rem; }
  b { display: block; font-family: var(--font-display); font-size: 1.1rem; color: var(--color-ink); }
  span { font-size: 0.74rem; color: var(--color-ink-muted); }
`;

const LetProperty = styled.div`
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--color-line);
  &:last-child { border-bottom: none; padding-bottom: 0.2rem; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.8rem; flex-wrap: wrap; }
  .t { font-size: 0.95rem; font-weight: 600; color: var(--color-ink); }
  .s { font-size: 0.82rem; color: var(--color-ink-muted); margin-top: 0.2rem; line-height: 1.45; }
  .rental { margin-top: 0.75rem; }
  .rental .line { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.88rem; }
  .rental a { color: var(--color-green-deep); font-weight: 600; display: inline-flex; align-items: center; gap: 0.3rem; }
`;

/**
 * Letting activity on the dashboard: for each property that is (or may soon
 * be) empty, whether the owner lets us advertise it, and how the advertising
 * is going. Owners see interest counts, never applicants' details — the desk
 * vets them, and the chosen one appears under Tenancies.
 */
export function LettingActivity({ data, email, onRefresh }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const lettings = useMemo(() => data?.lettings || [], [data]);
  const properties = useMemo(() => {
    const all = data?.properties || [];
    const scoped = data?.scopedTo ? all.filter((p) => p.id === data.scopedTo) : all;
    return scoped.filter((p) => !['ended', 'cancelled'].includes(p.status)
      && (p.letting_status !== 'tenanted' || p.advertise_consent || lettings.some((l) => l.property_id === p.id)));
  }, [data, lettings]);

  if (!properties.length) return null;

  const toggle = async (property) => {
    const next = !property.advertise_consent;
    if (!next && !window.confirm('Stop advertising this property? Any listing on the Rent page comes down straight away.')) return;
    setBusy(property.id);
    setError('');
    try {
      await api.management.setAdvertise(property.id, email, next);
      await onRefresh?.();
    } catch (err) {
      setError(err?.message || 'Could not save that choice.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHead>
        <CardTitle><FaBullhorn /> Letting</CardTitle>
        <CardNote><Link to={RENT_URL}>THE RENT PAGE →</Link></CardNote>
      </CardHead>
      {properties.map((p) => {
        const mine = lettings.filter((l) => l.property_id === p.id);
        const open = mine.find((l) => l.status === 'live' || l.status === 'reviewing');
        return (
          <LetProperty key={p.id}>
            <div className="head">
              <div>
                <div className="t">{p.address}</div>
                <div className="s">
                  {p.advertise_consent
                    ? (open
                      ? 'You have allowed us to advertise it.'
                      : 'You have allowed us to advertise it. Your manager agrees the rent and photos with you before it goes up.')
                    : 'Not advertised. Allow it and we list it on the Rent page while it is empty — never with your name, contact details or street address.'}
                </div>
              </div>
              <Btn $ghost={p.advertise_consent} disabled={busy === p.id} onClick={() => toggle(p)}>
                {busy === p.id ? 'Saving…' : p.advertise_consent ? 'Stop advertising' : 'Allow advertising'}
              </Btn>
            </div>
            {mine.map((l) => (
              <div className="rental" key={l.id}>
                <div className="line">
                  <Pill $tone={RENTAL_TONE[l.status]}>{RENTAL_STATUS_LABEL[l.status] || l.status}</Pill>
                  {l.unit_label && <span>{l.unit_label}</span>}
                  {Number(l.rent) > 0 && <strong>{money(l.rent, l.currency)} / {perPeriod(l.rent_frequency)}</strong>}
                  {l.status === 'live' && l.slug && (
                    <a href={`/listings/${l.slug}`} target="_blank" rel="noopener noreferrer">View listing <FaExternalLinkAlt size={10} /></a>
                  )}
                </div>
                {(l.status === 'live' || l.status === 'let') && (
                  <LetGrid>
                    <div><b>{l.applications}</b><span>applications</span></div>
                    <div><b>{l.enquiries || 0}</b><span>enquiries</span></div>
                    <div><b>{l.viewings}</b><span>viewings booked</span></div>
                    <div><b>{l.shortlisted}</b><span>being checked</span></div>
                  </LetGrid>
                )}
              </div>
            ))}
          </LetProperty>
        );
      })}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Card>
  );
}
