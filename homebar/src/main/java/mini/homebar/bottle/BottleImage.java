package mini.homebar.bottle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** A Bottle's photo, kept apart from the Bottle so listing Bottles never loads image bytes. */
@Entity
@Table(name = "bottle_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class BottleImage {

    @Id
    @Column(name = "bottle_id")
    private Long bottleId;

    @Column(name = "content_type")
    private String contentType;

    private byte[] data;

    BottleImage(Long bottleId, String contentType, byte[] data) {
        this.bottleId = bottleId;
        this.contentType = contentType;
        this.data = data;
    }
}
