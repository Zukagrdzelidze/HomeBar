import type { MenuIngredient, MenuItem } from './api'
import { label } from './labels'

export function ingredientName(ingredient: MenuIngredient) {
  return ingredient.spiritKind ? label(ingredient.spiritKind) : (ingredient.mixer ?? '')
}

/**
 * Other Makeable Cocktails most like this one: a shared Spirit Kind counts double,
 * then each shared Flavour and a matching Strength. Needs at least one shared Spirit Kind or two other traits.
 */
export function similarDrinks(item: MenuItem, menu: MenuItem[], count = 3): MenuItem[] {
  const score = (other: MenuItem) =>
    2 * other.categories.filter((kind) => item.categories.includes(kind)).length +
    other.flavours.filter((flavour) => item.flavours.includes(flavour)).length +
    (other.strength === item.strength ? 1 : 0)

  return menu
    .filter((other) => other.id !== item.id)
    .map((other) => ({ other, score: score(other) }))
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score || a.other.name.localeCompare(b.other.name))
    .slice(0, count)
    .map(({ other }) => other)
}
