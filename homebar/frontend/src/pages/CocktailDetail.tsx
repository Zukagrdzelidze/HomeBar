import { ActionIcon, Box, Button, Divider, Group, List, Modal, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useState } from 'react'
import type { MenuItem } from '../api'
import CocktailPicture from '../CocktailPicture'
import { CloseIcon, DiceIcon, HeartIcon } from '../icons'
import { label } from '../labels'
import { ingredientName } from '../menu'
import Taste from '../Taste'
import OrderForm from './OrderForm'

type Props = {
  /** The Cocktail to show; undefined closes the dialog. */
  item: MenuItem | undefined
  similar: MenuItem[]
  favourite: boolean
  onToggleFavourite: () => void
  onOpen: (id: number) => void
  onClose: () => void
  /** Set when the Guest asked for a surprise, so they can ask for another. */
  onAnother?: () => void
}

/** Everything a Guest can know about one Cocktail, plus a few like it. */
export default function CocktailDetail({ item, similar, favourite, onToggleFavourite, onOpen, onClose, onAnother }: Props) {
  const mobile = useMediaQuery('(max-width: 36em)')
  // Keep showing the last Cocktail while the dialog animates closed.
  const [shown, setShown] = useState(item)
  if (item && item !== shown) setShown(item)

  return (
    <Modal.Root opened={Boolean(item)} onClose={onClose} size={640} radius="lg" fullScreen={mobile}>
      <Modal.Overlay blur={3} backgroundOpacity={0.55} />
      <Modal.Content>
        {shown && (
          <Modal.Body p={0}>
            <Box pos="relative">
              <CocktailPicture
                key={shown.id}
                name={shown.name}
                imageUrl={shown.imageUrl}
                cup={shown.servedIn}
                categories={shown.categories}
                iceInCup={shown.iceInCup}
                height={mobile ? 260 : 320}
              />
              <ActionIcon
                onClick={onClose}
                variant="white"
                color="dark"
                radius="xl"
                size="lg"
                aria-label="Close"
                pos="absolute"
                top={12}
                right={12}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
              >
                <CloseIcon />
              </ActionIcon>
            </Box>
            <Stack gap="lg" p={{ base: 'lg', sm: 'xl' }}>
              <Stack gap={8}>
                {shown.categories.length > 0 && (
                  <Text className="eyebrow">{shown.categories.map(label).join(' · ')}</Text>
                )}
                <Modal.Title ff="heading" fz={32} fw={600} lh={1.15}>
                  {shown.name}
                </Modal.Title>
                <Taste strength={shown.strength} flavours={shown.flavours} />
              </Stack>

              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
                <div>
                  <Text className="eyebrow" mb={6}>
                    What's in it
                  </Text>
                  <List size="sm" spacing={2}>
                    {shown.ingredients.map((ingredient) => (
                      <List.Item key={ingredientName(ingredient)}>{ingredientName(ingredient)}</List.Item>
                    ))}
                  </List>
                </div>
                <div>
                  <Text className="eyebrow" mb={6}>
                    Served
                  </Text>
                  <Text size="sm">
                    {shown.servedIn ? `${label(shown.servedIn)} glass` : 'Any glass'}
                    <br />
                    {shown.iceInCup ? 'Over ice' : 'No ice'}
                  </Text>
                </div>
              </SimpleGrid>

              {shown.description && (
                <div>
                  <Text className="eyebrow" mb={6}>
                    Recipe
                  </Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                    {shown.description}
                  </Text>
                </div>
              )}

              <OrderForm key={shown.id} item={shown} />

              <Group gap="sm">
                <Button
                  variant={favourite ? 'light' : 'default'}
                  color={favourite ? 'red' : undefined}
                  leftSection={<HeartIcon filled={favourite} size={16} />}
                  onClick={onToggleFavourite}
                  aria-pressed={favourite}
                >
                  {favourite ? 'In favourites' : 'Add to favourites'}
                </Button>
                {onAnother && (
                  <Button variant="light" leftSection={<DiceIcon size={16} />} onClick={onAnother}>
                    Another one
                  </Button>
                )}
              </Group>

              {similar.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Text className="eyebrow" mb="sm">
                      You might also like
                    </Text>
                    <SimpleGrid cols={3} spacing="sm">
                      {similar.map((other) => (
                        <UnstyledButton key={other.id} className="similar-drink" onClick={() => onOpen(other.id)}>
                          <Box style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
                            <CocktailPicture
                              name={other.name}
                              imageUrl={other.imageUrl}
                              cup={other.servedIn}
                              categories={other.categories}
                              iceInCup={other.iceInCup}
                              height={96}
                            />
                          </Box>
                          <Text size="sm" fw={500} mt={6} lineClamp={2} lh={1.3}>
                            {other.name}
                          </Text>
                        </UnstyledButton>
                      ))}
                    </SimpleGrid>
                  </div>
                </>
              )}
            </Stack>
          </Modal.Body>
        )}
      </Modal.Content>
    </Modal.Root>
  )
}
