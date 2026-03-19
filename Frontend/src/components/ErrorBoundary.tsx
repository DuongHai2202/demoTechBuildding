import { type ReactNode, useCallback } from 'react';

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // error is unknown in FallbackProps, so we format it safely
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="rounded-xl bg-[var(--color-danger-bg)] p-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-[var(--color-danger)]">Đã xảy ra lỗi</h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{errorMessage}</p>
        <button
          onClick={resetErrorBoundary}
          className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ReactErrorBoundary>
  );
}
