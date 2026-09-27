import { Alert, Button, Center, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ReactNode } from 'react'

type Props = {
  title: string
  submitLabel: string
  error: string | null
  submitting: boolean
  onSubmit: (name: string, password: string) => void
  footer?: ReactNode
}

export default function AuthCard({ title, submitLabel, error, submitting, onSubmit, footer }: Props) {
  const form = useForm({
    initialValues: { name: '', password: '' },
    validate: {
      name: (value) => (value.trim() ? null : 'Enter your name'),
      password: (value) => (value.length >= 8 ? null : 'At least 8 characters'),
    },
  })

  return (
    <Center h="100vh" px="md">
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={380}>
        <form onSubmit={form.onSubmit(({ name, password }) => onSubmit(name.trim(), password))}>
          <Stack>
            <Title order={2}>{title}</Title>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput label="Name" autoComplete="username" {...form.getInputProps('name')} />
            <PasswordInput label="Password" autoComplete="current-password" {...form.getInputProps('password')} />
            <Button type="submit" loading={submitting}>
              {submitLabel}
            </Button>
            {footer}
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
