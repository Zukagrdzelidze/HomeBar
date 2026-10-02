import {
  Alert, Badge, Box, Card, Center, Container, Group, Loader, MultiSelect, Paper, SimpleGrid, Spoiler, Stack, Text, TextInput, Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, type MenuIngredient, type MenuItem, type MenuSearch } from '../api'
import CocktailPicture from '../CocktailPicture'
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
    <Box mih="100vh">
      <Box
        py={48}
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-grape-9), var(--mantine-color-indigo-9))',
          color: 'white',
        }}
      >
        <Container size="lg">
          <Title order={1} fz={{ base: 34, sm: 48 }} style={{ letterSpacing: '-0.02em' }}>
            🍸 HomeBar
          </Title>
          <Text size="lg" mt={4} opacity={0.85}>
            What we can pour for you tonight
          </Text>
        </Container>
      </Box>
      <Container size="lg" mt={-28} pb="xl">
        <Paper withBorder shadow="md" radius="lg" p="md">
          <Group align="start">
            <TextInput
              placeholder="Search cocktails"
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              w={{ base: '100%', sm: 240 }}
            />
            <MultiSelect
              placeholder={picked.length ? undefined : 'Pick what you’d like in your drink'}
              clearable
              searchable
              value={picked}
              onChange={setPicked}
              data={pickData}
              nothingFoundMessage="Not in stock"
              miw={260}
              style={{ flex: 1 }}
            />
          </Group>
        </Paper>
        <Stack mt="xl">
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
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {menu.data.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </SimpleGrid>
          </>
        )}
        </Stack>
      </Container>
    </Box>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const ingredients = item.ingredients.map(ingredientName)
  const serving = [item.servedIn && `Glass: ${label(item.servedIn)}`, item.iceInCup ? 'over ice' : 'no ice']
    .filter(Boolean)
    .join(', ')

  return (
    <Card
      withBorder
      radius="lg"
      padding="md"
      shadow="sm"
      style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-lg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <Card.Section pos="relative">
        <CocktailPicture
          name={item.name}
          imageUrl={item.imageUrl}
          cup={item.servedIn}
          categories={item.categories}
          iceInCup={item.iceInCup}
          height={220}
        />
        <Group gap={6} pos="absolute" bottom={10} left={12} right={12}>
          {item.categories.slice(0, 3).map((kind) => (
            <Badge key={kind} color="dark" variant="filled" size="sm" style={{ opacity: 0.85 }}>
              {label(kind)}
            </Badge>
          ))}
        </Group>
      </Card.Section>
      <Stack gap="xs" mt="md">
        <Text fw={700} size="xl" lh={1.2}>
          {item.name}
        </Text>
        {item.lacking.length > 0 && (
          <Badge color="orange" variant="light" size="md" style={{ alignSelf: 'flex-start', textTransform: 'none' }}>
            No {item.lacking.map(ingredientName).join(', no ')}
          </Badge>
        )}
        {item.description && (
          <Spoiler maxHeight={64} showLabel="Show recipe" hideLabel="Hide recipe">
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {item.description}
            </Text>
          </Spoiler>
        )}
        <Group gap={6} mt={4}>
          {ingredients.map((name) => (
            <Badge key={name} variant="outline" color="gray" size="sm" style={{ textTransform: 'none' }}>
              {name}
            </Badge>
          ))}
        </Group>
        <Text size="xs" c="dimmed">
          {serving}
        </Text>
      </Stack>
    </Card>
  )
}
