package mini.homebar;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import mini.homebar.BottleApiTest.BottleForm;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;

class CocktailApiTest extends ApiTest {

    @Test
    void adminSeesTheFullRecipeOfACocktail() {
        long lime = mixer("Lime juice", true);
        long syrup = mixer("Simple syrup", true);
        long id = cocktail("Daiquiri")
                .description("Rum, lime and sugar, shaken hard")
                .cups("COUPE", "MARTINI")
                .spiritKind("2 oz", "WHITE_RUM")
                .mixer("1 oz", lime)
                .mixer("0.75 oz", syrup)
                .insert();
        Api api = admin();

        var daiquiri = api.get("/api/cocktails/" + id).json();

        assertThat(daiquiri.get("name").asString()).isEqualTo("Daiquiri");
        assertThat(daiquiri.get("description").asString()).isEqualTo("Rum, lime and sugar, shaken hard");
        assertThat(daiquiri.get("iceInCup").asBoolean()).isFalse();
        assertThat(texts(daiquiri.get("cups"))).containsExactly("COUPE", "MARTINI");
        var ingredients = daiquiri.get("ingredients");
        assertThat(ingredients.size()).isEqualTo(3);
        assertThat(ingredients.get(0).get("amount").asString()).isEqualTo("2 oz");
        assertThat(ingredients.get(0).get("spiritKind").asString()).isEqualTo("WHITE_RUM");
        assertThat(ingredients.get(0).get("mixer").isNull()).isTrue();
        assertThat(ingredients.get(1).get("amount").asString()).isEqualTo("1 oz");
        assertThat(ingredients.get(1).get("spiritKind").isNull()).isTrue();
        assertThat(ingredients.get(1).get("mixer").get("id").asLong()).isEqualTo(lime);
        assertThat(ingredients.get(1).get("mixer").get("name").asString()).isEqualTo("Lime juice");
        assertThat(ingredients.get(2).get("mixer").get("name").asString()).isEqualTo("Simple syrup");
    }

    @Test
    void cocktailCategoriesAreTheSpiritKindsItContains() {
        cocktail("Negroni").overIce().cups("OLD_FASHIONED", "WINE")
                .spiritKind("1 oz", "GIN").spiritKind("1 oz", "CAMPARI").spiritKind("1 oz", "SWEET_VERMOUTH")
                .insert();

        var negroni = admin().get("/api/cocktails").json().get(0);

        assertThat(negroni.get("iceInCup").asBoolean()).isTrue();
        assertThat(texts(negroni.get("categories"))).containsExactly("GIN", "CAMPARI", "SWEET_VERMOUTH");
    }

    @Test
    void anUnknownCocktailIsNotFound() {
        assertThat(admin().get("/api/cocktails/999").status()).isEqualTo(404);
    }

    long bottle(Api api, String name, String spiritKind, boolean sipping, String status) {
        return api.post("/api/bottles", new BottleForm(name, spiritKind, sipping, null, status)).json().get("id").asLong();
    }

    long daiquiri(long lime) {
        return cocktail("Daiquiri").cups("COUPE", "MARTINI").spiritKind("2 oz", "WHITE_RUM").mixer("1 oz", lime).insert();
    }

    @Test
    void aCocktailIsMakeableWhenEveryIngredientIsInStock() {
        long lime = mixer("Lime juice", true);
        long id = daiquiri(lime);
        Api api = admin();
        bottle(api, "Havana Club 3", "WHITE_RUM", false, "IN_STOCK");

        var daiquiri = api.get("/api/cocktails/" + id).json();

        assertThat(daiquiri.get("makeable").asBoolean()).isTrue();
        assertThat(daiquiri.get("missing").size()).isZero();
    }

    @Test
    void aRunningLowBottleStillCounts() {
        long id = daiquiri(mixer("Lime juice", true));
        Api api = admin();
        bottle(api, "Havana Club 3", "WHITE_RUM", false, "LOW");

        assertThat(api.get("/api/cocktails/" + id).json().get("makeable").asBoolean()).isTrue();
    }

    @Test
    void aRevokedBottleDoesNotCountAndShowsAsMissing() {
        long id = daiquiri(mixer("Lime juice", true));
        Api api = admin();
        long rum = bottle(api, "Havana Club 3", "WHITE_RUM", false, "IN_STOCK");

        api.post("/api/bottles/" + rum + "/revoke", "");

        var daiquiri = api.get("/api/cocktails/" + id).json();
        assertThat(daiquiri.get("makeable").asBoolean()).isFalse();
        assertThat(daiquiri.get("missing").size()).isEqualTo(1);
        assertThat(daiquiri.get("missing").get(0).get("spiritKind").asString()).isEqualTo("WHITE_RUM");
    }

    @Test
    void aSippingBottleNeverCountsTowardACocktail() {
        long id = daiquiri(mixer("Lime juice", true));
        Api api = admin();
        bottle(api, "Very Old Rum", "WHITE_RUM", true, "IN_STOCK");

        assertThat(api.get("/api/cocktails/" + id).json().get("makeable").asBoolean()).isFalse();
    }

    @Test
    void anyOneBottleOfTheSpiritKindIsEnough() {
        long id = daiquiri(mixer("Lime juice", true));
        Api api = admin();
        bottle(api, "Bacardi", "WHITE_RUM", false, "EMPTY");
        bottle(api, "Havana Club 3", "WHITE_RUM", false, "IN_STOCK");

        assertThat(api.get("/api/cocktails/" + id).json().get("makeable").asBoolean()).isTrue();
    }

    @Test
    void anOutOfStockMixerShowsAsMissing() {
        long lime = mixer("Lime juice", true);
        long id = daiquiri(lime);
        Api api = admin();
        bottle(api, "Havana Club 3", "WHITE_RUM", false, "IN_STOCK");

        api.patch("/api/mixers/" + lime, new MixerApiTest.StockChange(false));

        var daiquiri = api.get("/api/cocktails/" + id).json();
        assertThat(daiquiri.get("makeable").asBoolean()).isFalse();
        assertThat(daiquiri.get("missing").size()).isEqualTo(1);
        assertThat(daiquiri.get("missing").get(0).get("mixer").get("name").asString()).isEqualTo("Lime juice");
    }

    @Test
    void cocktailsCanBeFilteredToMakeableOnesAndByCategory() {
        long lime = mixer("Lime juice", true);
        daiquiri(lime);
        cocktail("Gimlet").cups("COUPE", "MARTINI").spiritKind("2 oz", "GIN").mixer("0.75 oz", lime).insert();
        cocktail("Negroni").cups("OLD_FASHIONED", "WINE")
                .spiritKind("1 oz", "GIN").spiritKind("1 oz", "CAMPARI").spiritKind("1 oz", "SWEET_VERMOUTH").insert();
        Api api = admin();
        bottle(api, "Tanqueray", "GIN", false, "IN_STOCK");

        var makeable = api.get("/api/cocktails?makeable=true").json();
        var ginCocktails = api.get("/api/cocktails?category=GIN").json();

        assertThat(makeable.size()).isEqualTo(1);
        assertThat(makeable.get(0).get("name").asString()).isEqualTo("Gimlet");
        assertThat(ginCocktails.size()).isEqualTo(2);
        assertThat(ginCocktails.get(0).get("name").asString()).isEqualTo("Gimlet");
        assertThat(ginCocktails.get(1).get("name").asString()).isEqualTo("Negroni");
    }

    static List<String> texts(JsonNode array) {
        List<String> texts = new ArrayList<>();
        array.forEach(node -> texts.add(node.asString()));
        return texts;
    }
}
