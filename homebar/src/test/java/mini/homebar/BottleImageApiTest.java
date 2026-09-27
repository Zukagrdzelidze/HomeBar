package mini.homebar;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import mini.homebar.BottleApiTest.BottleForm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BottleImageApiTest extends ApiTest {

    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 1, 2, 3, 4};
    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 5, 6, 7};

    Api api;
    long bottleId;

    @BeforeEach
    void aBottleOnTheShelf() {
        api = admin();
        bottleId = api.post("/api/bottles", BottleApiTest.tanqueray()).json().get("id").asLong();
    }

    @Test
    void anUploadedPhotoCanBeFetchedBack() {
        var uploaded = api.putFile("/api/bottles/" + bottleId + "/image", "bottle.png", "image/png", PNG);

        assertThat(uploaded.status()).isEqualTo(200);
        String imageUrl = api.get("/api/bottles").json().get(0).get("imageUrl").asString();
        var image = api.get(imageUrl);
        assertThat(image.status()).isEqualTo(200);
        assertThat(image.contentType()).isEqualTo("image/png");
        assertThat(image.bytes()).isEqualTo(PNG);
    }

    @Test
    void uploadingAgainReplacesThePhoto() {
        api.putFile("/api/bottles/" + bottleId + "/image", "bottle.png", "image/png", PNG);

        api.putFile("/api/bottles/" + bottleId + "/image", "bottle.jpg", "image/jpeg", JPEG);

        var image = api.get("/api/bottles/" + bottleId + "/image");
        assertThat(image.contentType()).isEqualTo("image/jpeg");
        assertThat(image.bytes()).isEqualTo(JPEG);
    }

    @Test
    void aPhotoCanBeRemoved() {
        api.putFile("/api/bottles/" + bottleId + "/image", "bottle.png", "image/png", PNG);

        var removed = api.delete("/api/bottles/" + bottleId + "/image");

        assertThat(removed.status()).isEqualTo(204);
        assertThat(api.get("/api/bottles").json().get(0).get("imageUrl").isNull()).isTrue();
        assertThat(api.get("/api/bottles/" + bottleId + "/image").status()).isEqualTo(404);
    }

    @Test
    void onlyJpegPngOrWebpPhotosAreAccepted() {
        byte[] notAnImage = "just some text".getBytes();

        var rejected = api.putFile("/api/bottles/" + bottleId + "/image", "bottle.png", "image/png", notAnImage);

        assertThat(rejected.status()).isEqualTo(400);
        assertThat(api.get("/api/bottles/" + bottleId + "/image").status()).isEqualTo(404);
    }

    @Test
    void photosOver5MbAreRejected() {
        byte[] huge = Arrays.copyOf(PNG, 5 * 1024 * 1024 + 1);

        var rejected = api.putFile("/api/bottles/" + bottleId + "/image", "huge.png", "image/png", huge);

        assertThat(rejected.status()).isEqualTo(400);
        assertThat(api.get("/api/bottles/" + bottleId + "/image").status()).isEqualTo(404);
    }

    @Test
    void photosOverTheUploadLimitAreRejectedWithAMessage() {
        byte[] enormous = Arrays.copyOf(PNG, 25 * 1024 * 1024);

        var rejected = api.putFile("/api/bottles/" + bottleId + "/image", "enormous.png", "image/png", enormous);

        assertThat(rejected.status()).isEqualTo(400);
        assertThat(rejected.json().get("message").asString()).contains("5 MB");
    }

    @Test
    void aBottleWithoutAPhotoHasNoImage() {
        assertThat(api.get("/api/bottles").json().get(0).get("imageUrl").isNull()).isTrue();
        assertThat(api.get("/api/bottles/" + bottleId + "/image").status()).isEqualTo(404);
    }
}
