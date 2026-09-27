import { Alert, AspectRatio, Badge, Button, Card, Center, Group, Image, Loader, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api, type Bottle, type BottleStatus } from '../api'
import { label, SPIRIT_KINDS, STATUS_COLOR, STATUS_LABEL } from '../labels'
import BottleFormModal from './BottleFormModal'

export default function BottlesPage() {
  const bottles = useQuery({ queryKey: ['bottles'], queryFn: api.bottles })
  const [status, setStatus] = useState<string | null>(null)
  const [spiritKind, setSpiritKind] = useState<string | null>(null)
  const [editing, setEditing] = useState<Bottle | null>(null)
  const [formOpened, formModal] = useDisclosure()

  const openForm = (bottle: Bottle | null) => {
    setEditing(bottle)
    formModal.open()
  }

  const shown = (bottles.data ?? []).filter(
    (bottle) => (!status || bottle.status === status) && (!spiritKind || bottle.spiritKind === spiritKind),
  )

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Bottles</Title>
        <Button onClick={() => openForm(null)}>Add bottle</Button>
      </Group>
      <Group>
        <Select
          placeholder="Any status"
          clearable
          value={status}
          onChange={setStatus}
          data={(Object.keys(STATUS_LABEL) as BottleStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          w={180}
        />
        <Select
          placeholder="Any spirit kind"
          clearable
          searchable
          value={spiritKind}
          onChange={setSpiritKind}
          data={SPIRIT_KINDS.map((kind) => ({ value: kind, label: label(kind) }))}
          w={220}
        />
      </Group>

      {bottles.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : bottles.isError ? (
        <Alert color="red">Could not load bottles.</Alert>
      ) : shown.length === 0 ? (
        <Text c="dimmed" py="xl" ta="center">
          {bottles.data.length === 0 ? 'No bottles yet. Add the first one from your shelf.' : 'No bottles match these filters.'}
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }}>
          {shown.map((bottle) => (
            <BottleCard key={bottle.id} bottle={bottle} onEdit={() => openForm(bottle)} />
          ))}
        </SimpleGrid>
      )}

      <BottleFormModal bottle={editing} opened={formOpened} onClose={formModal.close} />
    </Stack>
  )
}

function BottleCard({ bottle, onEdit }: { bottle: Bottle; onEdit: () => void }) {
  const queryClient = useQueryClient()
  const revokeOrRestock = useMutation({
    mutationFn: () => (bottle.status === 'EMPTY' ? api.restockBottle(bottle.id) : api.revokeBottle(bottle.id)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] })
      queryClient.invalidateQueries({ queryKey: ['cocktails'] })
    },
  })

  return (
    <Card withBorder radius="md" padding="md" opacity={bottle.status === 'EMPTY' ? 0.6 : 1}>
      <Card.Section>
        <AspectRatio ratio={4 / 3}>
          {bottle.imageUrl ? (
            <Image src={bottle.imageUrl} alt={bottle.name} fit="contain" bg="gray.1" />
          ) : (
            <Center bg="gray.1">
              <Text c="dimmed" size="sm">
                No photo
              </Text>
            </Center>
          )}
        </AspectRatio>
      </Card.Section>
      <Stack gap={6} mt="sm">
        <Text fw={600}>{bottle.name}</Text>
        <Group gap={6}>
          <Badge variant="light">{label(bottle.spiritKind)}</Badge>
          <Badge color={STATUS_COLOR[bottle.status]}>{STATUS_LABEL[bottle.status]}</Badge>
          {bottle.sipping && (
            <Badge color="orange" variant="outline">
              Sipping
            </Badge>
          )}
        </Group>
        {bottle.description && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {bottle.description}
          </Text>
        )}
        <Group gap="xs" mt="xs">
          <Button size="xs" variant="default" onClick={onEdit}>
            Edit
          </Button>
          <Button
            size="xs"
            variant="light"
            color={bottle.status === 'EMPTY' ? 'green' : 'red'}
            loading={revokeOrRestock.isPending}
            onClick={() => revokeOrRestock.mutate()}
          >
            {bottle.status === 'EMPTY' ? 'Restock' : 'Revoke'}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
