import { Alert, Badge, Card, Center, Group, List, Loader, Select, SimpleGrid, Stack, Switch, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api, type Cocktail } from '../api'
import { ingredientLabel, label } from '../labels'

export default function CocktailsPage() {
  const cocktails = useQuery({ queryKey: ['cocktails'], queryFn: api.cocktails })
  const [makeableOnly, setMakeableOnly] = useState(false)
  const [category, setCategory] = useState<string | null>(null)

  const all = cocktails.data ?? []
  const categories = [...new Set(all.flatMap((cocktail) => cocktail.categories))].sort()
  const shown = all.filter(
    (cocktail) => (!makeableOnly || cocktail.makeable) && (!category || cocktail.categories.includes(category)),
  )

  return (
    <Stack>
      <Title order={2}>Cocktails</Title>
      <Group>
        <Switch label="Makeable now" checked={makeableOnly} onChange={(e) => setMakeableOnly(e.currentTarget.checked)} />
        <Select
          placeholder="Any category"
          clearable
          searchable
          value={category}
          onChange={setCategory}
          data={categories.map((kind) => ({ value: kind, label: label(kind) }))}
          w={220}
        />
      </Group>

      {cocktails.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : cocktails.isError ? (
        <Alert color="red">Could not load cocktails.</Alert>
      ) : shown.length === 0 ? (
        <Text c="dimmed" py="xl" ta="center">
          {all.length === 0
            ? 'No cocktails yet. They are added by a database migration.'
            : 'No cocktails match these filters.'}
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

function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  const missing = new Set(cocktail.missing.map(ingredientLabel))

  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="lg">
            {cocktail.name}
          </Text>
          <Badge color={cocktail.makeable ? 'green' : 'gray'}>{cocktail.makeable ? 'Makeable' : 'Missing items'}</Badge>
        </Group>
        <Group gap={6}>
          {cocktail.categories.map((kind) => (
            <Badge key={kind} variant="light" size="sm">
              {label(kind)}
            </Badge>
          ))}
        </Group>
        <List size="sm" spacing={2}>
          {cocktail.ingredients.map((ingredient, i) => {
            const text = ingredientLabel(ingredient)
            return (
              <List.Item key={i}>
                <Text size="sm" c={missing.has(text) ? 'red' : undefined} td={missing.has(text) ? 'line-through' : undefined}>
                  {text}
                </Text>
              </List.Item>
            )
          })}
        </List>
        <Text size="sm" c="dimmed">
          {cocktail.cups.map(label).join(' → ')}
          {cocktail.iceInCup ? ' · over ice' : ' · no ice'}
        </Text>
        {cocktail.description && <Text size="sm">{cocktail.description}</Text>}
      </Stack>
    </Card>
  )
}
