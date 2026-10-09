package mini.homebar.order;

import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mini.homebar.cocktail.CocktailRepository;
import mini.homebar.cocktail.CurrentStock;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Guests place Orders without logging in; only the Admin sees them and marks them made. */
@RestController
@RequestMapping("/api/orders")
class OrderController {

    private final OrderRepository orders;
    private final CocktailRepository cocktails;
    private final CurrentStock currentStock;

    OrderController(OrderRepository orders, CocktailRepository cocktails, CurrentStock currentStock) {
        this.orders = orders;
        this.cocktails = cocktails;
        this.currentStock = currentStock;
    }

    record NewOrder(@NotNull Long cocktailId, @NotBlank @Size(max = 50) String guestName) {
    }

    record OrderView(long id, String guestName, long cocktailId, String cocktailName, Instant placedAt) {

        static OrderView of(Order order) {
            return new OrderView(order.getId(), order.getGuestName(), order.getCocktail().getId(),
                    order.getCocktail().getName(), order.getCreatedAt());
        }
    }

    /** Only a Makeable Cocktail can be ordered, the same ones the Guests' menu shows. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    OrderView place(@Valid @RequestBody NewOrder order) {
        var cocktail = cocktails.findById(order.cocktailId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!currentStock.read().missingFor(cocktail).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That cocktail can't be made right now");
        }
        return OrderView.of(orders.save(new Order(cocktail, order.guestName().strip())));
    }

    /** Oldest first: the order to make them in. */
    @GetMapping
    @Transactional(readOnly = true)
    List<OrderView> list() {
        return orders.findAll(Sort.by("createdAt", "id")).stream().map(OrderView::of).toList();
    }

    /** The Admin has made the drink, so the Order is gone. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void made(@PathVariable long id) {
        orders.delete(orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }
}
