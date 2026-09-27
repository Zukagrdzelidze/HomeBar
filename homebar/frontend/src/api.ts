// Types and calls for the HomeBar API. Vocabulary follows CONTEXT.md.

export type BottleStatus = 'IN_STOCK' | 'LOW' | 'EMPTY'

export type Bottle = {
  id: number
  name: string
  spiritKind: string
  sipping: boolean
  description: string | null
  status: BottleStatus
  imageUrl: string | null
}

export type BottleForm = Omit<Bottle, 'id' | 'imageUrl'>

export type Mixer = {
  id: number
  name: string
  liquid: boolean
  inStock: boolean
}

export type CocktailIngredient = {
  amount: string
  spiritKind: string | null
  mixer: { id: number; name: string } | null
}

export type Cocktail = {
  id: number
  name: string
  description: string
  iceInCup: boolean
  cups: string[]
  ingredients: CocktailIngredient[]
  categories: string[]
  makeable: boolean
  missing: CocktailIngredient[]
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function csrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (method !== 'GET' && !csrfToken()) {
    await fetch('/api/auth/csrf')
  }
  const headers: Record<string, string> = {}
  const token = csrfToken()
  if (token) headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const response = await fetch(path, { method, headers, body: payload })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error.message ?? error.detail ?? response.statusText, error.errors ?? {})
  }
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  me: () => request<{ name: string }>('GET', '/api/auth/me'),
  registrationOpen: () => request<{ open: boolean }>('GET', '/api/auth/registration-open'),
  register: (name: string, password: string) => request('POST', '/api/auth/register', { name, password }),
  login: (name: string, password: string) => request('POST', '/api/auth/login', { name, password }),
  logout: () => request('POST', '/api/auth/logout'),

  bottles: () => request<Bottle[]>('GET', '/api/bottles'),
  addBottle: (form: BottleForm) => request<Bottle>('POST', '/api/bottles', form),
  editBottle: (id: number, form: BottleForm) => request<Bottle>('PUT', `/api/bottles/${id}`, form),
  revokeBottle: (id: number) => request<Bottle>('POST', `/api/bottles/${id}/revoke`),
  restockBottle: (id: number) => request<Bottle>('POST', `/api/bottles/${id}/restock`),
  uploadBottleImage: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<Bottle>('PUT', `/api/bottles/${id}/image`, form)
  },
  removeBottleImage: (id: number) => request('DELETE', `/api/bottles/${id}/image`),

  mixers: () => request<Mixer[]>('GET', '/api/mixers'),
  setMixerStock: (id: number, inStock: boolean) => request<Mixer>('PATCH', `/api/mixers/${id}`, { inStock }),

  cocktails: () => request<Cocktail[]>('GET', '/api/cocktails'),
}
