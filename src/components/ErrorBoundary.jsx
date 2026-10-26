import { Component } from "react";

/**
 * Top-level error boundary. Catches render/lifecycle errors anywhere in the
 * tree below it and shows a recovery UI instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Swap for a real error-reporting service (Sentry, etc.) when available.
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex flex-col items-center justify-center bg-[#fbf6ee] px-4 text-center"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
