import { useQuery } from '@tanstack/react-query'
import { api } from './api'

/** The Orders waiting to be made, oldest first. Polled, since Guests place them from their own phones. */
export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: api.orders, refetchInterval: 5000, refetchOnWindowFocus: true })
}
