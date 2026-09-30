package mini.homebar.cocktail;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** A Cocktail's photo: the one part of a Cocktail the Admin edits in the UI (ADR 0002). */
@Entity
@Table(name = "cocktail_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class CocktailImage {

    @Id
    @Column(name = "cocktail_id")
    private Long cocktailId;

    @Column(name = "content_type")
    private String contentType;

    private byte[] data;

    static String urlFor(long cocktailId) {
        return "/api/cocktails/" + cocktailId + "/image";
    }

    CocktailImage(Long cocktailId, String contentType, byte[] data) {
        this.cocktailId = cocktailId;
        this.contentType = contentType;
        this.data = data;
    }
}
