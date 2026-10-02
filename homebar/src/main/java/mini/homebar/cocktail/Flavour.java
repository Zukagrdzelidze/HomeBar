package mini.homebar.cocktail;

/**
 * A taste a Cocktail has. A Cocktail can have several, or none.
 * Stored as text in each Cocktail's flavours, so adding one needs no schema change,
 * but renaming or removing one that seeded Cocktails use does.
 */
public enum Flavour {
    SWEET,
    SOUR,
    BITTER,
    FRUITY,
    REFRESHING,
    CREAMY,
    HERBAL,
    SPICY,
    SMOKY,
    COFFEE
}
