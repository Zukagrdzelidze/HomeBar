import { Alert, Anchor, Center, Stack, Text } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { api, ApiError } from '../api'
import AuthCard from './AuthCard'

export default function RegisterPage() {
  const queryClient = useQueryClient()
  const registration = useQuery({ queryKey: ['registration-open'], queryFn: api.registrationOpen })
  const register = useMutation({
    mutationFn: ({ name, password }: { name: string; password: string }) => api.register(name, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  if (registration.data && !registration.data.open) {
    return (
      <Center h="100vh" px="md">
        <Stack maw={380}>
          <Alert color="yellow" title="Registration is closed">
            An admin account already exists, so log in instead.
          </Alert>
          <Anchor component={Link} to="/admin/login" ta="center">
            Go to login
          </Anchor>
        </Stack>
      </Center>
    )
  }

  const error = register.error
    ? register.error instanceof ApiError && register.error.status === 409
      ? 'Registration is closed. An admin already exists, so log in instead.'
      : register.error.message
    : null

  return (
    <AuthCard
      title="Create the admin account"
      submitLabel="Register"
      error={error}
      submitting={register.isPending}
      onSubmit={(name, password) => register.mutate({ name, password })}
      footer={
        <Text size="sm" ta="center">
          <Anchor component={Link} to="/admin/login">
            Back to login
          </Anchor>
        </Text>
      }
    />
  )
}
