"use client";

import { SiteLogo } from "@/components/brand/SiteLogo";

type Tab = { label: string; go: string; screens?: string[] };

type MoveAppShellProps = {
  showNav: boolean;
  tabs: Tab[];
  screen: string;
  onNavigate: (screen: string) => void;
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
  return (
    <div className="move-root">
      <div className="move-shell">
        {showNav && (
          <aside className="move-sidebar">
            <div className="move-sidebar__brand">
              <SiteLogo href="/move/shifts" height={28} />
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
          <div className={`move-scroll${isFlowScreen ? " move-scroll--flow" : " move-scroll--app"}`}>
            {children}
          </div>

          {showNav && (
            <nav className="move-bottom-nav" aria-label="Move app">
              {tabs.map((t) => {
                const active = t.screens ? t.screens.includes(screen) : screen === t.go;
                return (
                  <button
                    key={t.label}
                    type="button"
                    className={`move-bottom-nav__tab${active ? " move-bottom-nav__tab--active" : ""}`}
                    onClick={() => onNavigate(t.go)}
                  >
                    <span className="move-bottom-nav__dot" aria-hidden />
                    <span className="move-bottom-nav__label">{t.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {modals}
    </div>
  );
}
