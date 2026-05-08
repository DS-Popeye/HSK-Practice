import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('HSK Practice crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="errorBoundary">
          <h1>Something went wrong</h1>
          <p>The app hit a runtime error instead of loading this page.</p>
          <pre>{this.state.error.message}</pre>
          <button type="button" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
