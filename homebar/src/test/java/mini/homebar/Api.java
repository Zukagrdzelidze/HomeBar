package mini.homebar;

import java.net.CookieManager;
import java.net.HttpCookie;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublisher;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * A browser-like HTTP client for the HomeBar API: keeps the session cookie and sends the CSRF header,
 * the same way the React frontend does.
 */
class Api {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private final String baseUrl;
    private final CookieManager cookies = new CookieManager();
    private final HttpClient http;

    Api(int port) {
        this.baseUrl = "http://localhost:" + port;
        this.http = HttpClient.newBuilder().cookieHandler(cookies).build();
    }

    Response get(String path) {
        return send(HttpRequest.newBuilder(uri(path)).GET());
    }

    Response post(String path, Object body) {
        return sendJson("POST", path, body);
    }

    Response put(String path, Object body) {
        return sendJson("PUT", path, body);
    }

    Response patch(String path, Object body) {
        return sendJson("PATCH", path, body);
    }

    Response delete(String path) {
        return send(withCsrf(HttpRequest.newBuilder(uri(path)).DELETE()));
    }

    Response putFile(String path, String filename, String contentType, byte[] bytes) {
        String boundary = UUID.randomUUID().toString();
        byte[] head = ("--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n"
                + "Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
        byte[] tail = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
        BodyPublisher body = BodyPublishers.concat(
                BodyPublishers.ofByteArray(head), BodyPublishers.ofByteArray(bytes), BodyPublishers.ofByteArray(tail));
        return send(withCsrf(HttpRequest.newBuilder(uri(path))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .PUT(body)));
    }

    /** Registers the first Admin (or logs in if one exists) so the client is authenticated. */
    Api asAdmin() {
        Response registered = post("/api/auth/register", new Credentials("admin", "correct-horse"));
        if (registered.status() != 201) {
            Response loggedIn = post("/api/auth/login", new Credentials("admin", "correct-horse"));
            if (loggedIn.status() != 200) {
                throw new IllegalStateException("Could not log in: " + loggedIn);
            }
        }
        return this;
    }

    record Credentials(String name, String password) {
    }

    private Response sendJson(String method, String path, Object body) {
        return send(withCsrf(HttpRequest.newBuilder(uri(path))
                .header("Content-Type", "application/json")
                .method(method, BodyPublishers.ofString(JSON.writeValueAsString(body)))));
    }

    private HttpRequest.Builder withCsrf(HttpRequest.Builder request) {
        String token = csrfToken();
        if (token == null) {
            get("/api/auth/csrf");
            token = csrfToken();
        }
        return token == null ? request : request.header("X-XSRF-TOKEN", token);
    }

    private String csrfToken() {
        return cookies.getCookieStore().getCookies().stream()
                .filter(c -> c.getName().equals("XSRF-TOKEN"))
                .map(HttpCookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private Response send(HttpRequest.Builder request) {
        try {
            var response = http.send(request.build(), BodyHandlers.ofByteArray());
            return new Response(response.statusCode(),
                    response.headers().firstValue("Content-Type").orElse(null), response.body());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private URI uri(String path) {
        return URI.create(baseUrl + path);
    }

    record Response(int status, String contentType, byte[] bytes) {

        String body() {
            return new String(bytes, StandardCharsets.UTF_8);
        }

        JsonNode json() {
            return JSON.readTree(body());
        }

        @Override
        public String toString() {
            return status + " " + body();
        }
    }
}
