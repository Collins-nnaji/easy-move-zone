"use client";

type Tab = { label: string; go: string; screens: readonly string[] };

type DriverAppShellProps = {
  tabs: Tab[];
  screen: string;
  onNavigate: (screen: string) => void;
  zoneName: string;
  weekEarnings: number;
  children: React.ReactNode;
  modals?: React.ReactNode;
};

export function DriverAppShell({
  tabs,
  screen,
  onNavigate,
  zoneName,
  weekEarnings,
  children,
  modals,
}: DriverAppShellProps) {
  return (
    <div className="move-root">
      <div className="move-shell">
        <aside className="move-sidebar">
          <div className="move-sidebar__brand">EasyMoveZone</div>

          <div className="move-sidebar__context">
            <div className="move-sidebar__context-label">Your zone</div>
            <div className="move-sidebar__context-city">{zoneName}</div>
            <div className="move-sidebar__context-meta">Commercial shifts · live feed</div>
          </div>

          <nav className="move-sidebar__nav" aria-label="Driver app">
            {tabs.map((t) => {
              const active = t.screens.includes(screen);
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

          <div className="move-sidebar__meter">
            <div className="move-sidebar__meter-label">Earned this week</div>
            <div className="move-sidebar__meter-value">${weekEarnings}</div>
            <div className="move-sidebar__meter-sub">Tap Wallet for instant cashout</div>
          </div>
        </aside>

        <div className="move-main">
          <div className="move-scroll move-scroll--app">
            {children}
          </div>

          <nav className="move-bottom-nav" aria-label="Driver app">
            {tabs.map((t) => {
              const active = t.screens.includes(screen);
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
        </div>
      </div>

      {modals}
    </div>
  );
}
