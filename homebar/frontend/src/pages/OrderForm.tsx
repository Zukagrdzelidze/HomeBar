import { Alert, Button, Group, Text, TextInput } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { api, ApiError, type MenuItem } from '../api'

/** A Guest orders this Cocktail under their name, which this browser remembers for the next round. */
export default function OrderForm({ item }: { item: MenuItem }) {
  const [remembered, setRemembered] = useLocalStorage<string>({
    key: 'homebar:guest-name',
    defaultValue: '',
    getInitialValueInEffect: false,
  })
  const [name, setName] = useState(typeof remembered === 'string' ? remembered : '')
  const [nameError, setNameError] = useState<string>()
  const order = useMutation({
    mutationFn: (guestName: string) => api.placeOrder(item.id, guestName),
    onSuccess: (placed) => setRemembered(placed.guestName),
    onError: (error) => {
      if (error instanceof ApiError) setNameError(error.fieldErrors.guestName)
    },
  })

  if (order.isSuccess) {
    return (
      <Alert variant="light" title="Order sent">
        Your {item.name} is on its way, {order.data.guestName}.
      </Alert>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return setNameError('Add your name so we know who it is for')
        order.mutate(name.trim())
      }}
    >
      <Text className="eyebrow" mb={6}>
        Order it
      </Text>
      <Group align="start" gap="sm" wrap="nowrap">
        <TextInput
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="given-name"
          maxLength={50}
          value={name}
          onChange={(event) => {
            setName(event.currentTarget.value)
            setNameError(undefined)
          }}
          error={nameError}
          style={{ flex: 1 }}
        />
        <Button type="submit" loading={order.isPending}>
          Order
        </Button>
      </Group>
      {order.error && !nameError && (
        <Text c="red" size="sm" mt={6}>
          {order.error.message}
        </Text>
      )}
    </form>
  )
}
