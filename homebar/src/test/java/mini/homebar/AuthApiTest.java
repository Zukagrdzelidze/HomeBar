package mini.homebar;

import static org.assertj.core.api.Assertions.assertThat;

import mini.homebar.Api.Credentials;
import org.junit.jupiter.api.Test;

class AuthApiTest extends ApiTest {

    @Test
    void firstAdminCanRegisterAndIsLoggedIn() {
        Api api = anonymous();

        var registered = api.post("/api/auth/register", new Credentials("zuka", "secret-pass"));

        assertThat(registered.status()).isEqualTo(201);
        var me = api.get("/api/auth/me");
        assertThat(me.status()).isEqualTo(200);
        assertThat(me.json().get("name").asString()).isEqualTo("zuka");
    }

    @Test
    void registrationClosesOnceAnAdminExists() {
        assertThat(anonymous().get("/api/auth/registration-open").json().get("open").asBoolean()).isTrue();
        anonymous().post("/api/auth/register", new Credentials("zuka", "secret-pass"));

        var second = anonymous().post("/api/auth/register", new Credentials("intruder", "secret-pass"));

        assertThat(second.status()).isEqualTo(409);
        assertThat(anonymous().get("/api/auth/registration-open").json().get("open").asBoolean()).isFalse();
    }

    @Test
    void adminCanLogInWithTheirPassword() {
        anonymous().post("/api/auth/register", new Credentials("zuka", "secret-pass"));
        Api api = anonymous();

        var login = api.post("/api/auth/login", new Credentials("zuka", "secret-pass"));

        assertThat(login.status()).isEqualTo(200);
        assertThat(api.get("/api/auth/me").json().get("name").asString()).isEqualTo("zuka");
    }

    @Test
    void wrongPasswordIsRejected() {
        anonymous().post("/api/auth/register", new Credentials("zuka", "secret-pass"));
        Api api = anonymous();

        var login = api.post("/api/auth/login", new Credentials("zuka", "not-my-password"));

        assertThat(login.status()).isEqualTo(401);
        assertThat(api.get("/api/auth/me").status()).isEqualTo(401);
    }

    @Test
    void registrationRequiresNameAndPassword() {
        var registered = anonymous().post("/api/auth/register", new Credentials("", "short"));

        assertThat(registered.status()).isEqualTo(400);
        assertThat(registered.json().get("errors").has("name")).isTrue();
        assertThat(registered.json().get("errors").has("password")).isTrue();
    }

    @Test
    void apiRequiresLogin() {
        assertThat(anonymous().get("/api/bottles").status()).isEqualTo(401);
        assertThat(anonymous().get("/api/mixers").status()).isEqualTo(401);
        assertThat(anonymous().get("/api/cocktails").status()).isEqualTo(401);
    }

    @Test
    void adminCanLogOut() {
        Api api = admin();

        var logout = api.post("/api/auth/logout", "");

        assertThat(logout.status()).isEqualTo(200);
        assertThat(api.get("/api/auth/me").status()).isEqualTo(401);
    }
}
