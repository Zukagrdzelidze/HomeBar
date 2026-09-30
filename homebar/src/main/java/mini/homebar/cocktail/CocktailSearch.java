package mini.homebar.cocktail;

import java.util.List;

import mini.homebar.bottle.SpiritKind;

/**
 * The Admin's Cocktail search. Every given criterion must hold; missing criteria match everything.
 *
 * @param makeable    Makeable now (or, when false, not)
 * @param category    uses this Spirit Kind (one of its Cocktail Categories)
 * @param q           name contains this, ignoring case
 * @param missing     exactly this many Missing Ingredients
 * @param maxMissing  at most this many Missing Ingredients
 * @param missingOnly at least one Missing Ingredient, and all of them of this kind
 * @param mixerId     uses this Mixer
 */
record CocktailSearch(Boolean makeable, SpiritKind category, String q, Integer missing, Integer maxMissing,
                      MissingKind missingOnly, Long mixerId) {

    enum MissingKind { MIXERS, SPIRIT_KINDS }

    /** The Guests' menu: Makeable Cocktails only, narrowed by name. */
    static CocktailSearch menu(String q) {
        return new CocktailSearch(true, null, q, null, null, null, null);
    }

    boolean matches(Cocktail cocktail, List<MissingIngredient> missingIngredients) {
        int missingCount = missingIngredients.size();
        return (makeable == null || (missingCount == 0) == makeable)
                && (category == null || cocktail.categories().contains(category))
                && (q == null || q.isBlank() || cocktail.getName().toLowerCase().contains(q.trim().toLowerCase()))
                && (missing == null || missingCount == missing)
                && (maxMissing == null || missingCount <= maxMissing)
                && (missingOnly == null || missingCount > 0 && missingIngredients.stream()
                        .allMatch(ingredient -> ingredient.isMixer() == (missingOnly == MissingKind.MIXERS)))
                && (mixerId == null || cocktail.uses(mixerId));
    }
}
