package mini.homebar;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MixerApiTest extends ApiTest {

    record StockChange(Boolean inStock) {
    }

    @Test
    void adminSeesEveryMixerAndWhetherItIsInStock() {
        mixer("Lime juice", true);
        mixer("Tonic water", false);
        Api api = admin();

        var mixers = api.get("/api/mixers").json();

        assertThat(mixers.size()).isEqualTo(2);
        assertThat(mixers.get(0).get("name").asString()).isEqualTo("Lime juice");
        assertThat(mixers.get(0).get("inStock").asBoolean()).isTrue();
        assertThat(mixers.get(1).get("name").asString()).isEqualTo("Tonic water");
        assertThat(mixers.get(1).get("inStock").asBoolean()).isFalse();
    }

    @Test
    void adminMarksAMixerInOrOutOfStock() {
        long lime = mixer("Lime juice", true);
        Api api = admin();

        var outOfStock = api.patch("/api/mixers/" + lime, new StockChange(false));

        assertThat(outOfStock.status()).isEqualTo(200);
        assertThat(api.get("/api/mixers").json().get(0).get("inStock").asBoolean()).isFalse();

        api.patch("/api/mixers/" + lime, new StockChange(true));
        assertThat(api.get("/api/mixers").json().get(0).get("inStock").asBoolean()).isTrue();
    }

    @Test
    void stockChangeMustSayInOrOut() {
        long lime = mixer("Lime juice", true);

        assertThat(admin().patch("/api/mixers/" + lime, new StockChange(null)).status()).isEqualTo(400);
    }

    @Test
    void changingAnUnknownMixerIsNotFound() {
        assertThat(admin().patch("/api/mixers/999", new StockChange(true)).status()).isEqualTo(404);
    }
}
