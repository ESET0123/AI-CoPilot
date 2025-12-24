import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <HeaderBar />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar collapsed={false} onToggle={() => { }} />
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
