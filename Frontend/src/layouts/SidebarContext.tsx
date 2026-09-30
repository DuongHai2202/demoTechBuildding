import { createContext, useContext } from 'react';

export interface SidebarLayoutContextValue {
  collapsed: boolean;
  toggle: () => void;
}

export const SidebarLayoutContext = createContext<SidebarLayoutContextValue>({
  collapsed: false,
  toggle: () => undefined,
});

export function useSidebarLayout() {
  return useContext(SidebarLayoutContext);
}
