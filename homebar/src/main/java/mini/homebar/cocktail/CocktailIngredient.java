package mini.homebar.cocktail;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import mini.homebar.bottle.SpiritKind;
import mini.homebar.mixer.Mixer;

/** One line of a recipe: an amount plus either a Spirit Kind or a Mixer. */
@Entity
@Table(name = "cocktail_ingredients")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CocktailIngredient {

    @Id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cocktail_id")
    private Cocktail cocktail;

    private int position;

    private String amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "spirit_kind")
    private SpiritKind spiritKind;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mixer_id")
    private Mixer mixer;
}
