import { ActionIcon, Badge, Card, Stack, Text, Title } from '@mantine/core'
import type { MenuItem } from '../api'
import CocktailPicture from '../CocktailPicture'
import { HeartIcon } from '../icons'
import { label } from '../labels'
import { ingredientName } from '../menu'
import Taste from '../Taste'

type Props = {
  item: MenuItem
  favourite: boolean
  onToggleFavourite: () => void
  onOpen: () => void
}

export default function MenuCard({ item, favourite, onToggleFavourite, onOpen }: Props) {
  return (
    <Card withBorder padding="lg" className="menu-card">
      <Card.Section className="picture">
        <CocktailPicture
          name={item.name}
          imageUrl={item.imageUrl}
          cup={item.servedIn}
          categories={item.categories}
          iceInCup={item.iceInCup}
          height={230}
        />
      </Card.Section>
      <FavouriteButton favourite={favourite} name={item.name} onToggle={onToggleFavourite} />
      <Stack gap={8} mt="md">
        {item.categories.length > 0 && (
          <Text className="eyebrow" lineClamp={1}>
            {item.categories.map(label).join(' · ')}
          </Text>
        )}
        <Title order={3} fz={22} lh={1.2}>
          <button type="button" className="menu-card-open" onClick={onOpen}>
            {item.name}
          </button>
        </Title>
        <Taste strength={item.strength} flavours={item.flavours} />
        {item.lacking.length > 0 && (
          <Badge color="orange" variant="light" style={{ alignSelf: 'flex-start' }}>
            No {item.lacking.map(ingredientName).join(', no ')}
          </Badge>
        )}
        <Text size="sm" c="dimmed" lineClamp={2}>
          {item.ingredients.map(ingredientName).join(', ')}
        </Text>
      </Stack>
    </Card>
  )
}

export function FavouriteButton({ favourite, name, onToggle }: { favourite: boolean; name: string; onToggle: () => void }) {
  return (
    <ActionIcon
      className="favourite-button"
      variant="white"
      color={favourite ? 'red' : 'dark'}
      radius="xl"
      size="lg"
      onClick={onToggle}
      aria-pressed={favourite}
      aria-label={favourite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
    >
      <HeartIcon filled={favourite} />
    </ActionIcon>
  )
}
