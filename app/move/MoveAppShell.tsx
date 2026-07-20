"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { AppAccountMenu } from "@/components/move/AppAccountMenu";
import { softSpring, screenTransition, screenVariants } from "@/lib/motion/presets";

type Tab = { label: string; shortLabel?: string; go: string; screens?: string[] };

type MoveAppShellProps = {
  showNav: boolean;
  tabs: Tab[];
  screen: string;
  onNavigate: (screen: string) => void;
  appRole?: "driver" | "fleet";
  appLabel?: string;
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
  appRole = "driver",
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
  const reduceMotion = useReducedMotion();
  const activeTab = tabs.find((t) => (t.screens ? t.screens.includes(screen) : screen === t.go));
  const crumbLabel = activeTab?.shortLabel ?? activeTab?.label ?? appLabel;
  const contextLabel = appRole === "fleet" ? "Your operation" : "Your zone";

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
                <div className="move-sidebar__context-label">{contextLabel}</div>
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

            <div className="move-sidebar__account">
              <AppAccountMenu role={appRole} />
            </div>

            {moveTotal > 0 && (
              <div className="move-sidebar__meter">
                <div className="move-sidebar__meter-label">{meterLabel}</div>
                <motion.div
                  className="move-sidebar__meter-value"
                  key={movePct}
                  initial={reduceMotion ? false : { opacity: 0.4, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={screenTransition}
                >
                  {movePct}%
                </motion.div>
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
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={crumbLabel}
                      className="move-breadcrumb__current"
                      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {crumbLabel}
                    </motion.span>
                  </AnimatePresence>
                </nav>
                <AppAccountMenu role={appRole} compact />
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
                      {active && !reduceMotion && (
                        <motion.span
                          layoutId={`pill-active-${appRole}`}
                          className="move-pill-nav__ink"
                          transition={softSpring}
                        />
                      )}
                      <span className="move-pill-nav__text">{t.shortLabel ?? t.label}</span>
                    </button>
                  );
                })}
              </nav>
            </header>
          )}

          <div className={`move-scroll${isFlowScreen ? " move-scroll--flow" : " move-scroll--app"}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={screen}
                className="move-screen-motion"
                variants={reduceMotion ? undefined : screenVariants}
                initial={reduceMotion ? false : "initial"}
                animate="animate"
                exit={reduceMotion ? undefined : "exit"}
                transition={screenTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {modals}
    </div>
  );
}
