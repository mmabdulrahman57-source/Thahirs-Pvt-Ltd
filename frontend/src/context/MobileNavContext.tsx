import { createContext, useContext, useState, type ReactNode } from 'react';

type MobileNavContextValue = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ menuOpen, setMenuOpen, toggleMenu: () => setMenuOpen(o => !o) }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error('useMobileNav must be used within MobileNavProvider');
  return ctx;
}
