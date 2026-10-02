import { AppShell, Badge, Burger, Button, Group, NavLink, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink as RouterNavLink, Outlet } from 'react-router'
import { api } from '../api'

const PAGES = [
  { to: '/admin/bottles', label: 'Bottles' },
  { to: '/admin/mixers', label: 'Mixers' },
  { to: '/admin/cocktails', label: 'Cocktails' },
]

export default function AdminLayout({ name }: { name: string }) {
  const [opened, { toggle, close }] = useDisclosure()
  const queryClient = useQueryClient()
  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear()
      queryClient.setQueryData(['me'], null)
    },
  })

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} fz={22}>
              HomeBar
            </Title>
            <Badge variant="light" size="sm">
              Admin
            </Badge>
          </Group>
          <Group gap="sm">
            <Text size="sm" c="dimmed" visibleFrom="xs">
              {name}
            </Text>
            <Button variant="subtle" size="xs" onClick={() => logout.mutate()} loading={logout.isPending}>
              Log out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm">
        {PAGES.map((page) => (
          <RouterNavLink key={page.to} to={page.to} onClick={close} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => <NavLink component="span" label={page.label} active={isActive} fw={500} style={{ borderRadius: 'var(--mantine-radius-md)' }} />}
          </RouterNavLink>
        ))}
        <NavLink
          component="a"
          href="/"
          target="_blank"
          label="View guest menu ↗"
          mt="auto"
          c="dimmed"
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
