import { AppShell } from '@mantine/core';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShell
      padding={0}
      navbar={{
        width: collapsed ? 60 : 260,
        breakpoint: 'sm',
      }}
      styles={{
        main: {
          height: '100vh',
        },
      }}
    >
      <AppShell.Navbar>
        <Sidebar collapsed={collapsed} onToggle={setCollapsed} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
