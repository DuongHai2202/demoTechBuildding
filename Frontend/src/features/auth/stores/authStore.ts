import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '../../users/types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // Tracking hydration state

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        _hasHydrated: false,

        setTokens: (accessToken, refreshToken) =>
          set({ accessToken, refreshToken, isAuthenticated: true }),

        setUser: (user) => set({ user }),

        logout: () =>
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          }),

        setHasHydrated: (state) => set({ _hasHydrated: state }),
      }),
      {
        name: 'techbuildding-auth',
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  )
);
