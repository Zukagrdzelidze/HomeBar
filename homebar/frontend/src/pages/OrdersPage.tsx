import { Alert, Badge, Button, Card, Center, Group, List, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import CocktailPicture from '../CocktailPicture'
import { api, type Cocktail, type Order } from '../api'
import { ingredientLabel, label } from '../labels'
import { useOrders } from '../orders'

/** "just now", "4 min ago", "1 h 20 min ago" */
function ago(placedAt: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(placedAt).getTime()) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min ago`
}

/** The Orders Guests have placed, oldest first, each with the recipe needed to make it. */
export default function OrdersPage() {
  const orders = useOrders()
  // Recipes come from the Cocktails list, so an Order card can show how to make the drink.
  const cocktails = useQuery({ queryKey: ['cocktails', {}], queryFn: () => api.cocktails() })
  const recipes = new Map((cocktails.data ?? []).map((cocktail) => [cocktail.id, cocktail]))

  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Stack>
      <Title order={2}>Orders</Title>
      {orders.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : orders.isError ? (
        <Alert color="red">Could not load orders.</Alert>
      ) : orders.data.length === 0 ? (
        <Text c="dimmed" py="xl" ta="center">
          No orders waiting. They show up here as soon as a guest orders from the menu.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {orders.data.map((order) => (
            <OrderCard key={order.id} order={order} cocktail={recipes.get(order.cocktailId)} now={now} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

function OrderCard({ order, cocktail, now }: { order: Order; cocktail: Cocktail | undefined; now: number }) {
  const queryClient = useQueryClient()
  const made = useMutation({
    mutationFn: () => api.orderMade(order.id),
    onSuccess: () =>
      queryClient.setQueryData<Order[]>(['orders'], (waiting) => waiting?.filter((other) => other.id !== order.id)),
    onError: (error) => notifications.show({ color: 'red', message: error.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  return (
    <Card withBorder padding="md">
      {cocktail && (
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
      )}
      <Stack gap="xs" mt="sm" flex={1}>
        <Group justify="space-between" wrap="nowrap">
          <Text className="eyebrow" lineClamp={1}>
            For {order.guestName}
          </Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {ago(order.placedAt, now)}
          </Text>
        </Group>
        <Group justify="space-between" wrap="nowrap">
          <Title order={3} fz={20}>
            {order.cocktailName}
          </Title>
          {cocktail && !cocktail.makeable && (
            <Badge variant="light" color="red" style={{ flexShrink: 0 }}>
              Missing {cocktail.missing.length}
            </Badge>
          )}
        </Group>
        {cocktail && (
          <>
            <List size="sm" spacing={2}>
              {cocktail.ingredients.map((ingredient, i) => (
                <List.Item key={i}>{ingredientLabel(ingredient)}</List.Item>
              ))}
            </List>
            <Text size="sm" c="dimmed">
              {cocktail.cups.length > 0 && label(cocktail.cups[0])}
              {cocktail.cups.length > 1 && ` (or ${cocktail.cups.slice(1).map(label).join(', ')})`}
              {cocktail.iceInCup ? ' · over ice' : ' · no ice'}
            </Text>
            {cocktail.description && (
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                {cocktail.description}
              </Text>
            )}
          </>
        )}
        <Button mt="auto" loading={made.isPending} onClick={() => made.mutate()}>
          Made
        </Button>
      </Stack>
    </Card>
  )
}
