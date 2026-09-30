package mini.homebar;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

/** Base class for tests at the HTTP seam: the whole app on a random port, backed by Postgres with real migrations. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
abstract class ApiTest {

    @LocalServerPort
    int port;

    @Autowired
    JdbcTemplate jdbc;

    @BeforeEach
    void emptyDatabase() {
        var tables = jdbc.queryForList("""
                select tablename from pg_tables
                where schemaname = 'public' and tablename <> 'flyway_schema_history'
                """, String.class);
        if (!tables.isEmpty()) {
            jdbc.execute("truncate table " + String.join(", ", tables) + " restart identity cascade");
        }
    }

    Api anonymous() {
        return new Api(port);
    }

    Api admin() {
        return new Api(port).asAdmin();
    }

    /** Mixers are seed data with no create endpoint, so tests put them on the list directly. */
    long mixer(String name, boolean inStock) {
        return jdbc.queryForObject("insert into mixers (name, liquid, in_stock) values (?, true, ?) returning id",
                Long.class, name, inStock);
    }

    /** Cocktails are seed data with no create endpoint, so tests put recipes in directly. */
    CocktailSeed cocktail(String name) {
        return new CocktailSeed(name);
    }

    class CocktailSeed {

        private final String name;
        private String description = "";
        private boolean iceInCup;
        private final java.util.List<String> cups = new java.util.ArrayList<>();
        private final java.util.List<Object[]> ingredients = new java.util.ArrayList<>();

        CocktailSeed(String name) {
            this.name = name;
        }

        CocktailSeed description(String description) {
            this.description = description;
            return this;
        }

        CocktailSeed overIce() {
            this.iceInCup = true;
            return this;
        }

        CocktailSeed cups(String... cups) {
            this.cups.addAll(java.util.List.of(cups));
            return this;
        }

        CocktailSeed spiritKind(String amount, String spiritKind) {
            ingredients.add(new Object[] {amount, spiritKind, null});
            return this;
        }

        CocktailSeed mixer(String amount, long mixerId) {
            ingredients.add(new Object[] {amount, null, mixerId});
            return this;
        }

        long insert() {
            long id = jdbc.queryForObject(
                    "insert into cocktails (name, description, ice_in_cup, cups) values (?, ?, ?, ?) returning id",
                    Long.class, name, description, iceInCup, String.join(",", cups));
            for (int i = 0; i < ingredients.size(); i++) {
                Object[] ingredient = ingredients.get(i);
                jdbc.update("""
                        insert into cocktail_ingredients (cocktail_id, position, amount, spirit_kind, mixer_id)
                        values (?, ?, ?, ?, ?)""", id, i, ingredient[0], ingredient[1], ingredient[2]);
            }
            return id;
        }
    }
}
