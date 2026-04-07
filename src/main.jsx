import React from 'react';
import { createRoot } from 'react-dom/client';
import { JobGalleryScreen } from './JobGalleryScreen.jsx';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#f4f4f5',
            color: '#18181b',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Something went wrong loading the gallery.</p>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Refresh the page. If this keeps happening, try a different browser.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <JobGalleryScreen />
    </AppErrorBoundary>
  </React.StrictMode>
);
