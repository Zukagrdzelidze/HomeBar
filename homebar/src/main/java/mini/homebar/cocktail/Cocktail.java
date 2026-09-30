package mini.homebar.cocktail;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import mini.homebar.bottle.SpiritKind;

/** A fixed recipe, seeded by migrations. The app only reads Cocktails. */
@Entity
@Table(name = "cocktails")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cocktail {

    @Id
    private Long id;

    private String name;

    private String description;

    @Column(name = "ice_in_cup")
    private boolean iceInCup;

    @OneToMany(mappedBy = "cocktail")
    @OrderBy("position")
    private List<CocktailIngredient> ingredients = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "cocktail_cups", joinColumns = @JoinColumn(name = "cocktail_id"))
    @OrderColumn(name = "position")
    @Column(name = "cup")
    @Enumerated(EnumType.STRING)
    private List<Cup> cups = new ArrayList<>();

    /** Cocktail Categories: the Spirit Kinds this Cocktail contains, in recipe order. */
    public List<SpiritKind> categories() {
        return ingredients.stream()
                .map(CocktailIngredient::getSpiritKind)
                .filter(kind -> kind != null)
                .distinct()
                .toList();
    }

    public boolean uses(long mixerId) {
        return ingredients.stream()
                .anyMatch(ingredient -> ingredient.getMixer() != null && ingredient.getMixer().getId() == mixerId);
    }
}
