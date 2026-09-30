import {
  Alert, Badge, Card, Center, Container, Group, Image, Loader, MultiSelect, SimpleGrid, Stack, Text, TextInput, Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, type MenuIngredient, type MenuItem, type MenuSearch } from '../api'
import { label } from '../labels'

// The picker holds Spirit Kinds and Mixers in one list, so each value says which it is.
const KIND = 'kind:'
const MIXER = 'mixer:'

function toSearch(q: string, picked: string[]): MenuSearch {
  return {
    q: q.trim() || undefined,
    spiritKinds: picked.filter((value) => value.startsWith(KIND)).map((value) => value.slice(KIND.length)),
    mixerIds: picked.filter((value) => value.startsWith(MIXER)).map((value) => Number(value.slice(MIXER.length))),
  }
}

function ingredientName(ingredient: MenuIngredient) {
  return ingredient.spiritKind ? label(ingredient.spiritKind) : (ingredient.mixer ?? '')
}

/** The Guests' menu: only Makeable Cocktails, no stock details, no login. */
export default function MenuPage() {
  const [q, setQ] = useState('')
  const [debouncedQ] = useDebouncedValue(q, 250)
  const [picked, setPicked] = useState<string[]>([])

  const search = toSearch(debouncedQ, picked)
  const menu = useQuery({ queryKey: ['menu', search], queryFn: () => api.menu(search), placeholderData: keepPreviousData })
  const options = useQuery({ queryKey: ['menu', 'pick-options'], queryFn: api.pickOptions })
  const filtering = Boolean(search.q || picked.length)

  const pickData = [
    {
      group: 'Spirit kinds',
      items: (options.data?.spiritKinds ?? []).map((kind) => ({ value: KIND + kind, label: label(kind) })),
    },
    {
      group: 'Mixers',
      items: (options.data?.mixers ?? []).map((mixer) => ({ value: MIXER + mixer.id, label: mixer.name })),
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack>
        <div>
          <Title order={1}>HomeBar</Title>
          <Text c="dimmed">What we can pour for you tonight</Text>
        </div>
        <Group align="start">
          <TextInput placeholder="Search cocktails" value={q} onChange={(e) => setQ(e.currentTarget.value)} w={240} />
          <MultiSelect
            placeholder={picked.length ? undefined : 'Pick what you’d like in your drink'}
            clearable
            searchable
            value={picked}
            onChange={setPicked}
            data={pickData}
            nothingFoundMessage="Not in stock"
            miw={280}
            style={{ flex: 1 }}
          />
        </Group>

        {menu.isPending ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : menu.isError ? (
          <Alert color="red">The menu is unavailable right now.</Alert>
        ) : menu.data.items.length === 0 ? (
          <Text c="dimmed" py="xl" ta="center">
            {filtering ? 'Nothing on the menu matches that.' : 'Nothing on the menu right now. Ask the host!'}
          </Text>
        ) : (
          <>
            {!menu.data.exact && (
              <Alert color="yellow">
                Nothing has everything you picked. Here are the closest {menu.data.items.length}.
              </Alert>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {menu.data.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const ingredients = item.ingredients.map(ingredientName)
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
        {item.lacking.length > 0 && (
          <Text size="sm" c="orange">
            No {item.lacking.map(ingredientName).join(', no ')}
          </Text>
        )}
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
