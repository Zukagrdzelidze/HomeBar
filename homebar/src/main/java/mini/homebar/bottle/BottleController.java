package mini.homebar.bottle;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bottles")
class BottleController {

    private final BottleRepository bottles;
    private final BottleImageRepository images;

    BottleController(BottleRepository bottles, BottleImageRepository images) {
        this.bottles = bottles;
        this.images = images;
    }

    record BottleForm(@NotBlank @Size(max = 100) String name,
                      @NotNull SpiritKind spiritKind,
                      boolean sipping,
                      String description,
                      @NotNull BottleStatus status) {
    }

    record BottleView(long id, String name, SpiritKind spiritKind, boolean sipping, String description,
                      BottleStatus status, String imageUrl) {

        static BottleView of(Bottle bottle, boolean hasImage) {
            return new BottleView(bottle.getId(), bottle.getName(), bottle.getSpiritKind(), bottle.isSipping(),
                    bottle.getDescription(), bottle.getStatus(),
                    hasImage ? "/api/bottles/" + bottle.getId() + "/image" : null);
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    List<BottleView> list(@RequestParam(required = false) BottleStatus status,
                          @RequestParam(required = false) SpiritKind spiritKind) {
        Set<Long> withImage = images.findAllBottleIds();
        return bottles.findAll(Sort.by("name")).stream()
                .filter(bottle -> status == null || bottle.getStatus() == status)
                .filter(bottle -> spiritKind == null || bottle.getSpiritKind() == spiritKind)
                .map(bottle -> BottleView.of(bottle, withImage.contains(bottle.getId())))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    BottleView add(@Valid @RequestBody BottleForm form) {
        var bottle = bottles.save(new Bottle(form.name(), form.spiritKind(), form.sipping(), form.description(), form.status()));
        return BottleView.of(bottle, false);
    }

    @PutMapping("/{id}")
    @Transactional
    BottleView edit(@PathVariable long id, @Valid @RequestBody BottleForm form) {
        var bottle = find(id);
        bottle.update(form.name(), form.spiritKind(), form.sipping(), form.description(), form.status());
        return view(bottle);
    }

    @PostMapping("/{id}/revoke")
    @Transactional
    BottleView revoke(@PathVariable long id) {
        var bottle = find(id);
        bottle.revoke();
        return view(bottle);
    }

    @PostMapping("/{id}/restock")
    @Transactional
    BottleView restock(@PathVariable long id) {
        var bottle = find(id);
        bottle.restock();
        return view(bottle);
    }

    private Bottle find(long id) {
        return bottles.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    BottleView uploadImage(@PathVariable long id, @RequestPart("file") MultipartFile file) throws IOException {
        var bottle = find(id);
        if (file.getSize() > ImageFormat.MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo must be 5 MB or smaller");
        }
        byte[] bytes = file.getBytes();
        var format = ImageFormat.detect(bytes).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo must be a JPEG, PNG or WebP"));
        images.save(new BottleImage(bottle.getId(), format.contentType, bytes));
        return BottleView.of(bottle, true);
    }

    @GetMapping("/{id}/image")
    @Transactional(readOnly = true)
    ResponseEntity<byte[]> image(@PathVariable long id) {
        var image = images.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getData());
    }

    @DeleteMapping("/{id}/image")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void removeImage(@PathVariable long id) {
        images.deleteById(find(id).getId());
    }

    private BottleView view(Bottle bottle) {
        return BottleView.of(bottle, images.existsById(bottle.getId()));
    }
}
