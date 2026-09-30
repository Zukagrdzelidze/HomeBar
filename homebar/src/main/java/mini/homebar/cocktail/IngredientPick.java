package mini.homebar.cocktail;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import mini.homebar.bottle.SpiritKind;

/**
 * The Spirit Kinds and Mixers a Guest wants in their drink.
 * Spirit Kinds match by kind and Mixers by the specific Mixer, as in the Makeable rule.
 */
record IngredientPick(Set<SpiritKind> spiritKinds, Set<Long> mixerIds) {

    /** How many close matches to offer when no Cocktail contains everything picked. */
    static final int CLOSEST_LIMIT = 5;

    /** A Cocktail and the picked Spirit Kinds and Mixers it doesn't contain. */
    record Match(Cocktail cocktail, List<SpiritKind> lackingSpiritKinds, List<Long> lackingMixerIds) {

        int lackingCount() {
            return lackingSpiritKinds.size() + lackingMixerIds.size();
        }
    }

    /** exact is true when every match contains everything picked (always the case for an empty pick). */
    record Result(boolean exact, List<Match> matches) {
    }

    boolean isEmpty() {
        return spiritKinds.isEmpty() && mixerIds.isEmpty();
    }

    int size() {
        return spiritKinds.size() + mixerIds.size();
    }

    /**
     * Every Cocktail containing everything picked; if there is none, the closest few:
     * fewest picked items lacking, then fewest ingredients, then name. A Cocktail with nothing picked in it never matches.
     */
    Result rank(List<Cocktail> cocktails) {
        var matches = cocktails.stream().map(this::match).toList();
        var exact = matches.stream().filter(match -> match.lackingCount() == 0).toList();
        if (!exact.isEmpty() || isEmpty()) {
            return new Result(true, exact);
        }
        var closest = matches.stream()
                .filter(match -> match.lackingCount() < size())
                .sorted(Comparator.comparingInt(Match::lackingCount)
                        .thenComparingInt(match -> match.cocktail().getIngredients().size())
                        .thenComparing(match -> match.cocktail().getName(), String.CASE_INSENSITIVE_ORDER))
                .limit(CLOSEST_LIMIT)
                .toList();
        return new Result(false, closest);
    }

    private Match match(Cocktail cocktail) {
        var lackingSpiritKinds = new ArrayList<SpiritKind>();
        for (var kind : spiritKinds) {
            if (!cocktail.categories().contains(kind)) {
                lackingSpiritKinds.add(kind);
            }
        }
        var lackingMixerIds = new ArrayList<Long>();
        for (var mixerId : mixerIds) {
            if (!cocktail.uses(mixerId)) {
                lackingMixerIds.add(mixerId);
            }
        }
        return new Match(cocktail, lackingSpiritKinds, lackingMixerIds);
    }
}
