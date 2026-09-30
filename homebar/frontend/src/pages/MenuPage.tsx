import { Alert, Badge, Card, Center, Container, Group, Image, Loader, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, type MenuItem } from '../api'
import { label, SPIRIT_KINDS } from '../labels'

/** The Guests' menu: only Makeable Cocktails, no stock details, no login. */
export default function MenuPage() {
  const [q, setQ] = useState('')
  const [debouncedQ] = useDebouncedValue(q, 250)
  const [category, setCategory] = useState<string | null>(null)

  const search = { q: debouncedQ.trim() || undefined, category: category ?? undefined }
  const menu = useQuery({ queryKey: ['menu', search], queryFn: () => api.menu(search), placeholderData: keepPreviousData })
  const filtering = Boolean(search.q || search.category)

  return (
    <Container size="lg" py="xl">
      <Stack>
        <div>
          <Title order={1}>HomeBar</Title>
          <Text c="dimmed">What we can pour for you tonight</Text>
        </div>
        <Group>
          <TextInput placeholder="Search cocktails" value={q} onChange={(e) => setQ(e.currentTarget.value)} w={240} />
          <Select
            placeholder="Any spirit kind"
            clearable
            searchable
            value={category}
            onChange={setCategory}
            data={SPIRIT_KINDS.map((kind) => ({ value: kind, label: label(kind) }))}
            w={220}
          />
        </Group>

        {menu.isPending ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : menu.isError ? (
          <Alert color="red">The menu is unavailable right now.</Alert>
        ) : menu.data.length === 0 ? (
          <Text c="dimmed" py="xl" ta="center">
            {filtering ? 'Nothing on the menu matches that.' : 'Nothing on the menu right now. Ask the host!'}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {menu.data.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const ingredients = item.ingredients.map((ingredient) =>
    ingredient.spiritKind ? label(ingredient.spiritKind) : ingredient.mixer,
  )
  const serving = [item.servedIn && `Served in a ${label(item.servedIn).toLowerCase()}`, item.iceInCup ? 'over ice' : 'no ice']
    .filter(Boolean)
    .join(', ')

  return (
    <Card withBorder radius="md" padding="md">
      <Card.Section>
        {item.imageUrl ? (
          <Image src={item.imageUrl} h={200} alt={item.name} />
        ) : (
          <Center h={200} bg="var(--mantine-color-grape-light)">
            <Text size="xl" fw={700} c="grape">
              {item.name}
            </Text>
          </Center>
        )}
      </Card.Section>
      <Stack gap="xs" mt="md">
        <Text fw={700} size="lg">
          {item.name}
        </Text>
        <Group gap={6}>
          {item.categories.map((kind) => (
            <Badge key={kind} variant="light" size="sm">
              {label(kind)}
            </Badge>
          ))}
        </Group>
        {item.description && <Text size="sm">{item.description}</Text>}
        <Text size="sm" c="dimmed">
          {ingredients.join(', ')}
        </Text>
        <Text size="sm" c="dimmed">
          {serving}
        </Text>
      </Stack>
    </Card>
  )
}
