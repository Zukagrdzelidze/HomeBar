import { Anchor, Text } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { api, ApiError } from '../api'
import AuthCard from './AuthCard'

export default function LoginPage() {
  const queryClient = useQueryClient()
  const registration = useQuery({ queryKey: ['registration-open'], queryFn: api.registrationOpen })
  const login = useMutation({
    mutationFn: ({ name, password }: { name: string; password: string }) => api.login(name, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  const error = login.error
    ? login.error instanceof ApiError && login.error.status === 401
      ? 'Wrong name or password'
      : 'Could not log in. Try again.'
    : null

  return (
    <AuthCard
      title="HomeBar admin"
      submitLabel="Log in"
      error={error}
      submitting={login.isPending}
      onSubmit={(name, password) => login.mutate({ name, password })}
      footer={
        registration.data?.open && (
          <Text size="sm" ta="center">
            First time here?{' '}
            <Anchor component={Link} to="/register">
              Register
            </Anchor>
          </Text>
        )
      }
    />
  )
}
