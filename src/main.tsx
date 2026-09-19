import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[BlueButton] Uncaught error in application:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.hash = '';
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              !
            </div>
            <h1 className="text-xl font-bold text-slate-900">เกิดข้อผิดพลาดในการโหลด</h1>
            <p className="text-xs text-slate-500 font-mono bg-slate-100 p-3 rounded-xl break-all text-left">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              รีเซ็ตข้อมูลและโหลดใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
