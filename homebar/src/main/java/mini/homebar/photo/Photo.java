package mini.homebar.photo;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** An uploaded photo that passed the size and format checks. */
public record Photo(String contentType, byte[] data) {

    public static Photo from(MultipartFile file) throws IOException {
        if (file.getSize() > ImageFormat.MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo must be 5 MB or smaller");
        }
        byte[] bytes = file.getBytes();
        var format = ImageFormat.detect(bytes).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo must be a JPEG, PNG or WebP"));
        return new Photo(format.contentType, bytes);
    }
}
