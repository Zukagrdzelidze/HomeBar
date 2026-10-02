import { Badge, Group, Text } from '@mantine/core'
import type { Flavour, Strength } from './api'
import { label, STRENGTH_COLOR } from './labels'

/** A Cocktail's Strength as a dot badge, then its Flavours as quiet text. */
export default function Taste({ strength, flavours }: { strength: Strength; flavours: Flavour[] }) {
  return (
    <Group gap={8} wrap="nowrap">
      <Badge variant="dot" color={STRENGTH_COLOR[strength]} size="md" style={{ flexShrink: 0 }}>
        {label(strength)}
      </Badge>
      {flavours.length > 0 && (
        <Text size="sm" c="dimmed" lineClamp={1}>
          {flavours.map(label).join(' · ')}
        </Text>
      )}
    </Group>
  )
}
