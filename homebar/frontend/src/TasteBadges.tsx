import { Badge, Group } from '@mantine/core'
import type { Flavour, Strength } from './api'
import { label, STRENGTH_COLOR } from './labels'

/** A Cocktail's Strength, then its Flavours. */
export default function TasteBadges({ strength, flavours }: { strength: Strength; flavours: Flavour[] }) {
  return (
    <Group gap={6}>
      <Badge color={STRENGTH_COLOR[strength]} variant="filled" size="sm">
        {label(strength)}
      </Badge>
      {flavours.map((flavour) => (
        <Badge key={flavour} color="grape" variant="light" size="sm">
          {label(flavour)}
        </Badge>
      ))}
    </Group>
  )
}
