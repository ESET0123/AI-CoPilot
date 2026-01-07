import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';

type LayoutContextType = {
  mobileOpened: boolean;
  toggleMobile: () => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    return {
      mobileOpened: false,
      toggleMobile: () => { },
    };
  }
  return context;
};

export default function AppShellLayout({ children, }: { children: React.ReactNode; }) {
  const [opened, { toggle }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LayoutContext.Provider value={{ mobileOpened: opened, toggleMobile: toggle }}>
      <AppShell
        navbar={{
          width: collapsed ? 60 : 260,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding={0}
      >
        <AppShell.Navbar>
          <Sidebar collapsed={collapsed} onToggle={setCollapsed} />
        </AppShell.Navbar>

        <AppShell.Main
          style={{height: '100dvh', display: 'flex', flexDirection: 'column' }} >
          {children}
        </AppShell.Main>
      </AppShell>
    </LayoutContext.Provider>
  );
}
