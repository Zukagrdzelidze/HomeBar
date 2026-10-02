import {
  Alert, Box, Button, Center, Chip, Container, Group, Loader, MultiSelect, Paper, SegmentedControl, SimpleGrid, Stack, Text,
  TextInput, Title,
} from '@mantine/core'
import { useDebouncedValue, useReducedMotion } from '@mantine/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { api, type Flavour, type MenuItem, type MenuSearch, type Strength } from '../api'
import { useFavourites } from '../favourites'
import { DiceIcon, SearchIcon } from '../icons'
import { FLAVOURS, label, STRENGTH_COLOR, STRENGTHS } from '../labels'
import { similarDrinks } from '../menu'
import CocktailDetail from './CocktailDetail'
import MenuCard from './MenuCard'
import SurpriseReel from './SurpriseReel'

// The picker holds Spirit Kinds and Mixers in one list, so each value says which it is.
const KIND = 'kind:'
const MIXER = 'mixer:'

const WHOLE_MENU: MenuSearch = { spiritKinds: [], mixerIds: [], flavours: [] }

// The open Cocktail lives in the URL (?drink=12) so it can be shared and Back closes it.
const DRINK = 'drink'

type View = 'all' | 'favourites'

function toSearch(q: string, picked: string[], strength: Strength | undefined, flavours: Flavour[]): MenuSearch {
  return {
    q: q.trim() || undefined,
    spiritKinds: picked.filter((value) => value.startsWith(KIND)).map((value) => value.slice(KIND.length)),
    mixerIds: picked.filter((value) => value.startsWith(MIXER)).map((value) => Number(value.slice(MIXER.length))),
    strength,
    flavours,
  }
}

function pickRandom<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)]
}

/** The Guests' menu: only Makeable Cocktails, no stock details, no login. */
export default function MenuPage() {
  const [q, setQ] = useState('')
  const [debouncedQ] = useDebouncedValue(q, 250)
  const [picked, setPicked] = useState<string[]>([])
  const [strength, setStrength] = useState<Strength>()
  const [flavours, setFlavours] = useState<Flavour[]>([])
  const [view, setView] = useState<View>('all')
  const [surprised, setSurprised] = useState(false)
  const [reel, setReel] = useState<{ pool: string[]; pick: MenuItem }>()
  const reducedMotion = useReducedMotion()
  const favourites = useFavourites()

  const search = toSearch(debouncedQ, picked, strength, flavours)
  const menu = useQuery({ queryKey: ['menu', search], queryFn: () => api.menu(search), placeholderData: keepPreviousData })
  // Unfiltered, for the header count, the detail dialog and similar drinks.
  const wholeMenu = useQuery({ queryKey: ['menu', WHOLE_MENU], queryFn: () => api.menu(WHOLE_MENU) })
  const options = useQuery({ queryKey: ['menu', 'pick-options'], queryFn: api.pickOptions })
  const filtering = Boolean(q.trim() || picked.length || strength || flavours.length)

  const shown = (menu.data?.items ?? []).filter((item) => view === 'all' || favourites.has(item.id))

  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openId = Number(params.get(DRINK))
  const openItem = wholeMenu.data?.items.find((item) => item.id === openId)

  const openDrink = (id: number, surprise = false) => {
    setSurprised(surprise)
    // Already showing a drink: swap it in place, so one Back still closes the dialog.
    const replace = Boolean(params.get(DRINK))
    setParams({ [DRINK]: String(id) }, { replace, state: replace ? location.state : { openedHere: true } })
  }
  const closeDrink = () => {
    if (location.state?.openedHere) navigate(-1)
    else setParams({}, { replace: true })
  }
  const surprise = () => {
    const pool = shown.length > 1 ? shown.filter((item) => item.id !== openId) : shown
    const pick = pickRandom(pool)
    if (!pick || reel) return
    if (reducedMotion) return openDrink(pick.id, true)
    // Warm the photo up while the reel spins, so the drink appears with it.
    if (pick.imageUrl) new Image().src = pick.imageUrl
    setReel({ pool: shown.map((item) => item.name), pick })
  }
  const clearFilters = () => {
    setQ('')
    setPicked([])
    setStrength(undefined)
    setFlavours([])
  }

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
  const total = wholeMenu.data?.items.length

  return (
    <Box mih="100vh" pb={64}>
      <Box className="bar-backdrop menu-hero" pt={{ base: 48, sm: 72 }} pb={{ base: 72, sm: 96 }}>
        <Container size="lg">
          <Group justify="space-between" align="end" gap="lg">
            <div>
              <Text className="eyebrow">Tonight at the bar</Text>
              <Title order={1} fz={{ base: 44, sm: 60 }} lh={1} mt={10} style={{ letterSpacing: '-0.02em' }}>
                HomeBar
              </Title>
              <Text mt="sm" c="rgba(243, 237, 226, 0.7)">
                {total === undefined
                  ? 'What we can pour for you tonight'
                  : `${total} ${total === 1 ? 'cocktail' : 'cocktails'} we can pour for you right now`}
              </Text>
            </div>
            <Button
              size="md"
              radius="xl"
              leftSection={<DiceIcon />}
              onClick={surprise}
              disabled={shown.length === 0}
            >
              Surprise me
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="lg" mt={-40}>
        <Paper withBorder shadow="sm" p={{ base: 'md', sm: 'lg' }}>
          <Group align="start" gap="sm">
            <TextInput
              placeholder="Search by name"
              leftSection={<SearchIcon size={16} />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              w={{ base: '100%', sm: 240 }}
            />
            <MultiSelect
              placeholder={picked.length ? undefined : 'What would you like in it?'}
              clearable
              searchable
              value={picked}
              onChange={setPicked}
              data={pickData}
              nothingFoundMessage="Not in stock"
              miw={240}
              style={{ flex: 1 }}
            />
          </Group>
          <Group gap="xs" mt="md" className="taste-chips">
            {STRENGTHS.map((value) => (
              <Chip
                key={value}
                color={STRENGTH_COLOR[value]}
                checked={strength === value}
                onChange={() => setStrength(strength === value ? undefined : value)}
              >
                {label(value)}
              </Chip>
            ))}
            <Box w={1} h={20} mx={4} bg="var(--mantine-color-default-border)" style={{ flexShrink: 0 }} />
            <Chip.Group multiple value={flavours} onChange={(value) => setFlavours(value as Flavour[])}>
              {FLAVOURS.map((value) => (
                <Chip key={value} value={value} variant="outline">
                  {label(value)}
                </Chip>
              ))}
            </Chip.Group>
          </Group>
        </Paper>

        <Group justify="space-between" mt="xl" mb="md">
          <SegmentedControl
            value={view}
            onChange={(value) => setView(value as View)}
            radius="xl"
            data={[
              { value: 'all', label: 'All drinks' },
              { value: 'favourites', label: `Favourites${favourites.ids.length ? ` (${favourites.ids.length})` : ''}` },
            ]}
          />
          <Group gap="sm">
            {menu.data && (
              <Text size="sm" c="dimmed">
                {shown.length} {shown.length === 1 ? 'drink' : 'drinks'}
              </Text>
            )}
            {filtering && (
              <Button variant="subtle" size="compact-sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Group>
        </Group>

        <Results
          pending={menu.isPending}
          error={menu.isError}
          exact={menu.data?.exact ?? true}
          items={shown}
          emptyMessage={emptyMessage(view, filtering, favourites.ids.length)}
          isFavourite={favourites.has}
          onToggleFavourite={favourites.toggle}
          onOpen={(id) => openDrink(id)}
        />
      </Container>

      {reel && (
        <SurpriseReel
          pool={reel.pool}
          pick={reel.pick.name}
          onPick={() => openDrink(reel.pick.id, true)}
          onClose={() => setReel(undefined)}
        />
      )}

      <CocktailDetail
        item={openItem}
        similar={openItem ? similarDrinks(openItem, wholeMenu.data?.items ?? []) : []}
        favourite={openItem ? favourites.has(openItem.id) : false}
        onToggleFavourite={() => openItem && favourites.toggle(openItem.id)}
        onOpen={(id) => openDrink(id)}
        onClose={closeDrink}
        onAnother={surprised && shown.length > 1 ? surprise : undefined}
      />
    </Box>
  )
}

function emptyMessage(view: View, filtering: boolean, favouriteCount: number) {
  if (view === 'favourites') {
    if (favouriteCount === 0) return 'No favourites yet. Tap the heart on a drink to keep it here.'
    return filtering
      ? 'None of your favourites match that.'
      : 'None of your favourites can be made right now. Ask the host!'
  }
  return filtering ? 'Nothing on the menu matches that.' : 'Nothing on the menu right now. Ask the host!'
}

type ResultsProps = {
  pending: boolean
  error: boolean
  exact: boolean
  items: MenuItem[]
  emptyMessage: string
  isFavourite: (id: number) => boolean
  onToggleFavourite: (id: number) => void
  onOpen: (id: number) => void
}

function Results({ pending, error, exact, items, emptyMessage, isFavourite, onToggleFavourite, onOpen }: ResultsProps) {
  if (pending) {
    return (
      <Center py={64}>
        <Loader />
      </Center>
    )
  }
  if (error) return <Alert color="red">The menu is unavailable right now.</Alert>
  if (items.length === 0) {
    return (
      <Text c="dimmed" py={64} ta="center">
        {emptyMessage}
      </Text>
    )
  }

  return (
    <Stack>
      {!exact && (
        <Alert color="yellow" variant="light">
          Nothing has everything you picked. Here are the closest {items.length}.
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            favourite={isFavourite(item.id)}
            onToggleFavourite={() => onToggleFavourite(item.id)}
            onOpen={() => onOpen(item.id)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
