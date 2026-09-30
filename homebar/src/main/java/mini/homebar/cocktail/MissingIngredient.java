package mini.homebar.cocktail;

import mini.homebar.bottle.SpiritKind;

/**
 * A Spirit Kind or Mixer a Cocktail needs that current stock does not cover.
 * Compared by value, so a recipe asking for gin twice has one Missing Ingredient.
 */
public record MissingIngredient(SpiritKind spiritKind, Long mixerId, String mixerName) {

    static MissingIngredient of(CocktailIngredient ingredient) {
        var mixer = ingredient.getMixer();
        return mixer == null
                ? new MissingIngredient(ingredient.getSpiritKind(), null, null)
                : new MissingIngredient(null, mixer.getId(), mixer.getName());
    }

    public boolean isMixer() {
        return mixerId != null;
    }

    /** What the Admin would buy, for sorting: the Mixer's name or the Spirit Kind. */
    String displayName() {
        return isMixer() ? mixerName : spiritKind.name();
    }
}
