import { Alert, Center, Loader, Paper, Stack, Switch, Table, Text, Title } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Mixer } from '../api'

export default function MixersPage() {
  const mixers = useQuery({ queryKey: ['mixers'], queryFn: api.mixers })

  return (
    <Stack>
      <Title order={2}>Mixers</Title>
      {mixers.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : mixers.isError ? (
        <Alert color="red">Could not load mixers.</Alert>
      ) : mixers.data.length === 0 ? (
        <Text c="dimmed" py="xl" ta="center">
          No mixers yet. They are added by a database migration together with the cocktails that use them.
        </Text>
      ) : (
        <Paper withBorder maw={560} style={{ overflow: 'hidden' }}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Tbody>
              {mixers.data.map((mixer) => (
                <MixerRow key={mixer.id} mixer={mixer} />
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}

function MixerRow({ mixer }: { mixer: Mixer }) {
  const queryClient = useQueryClient()
  const setStock = useMutation({
    mutationFn: (inStock: boolean) => api.setMixerStock(mixer.id, inStock),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mixers'] })
      queryClient.invalidateQueries({ queryKey: ['cocktails'] })
    },
  })
  const inStock = setStock.isPending ? setStock.variables : mixer.inStock

  return (
    <Table.Tr>
      <Table.Td>
        <Text>{mixer.name}</Text>
      </Table.Td>
      <Table.Td w={140}>
        <Switch
          checked={inStock}
          onChange={(event) => setStock.mutate(event.currentTarget.checked)}
          label={inStock ? 'In stock' : 'Out'}
        />
      </Table.Td>
    </Table.Tr>
  )
}
