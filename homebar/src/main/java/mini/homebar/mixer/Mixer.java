package mini.homebar.mixer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** A non-alcoholic ingredient from the fixed, migration-seeded list. Only its stock changes in the app. */
@Entity
@Table(name = "mixers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mixer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean liquid;

    @Column(name = "in_stock")
    private boolean inStock;

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
