import { Button, FileInput, Group, Image, Modal, SegmentedControl, Select, Stack, Switch, Text, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api, ApiError, type Bottle, type BottleForm, type BottleStatus } from '../api'
import { label, SPIRIT_KINDS, STATUS_LABEL } from '../labels'
import { PHOTO_TYPES, photoError as checkPhoto } from '../photo'

type Props = {
  bottle: Bottle | null
  opened: boolean
  onClose: () => void
}

export default function BottleFormModal({ bottle, opened, onClose }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={bottle ? `Edit ${bottle.name}` : 'Add a bottle'} size="lg">
      {/* Remount per bottle so the form starts from that bottle's values. */}
      {opened && <BottleFormFields key={bottle?.id ?? 'new'} bottle={bottle} onDone={onClose} />}
    </Modal>
  )
}

function BottleFormFields({ bottle, onDone }: { bottle: Bottle | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  // Once a new bottle is saved, retries (e.g. after a failed photo upload) must edit it, not add a duplicate.
  const [saved, setSaved] = useState<Bottle | null>(bottle)

  const form = useForm<BottleForm>({
    initialValues: {
      name: bottle?.name ?? '',
      spiritKind: bottle?.spiritKind ?? '',
      sipping: bottle?.sipping ?? false,
      description: bottle?.description ?? '',
      status: bottle?.status ?? 'IN_STOCK',
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Give the bottle a name'),
      spiritKind: (value) => (value ? null : 'Pick a spirit kind'),
    },
  })

  const save = useMutation({
    mutationFn: async (values: BottleForm) => {
      const target = saved ? await api.editBottle(saved.id, values) : await api.addBottle(values)
      setSaved(target)
      if (photo) {
        await api.uploadBottleImage(target.id, photo)
      } else if (removePhoto && bottle?.imageUrl) {
        await api.removeBottleImage(target.id)
      }
    },
    onSuccess: onDone,
    onError: (error) => {
      if (error instanceof ApiError) form.setErrors(error.fieldErrors)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bottles'] })
      queryClient.invalidateQueries({ queryKey: ['cocktails'] })
    },
  })

  const photoError = checkPhoto(photo)

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (!photoError) save.mutate({ ...values, name: values.name.trim() })
      })}
    >
      <Stack>
        <TextInput label="Name" placeholder="Tanqueray London Dry" withAsterisk {...form.getInputProps('name')} />
        <Select
          label="Spirit kind"
          placeholder="Pick one"
          withAsterisk
          searchable
          data={SPIRIT_KINDS.map((kind) => ({ value: kind, label: label(kind) }))}
          {...form.getInputProps('spiritKind')}
        />
        <div>
          <Text size="sm" fw={500} mb={4}>
            Status
          </Text>
          <SegmentedControl
            fullWidth
            data={(Object.keys(STATUS_LABEL) as BottleStatus[]).map((status) => ({
              value: status,
              label: STATUS_LABEL[status],
            }))}
            {...form.getInputProps('status')}
          />
        </div>
        <Switch
          label="Sipping bottle"
          description="Never counts toward making a cocktail"
          {...form.getInputProps('sipping', { type: 'checkbox' })}
        />
        <Textarea
          label="Description"
          placeholder="Your review or tasting notes"
          autosize
          minRows={3}
          {...form.getInputProps('description')}
        />
        {bottle?.imageUrl && !photo && !removePhoto && (
          <Group align="end">
            <Image src={bottle.imageUrl} h={80} w="auto" radius="sm" alt="" />
            <Button variant="subtle" color="red" size="xs" onClick={() => setRemovePhoto(true)}>
              Remove photo
            </Button>
          </Group>
        )}
        <FileInput
          label={bottle?.imageUrl ? 'Replace photo' : 'Photo'}
          description="JPEG, PNG or WebP, up to 5 MB"
          accept={PHOTO_TYPES.join(',')}
          clearable
          value={photo}
          onChange={setPhoto}
          error={photoError}
        />
        {save.error && !(save.error instanceof ApiError && Object.keys(save.error.fieldErrors).length) && (
          <Text c="red" size="sm">
            {save.error.message}
          </Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {bottle ? 'Save' : 'Add bottle'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
