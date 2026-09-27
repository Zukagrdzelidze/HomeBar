package mini.homebar.bottle;

import java.util.Optional;

/** The photo formats a Bottle accepts, recognised by their leading bytes rather than the uploader's claimed type. */
enum ImageFormat {
    JPEG("image/jpeg"),
    PNG("image/png"),
    WEBP("image/webp");

    static final int MAX_BYTES = 5 * 1024 * 1024;

    final String contentType;

    ImageFormat(String contentType) {
        this.contentType = contentType;
    }

    static Optional<ImageFormat> detect(byte[] bytes) {
        if (startsWith(bytes, 0, 0xFF, 0xD8, 0xFF)) {
            return Optional.of(JPEG);
        }
        if (startsWith(bytes, 0, 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n')) {
            return Optional.of(PNG);
        }
        if (startsWith(bytes, 0, 'R', 'I', 'F', 'F') && startsWith(bytes, 8, 'W', 'E', 'B', 'P')) {
            return Optional.of(WEBP);
        }
        return Optional.empty();
    }

    private static boolean startsWith(byte[] bytes, int offset, int... expected) {
        if (bytes.length < offset + expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if ((bytes[offset + i] & 0xFF) != expected[i]) {
                return false;
            }
        }
        return true;
    }
}
