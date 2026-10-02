export const SPIRIT_KINDS = [
  'VODKA', 'VANILLA_VODKA', 'GIN', 'WHITE_RUM', 'DARK_RUM', 'OVERPROOF_RUM', 'TEQUILA', 'REPOSADO_TEQUILA',
  'MEZCAL', 'WHISKEY', 'BOURBON', 'RYE_WHISKEY', 'IRISH_WHISKEY', 'BLENDED_SCOTCH', 'ISLAY_SCOTCH', 'BRANDY',
  'CALVADOS', 'PISCO',
  'SWEET_VERMOUTH', 'DRY_VERMOUTH', 'CAMPARI', 'APEROL', 'LILLET_BLANC',
  'TRIPLE_SEC', 'COFFEE_LIQUEUR', 'AMARETTO', 'MARASCHINO_LIQUEUR', 'RASPBERRY_LIQUEUR', 'PASSION_FRUIT_LIQUEUR',
  'CREME_DE_CASSIS', 'CREME_DE_MURE', 'CREME_DE_VIOLETTE', 'CREME_DE_CACAO', 'CREME_DE_MENTHE',
  'GREEN_CHARTREUSE', 'YELLOW_CHARTREUSE', 'ELDERFLOWER_LIQUEUR', 'DRAMBUIE', 'BENEDICTINE', 'AMARO_NONINO',
  'ABSINTHE', 'FALERNUM',
  'ANGOSTURA_BITTERS', 'PEYCHAUDS_BITTERS',
  'CHAMPAGNE', 'PROSECCO',
]

/** WHITE_RUM → "White rum" */
export function label(value: string): string {
  const words = value.toLowerCase().replaceAll('_', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const STRENGTHS = ['LIGHT', 'MEDIUM', 'STRONG'] as const
export const FLAVOURS = [
  'SWEET', 'SOUR', 'BITTER', 'FRUITY', 'REFRESHING', 'CREAMY', 'HERBAL', 'SPICY', 'SMOKY', 'COFFEE',
] as const
export const STRENGTH_COLOR = { LIGHT: 'teal', MEDIUM: 'yellow', STRONG: 'red' } as const

export const STATUS_LABEL = { IN_STOCK: 'In stock', LOW: 'Running low', EMPTY: 'Empty' } as const
export const STATUS_COLOR = { IN_STOCK: 'green', LOW: 'yellow', EMPTY: 'gray' } as const

export function ingredientLabel(ingredient: { amount: string; spiritKind: string | null; mixer: { name: string } | null }) {
  return `${ingredient.amount} ${ingredient.spiritKind ? label(ingredient.spiritKind) : ingredient.mixer?.name}`
}

/** Same key for an ingredient line and its Missing Ingredient, so a card can tell which lines are missing. */
export function ingredientKey(ingredient: { spiritKind: string | null; mixer: { id: number } | null }) {
  return ingredient.spiritKind ?? `mixer:${ingredient.mixer?.id}`
}
