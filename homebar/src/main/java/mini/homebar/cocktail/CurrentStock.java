package mini.homebar.cocktail;

import mini.homebar.bottle.BottleRepository;
import mini.homebar.mixer.MixerRepository;
import org.springframework.stereotype.Component;

/** Reads the shelves into a BarStock; call inside a transaction. */
@Component
class CurrentStock {

    private final BottleRepository bottles;
    private final MixerRepository mixers;

    CurrentStock(BottleRepository bottles, MixerRepository mixers) {
        this.bottles = bottles;
        this.mixers = mixers;
    }

    BarStock read() {
        return BarStock.of(bottles.findAll(), mixers.findAll());
    }
}
