package mini.homebar.cocktail;

import java.util.Set;

/**
 * The Strength and Flavours a Guest wants. A Cocktail matches when it has the picked Strength (if any)
 * and every picked Flavour.
 */
record TastePick(Strength strength, Set<Flavour> flavours) {

    boolean matches(Cocktail cocktail) {
        return (strength == null || cocktail.getStrength() == strength)
                && cocktail.getFlavours().containsAll(flavours);
    }
}
