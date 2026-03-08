"use client";

import { Component } from "react";

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col items-center justify-center">
          <h1 className="text-xl font-semibold text-red-400 mb-2">
            Something went wrong
          </h1>
          <pre className="text-sm text-zinc-400 max-w-2xl overflow-auto rounded-lg bg-zinc-900 p-4 mb-4">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
