// DOM matchers (toBeInTheDocument…) for the property site's component tests.
import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Vitest runs without globals, so unmount rendered components after each test.
afterEach(() => {
  if (typeof document !== "undefined") cleanup()
})

/*
 * jsdom has no IntersectionObserver, which framer-motion's `whileInView`
 * (the property site's Reveal/Stagger helpers) needs. This stub reports
 * everything as in view so animated sections render their final state.
 */
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  class IntersectionObserverStub {
    callback: IntersectionObserverCallback
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      this.callback(
        [{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: target.getBoundingClientRect() } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  Object.assign(window, { IntersectionObserver: IntersectionObserverStub })
  Object.assign(globalThis, { IntersectionObserver: IntersectionObserverStub })
}
