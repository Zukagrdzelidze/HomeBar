package mini.homebar.order;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import mini.homebar.cocktail.Cocktail;

/** A Guest asking for one Cocktail under their name. It exists only until the Admin has made it. */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cocktail_id")
    private Cocktail cocktail;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public Order(Cocktail cocktail, String guestName) {
        this.cocktail = cocktail;
        this.guestName = guestName;
        this.createdAt = Instant.now();
    }
}
