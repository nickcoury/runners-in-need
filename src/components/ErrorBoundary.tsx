import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
            Something went wrong. Please try refreshing the page.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
