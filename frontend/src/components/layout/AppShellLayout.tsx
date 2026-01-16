import { AppShell } from '@mantine/core';
import { LayoutContext } from './LayoutContext';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutContext.Provider value={{ mobileOpened: false, toggleMobile: () => { }, hasSidebar: false }}>
      <AppShell padding={0}>
        <AppShell.Main
          style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }} >
          {children}
        </AppShell.Main>
      </AppShell>
    </LayoutContext.Provider>
  );
}
