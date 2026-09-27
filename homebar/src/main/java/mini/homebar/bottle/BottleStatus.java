package mini.homebar.bottle;

public enum BottleStatus {
    IN_STOCK,
    LOW,
    EMPTY;

    /** A running-low Bottle still has something in it; only an empty (revoked) one doesn't. */
    public boolean hasSomeLeft() {
        return this != EMPTY;
    }
}
