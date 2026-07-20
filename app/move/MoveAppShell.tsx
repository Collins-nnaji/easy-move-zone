"use client";

import { ChevronRight } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";

type Tab = { label: string; shortLabel?: string; go: string; screens?: string[] };

type MoveAppShellProps = {
  showNav: boolean;
  tabs: Tab[];
  screen: string;
  onNavigate: (screen: string) => void;
  /** Breadcrumb root — e.g. "Driver" or "Fleet" */
  appLabel?: string;
  /** Logo / breadcrumb home href */
  appHomeHref?: string;
  destCity?: string;
  destCountry?: string;
  stayLabel?: string;
  modeName?: string;
  movePct?: number;
  moveDone?: number;
  moveTotal?: number;
  meterLabel?: string;
  meterSub?: string;
  isFlowScreen?: boolean;
  children: React.ReactNode;
  modals: React.ReactNode;
};

export function MoveAppShell({
  showNav,
  tabs,
  screen,
  onNavigate,
  appLabel = "App",
  appHomeHref = "/move",
  destCity,
  destCountry,
  stayLabel,
  modeName,
  movePct = 0,
  moveDone = 0,
  moveTotal = 0,
  meterLabel = "Move Meter",
  meterSub,
  isFlowScreen = false,
  children,
  modals,
}: MoveAppShellProps) {
  const activeTab = tabs.find((t) => (t.screens ? t.screens.includes(screen) : screen === t.go));
  const crumbLabel = activeTab?.shortLabel ?? activeTab?.label ?? appLabel;

  return (
    <div className="move-root">
      <div className="move-shell">
        {showNav && (
          <aside className="move-sidebar">
            <div className="move-sidebar__brand">
              <SiteLogo href={appHomeHref} height={28} />
            </div>

            {destCity && (
              <div className="move-sidebar__context">
                <div className="move-sidebar__context-label">Your destination</div>
                <div className="move-sidebar__context-city">{destCity}</div>
                <div className="move-sidebar__context-meta">
                  {destCountry}
                  {stayLabel && modeName ? ` · ${stayLabel} · ${modeName}` : ""}
                </div>
              </div>
            )}

            <nav className="move-sidebar__nav" aria-label="Move app">
              {tabs.map((t) => {
                const active = t.screens ? t.screens.includes(screen) : screen === t.go;
                return (
                  <button
                    key={t.label}
                    type="button"
                    className={`move-sidebar__tab${active ? " move-sidebar__tab--active" : ""}`}
                    onClick={() => onNavigate(t.go)}
                  >
                    <span className="move-sidebar__tab-dot" aria-hidden />
                    <span className="move-sidebar__tab-label">{t.label}</span>
                  </button>
                );
              })}
            </nav>

            {moveTotal > 0 && (
              <div className="move-sidebar__meter">
                <div className="move-sidebar__meter-label">{meterLabel}</div>
                <div className="move-sidebar__meter-value">{movePct}%</div>
                <div className="move-sidebar__meter-sub">
                  {meterSub ?? `${moveDone} of ${moveTotal} steps done`}
                </div>
              </div>
            )}
          </aside>
        )}

        <div className="move-main">
          {showNav && (
            <header className="move-mobile-top">
              <div className="move-mobile-top__row">
                <SiteLogo href={appHomeHref} height={24} />
                <nav className="move-breadcrumb" aria-label="Breadcrumb">
                  <button
                    type="button"
                    className="move-breadcrumb__link"
                    onClick={() => onNavigate(tabs[0]?.go ?? screen)}
                  >
                    {appLabel}
                  </button>
                  <ChevronRight className="move-breadcrumb__sep" aria-hidden size={14} />
                  <span className="move-breadcrumb__current">{crumbLabel}</span>
                </nav>
              </div>
              <nav className="move-pill-nav" aria-label={`${appLabel} sections`}>
                {tabs.map((t) => {
                  const active = t.screens ? t.screens.includes(screen) : screen === t.go;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      className={`move-pill-nav__tab${active ? " move-pill-nav__tab--active" : ""}`}
                      onClick={() => onNavigate(t.go)}
                    >
                      {t.shortLabel ?? t.label}
                    </button>
                  );
                })}
              </nav>
            </header>
          )}

          <div className={`move-scroll${isFlowScreen ? " move-scroll--flow" : " move-scroll--app"}`}>
            {children}
          </div>
        </div>
      </div>

      {modals}
    </div>
  );
}
