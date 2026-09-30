package mini.homebar.cocktail;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import mini.homebar.bottle.SpiritKind;
import mini.homebar.mixer.Mixer;
import mini.homebar.photo.Photo;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cocktails")
class CocktailController {

    private final CocktailRepository cocktails;
    private final CocktailImageRepository images;
    private final CurrentStock currentStock;

    CocktailController(CocktailRepository cocktails, CocktailImageRepository images, CurrentStock currentStock) {
        this.cocktails = cocktails;
        this.images = images;
        this.currentStock = currentStock;
    }

    record MixerRef(long id, String name) {

        static MixerRef of(Mixer mixer) {
            return mixer == null ? null : new MixerRef(mixer.getId(), mixer.getName());
        }
    }

    record IngredientView(String amount, SpiritKind spiritKind, MixerRef mixer) {

        static IngredientView of(CocktailIngredient ingredient) {
            return new IngredientView(ingredient.getAmount(), ingredient.getSpiritKind(), MixerRef.of(ingredient.getMixer()));
        }
    }

    record MissingView(SpiritKind spiritKind, MixerRef mixer) {

        static MissingView of(MissingIngredient missing) {
            return new MissingView(missing.spiritKind(),
                    missing.isMixer() ? new MixerRef(missing.mixerId(), missing.mixerName()) : null);
        }
    }

    record CocktailView(long id, String name, String description, boolean iceInCup, List<Cup> cups,
                        List<IngredientView> ingredients, List<SpiritKind> categories,
                        boolean makeable, List<MissingView> missing, String imageUrl) {

        static CocktailView of(Cocktail cocktail, List<MissingIngredient> missing, boolean hasImage) {
            return new CocktailView(cocktail.getId(), cocktail.getName(), cocktail.getDescription(),
                    cocktail.isIceInCup(), List.copyOf(cocktail.getCups()),
                    cocktail.getIngredients().stream().map(IngredientView::of).toList(),
                    cocktail.categories(), missing.isEmpty(), missing.stream().map(MissingView::of).toList(),
                    hasImage ? CocktailImage.urlFor(cocktail.getId()) : null);
        }
    }

    record CocktailRef(long id, String name) {
    }

    /** One purchase that would, on its own, make the listed Cocktails Makeable. */
    record ShoppingItem(SpiritKind spiritKind, MixerRef mixer, List<CocktailRef> unlocks) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    List<CocktailView> list(CocktailSearch search) {
        var stock = currentStock.read();
        Set<Long> withImage = images.findAllCocktailIds();
        var views = new ArrayList<CocktailView>();
        for (var cocktail : cocktails.findAll(Sort.by("name"))) {
            var missing = stock.missingFor(cocktail);
            if (search.matches(cocktail, missing)) {
                views.add(CocktailView.of(cocktail, missing, withImage.contains(cocktail.getId())));
            }
        }
        return views;
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    CocktailView get(@PathVariable long id) {
        var cocktail = find(id);
        return CocktailView.of(cocktail, currentStock.read().missingFor(cocktail), images.existsById(id));
    }

    /** What to buy next: each Missing Ingredient that is the only thing keeping some Cocktails from being Makeable. */
    @GetMapping("/shopping-list")
    @Transactional(readOnly = true)
    List<ShoppingItem> shoppingList() {
        var stock = currentStock.read();
        Map<MissingIngredient, List<CocktailRef>> unlocks = new LinkedHashMap<>();
        for (var cocktail : cocktails.findAll(Sort.by("name"))) {
            var missing = stock.missingFor(cocktail);
            if (missing.size() == 1) {
                unlocks.computeIfAbsent(missing.getFirst(), key -> new ArrayList<>())
                        .add(new CocktailRef(cocktail.getId(), cocktail.getName()));
            }
        }
        return unlocks.entrySet().stream()
                .sorted(Comparator.<Map.Entry<MissingIngredient, List<CocktailRef>>>comparingInt(entry -> -entry.getValue().size())
                        .thenComparing(entry -> entry.getKey().displayName(), String.CASE_INSENSITIVE_ORDER))
                .map(entry -> {
                    var view = MissingView.of(entry.getKey());
                    return new ShoppingItem(view.spiritKind(), view.mixer(), entry.getValue());
                })
                .toList();
    }

    @PutMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    CocktailView uploadImage(@PathVariable long id, @RequestPart("file") MultipartFile file) throws IOException {
        var cocktail = find(id);
        var photo = Photo.from(file);
        images.save(new CocktailImage(cocktail.getId(), photo.contentType(), photo.data()));
        return CocktailView.of(cocktail, currentStock.read().missingFor(cocktail), true);
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

    private Cocktail find(long id) {
        return cocktails.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
