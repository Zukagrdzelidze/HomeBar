import {
  Alert, Badge, Button, Card, Center, FileButton, Group, List, Loader, NumberInput, SegmentedControl, Select,
  SimpleGrid, Stack, Text, TextInput, Title,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import CocktailPicture from '../CocktailPicture'
import { api, type Cocktail, type CocktailSearch, type MissingIngredient } from '../api'
import { ingredientKey, ingredientLabel, label, SPIRIT_KINDS } from '../labels'
import { PHOTO_TYPES, photoError } from '../photo'
import Taste from '../Taste'

type Availability = 'all' | 'makeable' | 'missing'
type CountMode = 'any' | 'exactly' | 'atMost'

export default function CocktailsPage() {
  const [q, setQ] = useState('')
  const [debouncedQ] = useDebouncedValue(q, 250)
  const [availability, setAvailability] = useState<Availability>('all')
  const [countMode, setCountMode] = useState<CountMode>('any')
  const [count, setCount] = useState(1)
  const [missingOnly, setMissingOnly] = useState<CocktailSearch['missingOnly'] | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [mixerId, setMixerId] = useState<string | null>(null)

  const search: CocktailSearch = {
    q: debouncedQ.trim() || undefined,
    makeable: availability === 'all' ? undefined : availability === 'makeable',
    missing: countMode === 'exactly' ? count : undefined,
    maxMissing: countMode === 'atMost' ? count : undefined,
    missingOnly: missingOnly ?? undefined,
    category: category ?? undefined,
    mixerId: mixerId ? Number(mixerId) : undefined,
  }
  const cocktails = useQuery({
    queryKey: ['cocktails', search],
    queryFn: () => api.cocktails(search),
    placeholderData: keepPreviousData,
  })
  const mixers = useQuery({ queryKey: ['mixers'], queryFn: api.mixers })

  const shown = cocktails.data ?? []

  return (
    <Stack>
      <Title order={2}>Cocktails</Title>
      <ShoppingList />

      <Card withBorder padding="md">
        <Stack gap="sm">
          <Group align="end">
            <TextInput label="Name" placeholder="Search" value={q} onChange={(e) => setQ(e.currentTarget.value)} w={200} />
            <div>
              <Text size="sm" fw={500} mb={4}>
                Show
              </Text>
              <SegmentedControl
                value={availability}
                onChange={(value) => setAvailability(value as Availability)}
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'makeable', label: 'Makeable now' },
                  { value: 'missing', label: 'Missing something' },
                ]}
              />
            </div>
            <Select
              label="Uses spirit kind"
              placeholder="Any"
              clearable
              searchable
              value={category}
              onChange={setCategory}
              data={SPIRIT_KINDS.map((kind) => ({ value: kind, label: label(kind) }))}
              w={200}
            />
            <Select
              label="Uses mixer"
              placeholder="Any"
              clearable
              searchable
              value={mixerId}
              onChange={setMixerId}
              data={(mixers.data ?? []).map((mixer) => ({ value: String(mixer.id), label: mixer.name }))}
              w={200}
            />
          </Group>
          <Group align="end">
            <Select
              label="Missing count"
              value={countMode}
              onChange={(value) => setCountMode((value as CountMode) ?? 'any')}
              allowDeselect={false}
              data={[
                { value: 'any', label: 'Any' },
                { value: 'exactly', label: 'Exactly' },
                { value: 'atMost', label: 'At most' },
              ]}
              w={140}
            />
            {countMode !== 'any' && (
              <NumberInput
                label="Things to buy"
                min={0}
                value={count}
                onChange={(value) => setCount(typeof value === 'number' ? value : 0)}
                w={120}
              />
            )}
            <Select
              label="What's missing"
              placeholder="Anything"
              clearable
              value={missingOnly}
              onChange={(value) => setMissingOnly(value as CocktailSearch['missingOnly'] | null)}
              data={[
                { value: 'MIXERS', label: 'Only Mixers' },
                { value: 'SPIRIT_KINDS', label: 'Only Spirit Kinds' },
              ]}
              w={240}
            />
          </Group>
        </Stack>
      </Card>

      {cocktails.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : cocktails.isError ? (
        <Alert color="red">Could not load cocktails.</Alert>
      ) : shown.length === 0 ? (
        <Text c="dimmed" py="xl" ta="center">
          No cocktails match these filters. (Cocktails themselves are added by a database migration.)
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {shown.map((cocktail) => (
            <CocktailCard key={cocktail.id} cocktail={cocktail} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

function missingLabel(missing: MissingIngredient) {
  return missing.spiritKind ? label(missing.spiritKind) : (missing.mixer?.name ?? '')
}

/** What to buy next: each single purchase and the Cocktails it would make Makeable on its own. */
function ShoppingList() {
  const items = useQuery({ queryKey: ['cocktails', 'shopping-list'], queryFn: api.shoppingList })
  if (!items.data?.length) return null

  return (
    <Card withBorder padding="md" bg="var(--mantine-color-brass-light)">
      <Text className="eyebrow" mb="xs">
        Buy next
      </Text>
      <List size="sm" spacing={4}>
        {items.data.map((item) => (
          <List.Item key={ingredientKey(item)}>
            <Text size="sm" span fw={600}>
              {missingLabel(item)}
            </Text>
            <Text size="sm" span c="dimmed">
              {' '}
              unlocks {item.unlocks.length}: {item.unlocks.map((cocktail) => cocktail.name).join(', ')}
            </Text>
          </List.Item>
        ))}
      </List>
    </Card>
  )
}

function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  const missing = new Set(cocktail.missing.map(ingredientKey))

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        <Card.Section>
          <CocktailPicture
            name={cocktail.name}
            imageUrl={cocktail.imageUrl}
            cup={cocktail.cups[0] ?? null}
            categories={cocktail.categories}
            iceInCup={cocktail.iceInCup}
            height={160}
          />
        </Card.Section>
        <Group justify="space-between" wrap="nowrap">
          <Title order={3} fz={20}>
            {cocktail.name}
          </Title>
          <Badge variant="light" color={cocktail.makeable ? 'green' : 'gray'} style={{ flexShrink: 0 }}>
            {cocktail.makeable ? 'Makeable' : `Missing ${cocktail.missing.length}`}
          </Badge>
        </Group>
        <Group gap={6}>
          {cocktail.categories.map((kind) => (
            <Badge key={kind} variant="light" color="gray" size="sm">
              {label(kind)}
            </Badge>
          ))}
        </Group>
        <Taste strength={cocktail.strength} flavours={cocktail.flavours} />
        <List size="sm" spacing={2}>
          {cocktail.ingredients.map((ingredient, i) => {
            const isMissing = missing.has(ingredientKey(ingredient))
            return (
              <List.Item key={i}>
                <Text size="sm" c={isMissing ? 'red' : undefined} td={isMissing ? 'line-through' : undefined}>
                  {ingredientLabel(ingredient)}
                </Text>
              </List.Item>
            )
          })}
        </List>
        {!cocktail.makeable && (
          <Text size="sm" c="red">
            Needs: {cocktail.missing.map(missingLabel).join(', ')}
          </Text>
        )}
        <Text size="sm" c="dimmed">
          {cocktail.cups.length > 0 && label(cocktail.cups[0])}
          {cocktail.cups.length > 1 && ` (or ${cocktail.cups.slice(1).map(label).join(', ')})`}
          {cocktail.iceInCup ? ' · over ice' : ' · no ice'}
        </Text>
        {cocktail.description && <Text size="sm">{cocktail.description}</Text>}
        <PhotoControls cocktail={cocktail} />
      </Stack>
    </Card>
  )
}

function PhotoControls({ cocktail }: { cocktail: Cocktail }) {
  const queryClient = useQueryClient()
  const onSettled = () => queryClient.invalidateQueries({ queryKey: ['cocktails'] })
  const onError = (error: Error) => notifications.show({ color: 'red', message: error.message })
  const upload = useMutation({ mutationFn: (file: File) => api.uploadCocktailImage(cocktail.id, file), onSettled, onError })
  const remove = useMutation({ mutationFn: () => api.removeCocktailImage(cocktail.id), onSettled, onError })

  const pick = (file: File | null) => {
    const error = photoError(file)
    if (error) notifications.show({ color: 'red', message: error })
    else if (file) upload.mutate(file)
  }

  return (
    <Group gap="xs">
      <FileButton onChange={pick} accept={PHOTO_TYPES.join(',')}>
        {(props) => (
          <Button {...props} variant="light" size="xs" loading={upload.isPending}>
            {cocktail.imageUrl ? 'Replace photo' : 'Add photo'}
          </Button>
        )}
      </FileButton>
      {cocktail.imageUrl && (
        <Button variant="subtle" color="red" size="xs" loading={remove.isPending} onClick={() => remove.mutate()}>
          Remove photo
        </Button>
      )}
    </Group>
  )
}
