import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { LayoutContext } from './LayoutContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <LayoutContext.Provider value={{ mobileOpened: opened, toggleMobile: toggle, hasSidebar: true }}>
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
                    style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }} >
                    {children}
                </AppShell.Main>
            </AppShell>
        </LayoutContext.Provider>
    );
}
