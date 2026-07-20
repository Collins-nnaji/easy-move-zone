"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      console.error(error, info);
      return;
    }
    try {
      const url = new URL(dsn);
      const publicKey = url.username;
      const projectId = url.pathname.replace(/^\//, "");
      void fetch(`https://${url.host}/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: crypto.randomUUID().replace(/-/g, ""),
          timestamp: new Date().toISOString(),
          platform: "javascript",
          level: "error",
          exception: {
            values: [{ type: error.name, value: error.message }],
          },
          extra: { componentStack: info.componentStack },
        }),
      });
    } catch {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg p-8 text-center">
          <h1 className="text-xl font-bold text-[#1b231e]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#6e746b]">Try refreshing the page. Ops has been notified if monitoring is configured.</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-bold text-white"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
