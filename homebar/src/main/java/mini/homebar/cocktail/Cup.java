package mini.homebar.cocktail;

/**
 * A glass a Cocktail can be served in. Stored as text in each Cocktail's cups, so adding one needs no migration,
 * but renaming or removing one that seeded Cocktails use does.
 */
public enum Cup {
    OLD_FASHIONED,
    MARTINI,
    COUPE,
    WINE,
    CHAMPAGNE,
    HIGHBALL_COLLINS,
    HURRICANE
}
