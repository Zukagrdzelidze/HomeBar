package mini.homebar.bottle;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bottles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bottle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "spirit_kind")
    private SpiritKind spiritKind;

    /** A Sipping Bottle never counts toward making a Cocktail. */
    private boolean sipping;

    private String description;

    @Enumerated(EnumType.STRING)
    private BottleStatus status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;

    public Bottle(String name, SpiritKind spiritKind, boolean sipping, String description, BottleStatus status) {
        update(name, spiritKind, sipping, description, status);
    }

    public void update(String name, SpiritKind spiritKind, boolean sipping, String description, BottleStatus status) {
        this.name = name;
        this.spiritKind = spiritKind;
        this.sipping = sipping;
        this.description = description;
        this.status = status;
    }

    /** Revoke: the Bottle is finished, but it and its Description stay on record. */
    public void revoke() {
        status = BottleStatus.EMPTY;
    }

    public void restock() {
        status = BottleStatus.IN_STOCK;
    }

    /** Counts toward a Makeable Cocktail: has something left and isn't a Sipping Bottle. */
    public boolean pourableInCocktails() {
        return !sipping && status.hasSomeLeft();
    }

    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
