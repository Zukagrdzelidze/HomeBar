package mini.homebar;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BottleApiTest extends ApiTest {

    record BottleForm(String name, String spiritKind, boolean sipping, String description, String status) {
    }

    static BottleForm tanqueray() {
        return new BottleForm("Tanqueray London Dry", "GIN", false, "Juniper-forward, great in a Negroni", "IN_STOCK");
    }

    @Test
    void adminAddsABottleAndSeesItOnTheShelf() {
        Api api = admin();

        var created = api.post("/api/bottles", tanqueray());

        assertThat(created.status()).isEqualTo(201);
        var bottles = api.get("/api/bottles").json();
        assertThat(bottles.size()).isEqualTo(1);
        var bottle = bottles.get(0);
        assertThat(bottle.get("id").asLong()).isEqualTo(created.json().get("id").asLong());
        assertThat(bottle.get("name").asString()).isEqualTo("Tanqueray London Dry");
        assertThat(bottle.get("spiritKind").asString()).isEqualTo("GIN");
        assertThat(bottle.get("sipping").asBoolean()).isFalse();
        assertThat(bottle.get("description").asString()).isEqualTo("Juniper-forward, great in a Negroni");
        assertThat(bottle.get("status").asString()).isEqualTo("IN_STOCK");
        assertThat(bottle.get("imageUrl").isNull()).isTrue();
    }

    @Test
    void adminEditsEveryFieldOfABottle() {
        Api api = admin();
        long id = api.post("/api/bottles", tanqueray()).json().get("id").asLong();

        var edited = api.put("/api/bottles/" + id,
                new BottleForm("Tanqueray No. Ten", "GIN", true, "Too good to mix", "LOW"));

        assertThat(edited.status()).isEqualTo(200);
        var bottle = api.get("/api/bottles").json().get(0);
        assertThat(bottle.get("name").asString()).isEqualTo("Tanqueray No. Ten");
        assertThat(bottle.get("sipping").asBoolean()).isTrue();
        assertThat(bottle.get("description").asString()).isEqualTo("Too good to mix");
        assertThat(bottle.get("status").asString()).isEqualTo("LOW");
    }

    @Test
    void revokingABottleEmptiesItButKeepsItsDescription() {
        Api api = admin();
        long id = api.post("/api/bottles", tanqueray()).json().get("id").asLong();

        var revoked = api.post("/api/bottles/" + id + "/revoke", "");

        assertThat(revoked.status()).isEqualTo(200);
        var bottle = api.get("/api/bottles").json().get(0);
        assertThat(bottle.get("status").asString()).isEqualTo("EMPTY");
        assertThat(bottle.get("description").asString()).isEqualTo("Juniper-forward, great in a Negroni");
    }

    @Test
    void aRevokedBottleCanBeRestocked() {
        Api api = admin();
        long id = api.post("/api/bottles", tanqueray()).json().get("id").asLong();
        api.post("/api/bottles/" + id + "/revoke", "");

        var restocked = api.post("/api/bottles/" + id + "/restock", "");

        assertThat(restocked.status()).isEqualTo(200);
        assertThat(api.get("/api/bottles").json().get(0).get("status").asString()).isEqualTo("IN_STOCK");
    }

    @Test
    void aBottleNeedsANameAndAKnownSpiritKind() {
        Api api = admin();

        var nameless = api.post("/api/bottles", new BottleForm(" ", "GIN", false, null, "IN_STOCK"));
        var unknownKind = api.post("/api/bottles", new BottleForm("Mystery", "MOONSHINE", false, null, "IN_STOCK"));

        assertThat(nameless.status()).isEqualTo(400);
        assertThat(nameless.json().get("errors").has("name")).isTrue();
        assertThat(unknownKind.status()).isEqualTo(400);
        assertThat(unknownKind.json().get("errors").has("spiritKind")).isTrue();
        assertThat(api.get("/api/bottles").json().size()).isZero();
    }

    @Test
    void changingAnUnknownBottleIsNotFound() {
        Api api = admin();

        assertThat(api.put("/api/bottles/999", tanqueray()).status()).isEqualTo(404);
        assertThat(api.post("/api/bottles/999/revoke", "").status()).isEqualTo(404);
    }

    @Test
    void bottlesCanBeFilteredByStatusAndSpiritKind() {
        Api api = admin();
        api.post("/api/bottles", tanqueray());
        api.post("/api/bottles", new BottleForm("Hendrick's", "GIN", false, null, "EMPTY"));
        api.post("/api/bottles", new BottleForm("Buffalo Trace", "BOURBON", false, null, "LOW"));

        var gins = api.get("/api/bottles?spiritKind=GIN").json();
        var empty = api.get("/api/bottles?status=EMPTY").json();

        assertThat(gins.size()).isEqualTo(2);
        assertThat(empty.size()).isEqualTo(1);
        assertThat(empty.get(0).get("name").asString()).isEqualTo("Hendrick's");
    }
}
