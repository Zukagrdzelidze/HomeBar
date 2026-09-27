package mini.homebar.cocktail;

import java.util.List;

import mini.homebar.bottle.BottleRepository;
import mini.homebar.bottle.SpiritKind;
import mini.homebar.mixer.Mixer;
import mini.homebar.mixer.MixerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cocktails")
class CocktailController {

    private final CocktailRepository cocktails;
    private final BottleRepository bottles;
    private final MixerRepository mixers;

    CocktailController(CocktailRepository cocktails, BottleRepository bottles, MixerRepository mixers) {
        this.cocktails = cocktails;
        this.bottles = bottles;
        this.mixers = mixers;
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

    record CocktailView(long id, String name, String description, boolean iceInCup, List<Cup> cups,
                        List<IngredientView> ingredients, List<SpiritKind> categories,
                        boolean makeable, List<IngredientView> missing) {

        static CocktailView of(Cocktail cocktail, BarStock stock) {
            var missing = stock.missingFor(cocktail).stream().map(IngredientView::of).toList();
            return new CocktailView(cocktail.getId(), cocktail.getName(), cocktail.getDescription(),
                    cocktail.isIceInCup(), List.copyOf(cocktail.getCups()),
                    cocktail.getIngredients().stream().map(IngredientView::of).toList(),
                    cocktail.categories(), missing.isEmpty(), missing);
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    List<CocktailView> list(@RequestParam(required = false) Boolean makeable,
                            @RequestParam(required = false) SpiritKind category) {
        var stock = barStock();
        return cocktails.findAll(Sort.by("name")).stream()
                .filter(cocktail -> makeable == null || stock.canMake(cocktail) == makeable)
                .filter(cocktail -> category == null || cocktail.categories().contains(category))
                .map(cocktail -> CocktailView.of(cocktail, stock))
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    CocktailView get(@PathVariable long id) {
        return cocktails.findById(id).map(cocktail -> CocktailView.of(cocktail, barStock()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private BarStock barStock() {
        return BarStock.of(bottles.findAll(), mixers.findAll());
    }
}
