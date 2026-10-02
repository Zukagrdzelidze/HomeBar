import { useLocalStorage } from '@mantine/hooks'

/** The Cocktails a Guest has hearted, kept in this browser only (Guests never log in). */
export function useFavourites() {
  const [stored, setStored] = useLocalStorage<number[]>({
    key: 'homebar:favourites',
    defaultValue: [],
    getInitialValueInEffect: false,
  })
  // Anything other than a list (hand-edited or from an older version) counts as no favourites.
  const ids = Array.isArray(stored) ? stored : []

  return {
    ids,
    has: (id: number) => ids.includes(id),
    toggle: (id: number) => setStored(ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]),
  }
}
