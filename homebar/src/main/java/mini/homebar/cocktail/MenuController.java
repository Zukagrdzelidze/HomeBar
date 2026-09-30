package mini.homebar.cocktail;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import mini.homebar.bottle.SpiritKind;
import mini.homebar.mixer.Mixer;
import mini.homebar.mixer.MixerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** The Guests' menu: public, Makeable Cocktails only, and nothing about stock. */
@RestController
@RequestMapping("/api/menu")
class MenuController {

    private final CocktailRepository cocktails;
    private final CocktailImageRepository images;
    private final MixerRepository mixers;
    private final CurrentStock currentStock;

    MenuController(CocktailRepository cocktails, CocktailImageRepository images, MixerRepository mixers,
                   CurrentStock currentStock) {
        this.cocktails = cocktails;
        this.images = images;
        this.mixers = mixers;
        this.currentStock = currentStock;
    }

    /** An ingredient as a Guest sees it: a Spirit Kind or a Mixer's name, never an amount. */
    record MenuIngredient(SpiritKind spiritKind, String mixer) {

        static MenuIngredient of(CocktailIngredient ingredient) {
            return new MenuIngredient(ingredient.getSpiritKind(),
                    ingredient.getMixer() == null ? null : ingredient.getMixer().getName());
        }
    }

    /**
     * servedIn is the last Cup of the Cup Sequence, or null if the recipe lists none.
     * lacking is what the Guest picked that this Cocktail doesn't contain; empty for an exact match.
     */
    record MenuItem(long id, String name, String description, List<MenuIngredient> ingredients,
                    Cup servedIn, boolean iceInCup, List<SpiritKind> categories, String imageUrl,
                    List<MenuIngredient> lacking) {

        static MenuItem of(IngredientPick.Match match, boolean hasImage, Map<Long, String> mixerNames) {
            var cocktail = match.cocktail();
            var cups = cocktail.getCups();
            var lacking = new ArrayList<MenuIngredient>();
            match.lackingSpiritKinds().forEach(kind -> lacking.add(new MenuIngredient(kind, null)));
            match.lackingMixerIds().forEach(id -> lacking.add(new MenuIngredient(null, mixerNames.get(id))));
            return new MenuItem(cocktail.getId(), cocktail.getName(), cocktail.getDescription(),
                    cocktail.getIngredients().stream().map(MenuIngredient::of).distinct().toList(),
                    cups.isEmpty() ? null : cups.getLast(), cocktail.isIceInCup(), cocktail.categories(),
                    hasImage ? CocktailImage.urlFor(cocktail.getId()) : null, lacking);
        }
    }

    /** exact is false when nothing contained everything picked and the items are the closest matches instead. */
    record Menu(boolean exact, List<MenuItem> items) {
    }

    record MixerOption(long id, String name) {
    }

    /** What a Guest can pick from: the Spirit Kinds and Mixers in stock. */
    record PickOptions(List<SpiritKind> spiritKinds, List<MixerOption> mixers) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    Menu menu(@RequestParam(required = false) String q,
              @RequestParam(required = false) Set<SpiritKind> spiritKind,
              @RequestParam(required = false) Set<Long> mixerId) {
        var stock = currentStock.read();
        var search = CocktailSearch.menu(q);
        var makeable = cocktails.findAll(Sort.by("name")).stream()
                .filter(cocktail -> search.matches(cocktail, stock.missingFor(cocktail)))
                .toList();
        var pick = new IngredientPick(spiritKind == null ? Set.of() : spiritKind, mixerId == null ? Set.of() : mixerId);
        var result = pick.rank(makeable);

        Set<Long> withImage = images.findAllCocktailIds();
        Map<Long, String> mixerNames = mixers.findAll().stream().collect(Collectors.toMap(Mixer::getId, Mixer::getName));
        return new Menu(result.exact(), result.matches().stream()
                .map(match -> MenuItem.of(match, withImage.contains(match.cocktail().getId()), mixerNames))
                .toList());
    }

    @GetMapping("/ingredients")
    @Transactional(readOnly = true)
    PickOptions ingredients() {
        return new PickOptions(
                currentStock.read().pourableSpiritKinds().stream().sorted().toList(),
                mixers.findAll(Sort.by("name")).stream()
                        .filter(Mixer::isInStock)
                        .map(mixer -> new MixerOption(mixer.getId(), mixer.getName()))
                        .toList());
    }
}
