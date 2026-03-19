import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { useThemeEffect } from './hooks/useThemeEffect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useThemeEffect();
  return <>{children}</>;
}

import { Toaster } from 'sonner';

export function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <Toaster position="top-right" richColors closeButton expand={true} />
            <AppRoutes />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
