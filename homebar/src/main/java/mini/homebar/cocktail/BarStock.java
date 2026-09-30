package mini.homebar.cocktail;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import mini.homebar.bottle.Bottle;
import mini.homebar.bottle.SpiritKind;
import mini.homebar.mixer.Mixer;

/**
 * What the bar can pour right now, and so which Cocktails are Makeable.
 * A Spirit Kind is covered by any Bottle of that kind that has something left and isn't a Sipping Bottle;
 * a Mixer is covered when it is in stock.
 */
public final class BarStock {

    private final Set<SpiritKind> pourableSpiritKinds;
    private final Set<Long> mixersInStock;

    private BarStock(Set<SpiritKind> pourableSpiritKinds, Set<Long> mixersInStock) {
        this.pourableSpiritKinds = pourableSpiritKinds;
        this.mixersInStock = mixersInStock;
    }

    public static BarStock of(Collection<Bottle> bottles, Collection<Mixer> mixers) {
        return new BarStock(
                bottles.stream().filter(Bottle::pourableInCocktails).map(Bottle::getSpiritKind).collect(Collectors.toSet()),
                mixers.stream().filter(Mixer::isInStock).map(Mixer::getId).collect(Collectors.toSet()));
    }

    /** The Missing Ingredients, each distinct thing to buy once, in recipe order; empty means the Cocktail is Makeable. */
    public List<MissingIngredient> missingFor(Cocktail cocktail) {
        return cocktail.getIngredients().stream()
                .filter(ingredient -> !covers(ingredient))
                .map(MissingIngredient::of)
                .distinct()
                .toList();
    }

    private boolean covers(CocktailIngredient ingredient) {
        return ingredient.getSpiritKind() != null
                ? pourableSpiritKinds.contains(ingredient.getSpiritKind())
                : mixersInStock.contains(ingredient.getMixer().getId());
    }
}
