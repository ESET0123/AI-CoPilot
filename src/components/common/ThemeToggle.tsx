import { ActionIcon } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/theme/themeSlice';

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const scheme = useAppSelector((s) => s.theme.colorScheme);

  return (
    <ActionIcon onClick={() => dispatch(toggleTheme())}>
      {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
