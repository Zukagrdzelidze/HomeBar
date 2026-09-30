package mini.homebar.cocktail;

import java.util.List;
import java.util.Set;

import mini.homebar.bottle.SpiritKind;
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
    private final CurrentStock currentStock;

    MenuController(CocktailRepository cocktails, CocktailImageRepository images, CurrentStock currentStock) {
        this.cocktails = cocktails;
        this.images = images;
        this.currentStock = currentStock;
    }

    /** An ingredient as a Guest sees it: a Spirit Kind or a Mixer's name, never an amount. */
    record MenuIngredient(SpiritKind spiritKind, String mixer) {

        static MenuIngredient of(CocktailIngredient ingredient) {
            return new MenuIngredient(ingredient.getSpiritKind(),
                    ingredient.getMixer() == null ? null : ingredient.getMixer().getName());
        }
    }

    /** servedIn is the last Cup of the Cup Sequence, or null if the recipe lists none. */
    record MenuItem(long id, String name, String description, List<MenuIngredient> ingredients,
                    Cup servedIn, boolean iceInCup, List<SpiritKind> categories, String imageUrl) {

        static MenuItem of(Cocktail cocktail, boolean hasImage) {
            var cups = cocktail.getCups();
            return new MenuItem(cocktail.getId(), cocktail.getName(), cocktail.getDescription(),
                    cocktail.getIngredients().stream().map(MenuIngredient::of).distinct().toList(),
                    cups.isEmpty() ? null : cups.getLast(), cocktail.isIceInCup(), cocktail.categories(),
                    hasImage ? CocktailImage.urlFor(cocktail.getId()) : null);
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    List<MenuItem> menu(@RequestParam(required = false) String q, @RequestParam(required = false) SpiritKind category) {
        var stock = currentStock.read();
        var search = CocktailSearch.menu(q, category);
        Set<Long> withImage = images.findAllCocktailIds();
        return cocktails.findAll(Sort.by("name")).stream()
                .filter(cocktail -> search.matches(cocktail, stock.missingFor(cocktail)))
                .map(cocktail -> MenuItem.of(cocktail, withImage.contains(cocktail.getId())))
                .toList();
    }
}
