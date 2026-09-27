package mini.homebar.mixer;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/mixers")
class MixerController {

    private final MixerRepository mixers;

    MixerController(MixerRepository mixers) {
        this.mixers = mixers;
    }

    record StockChange(@NotNull Boolean inStock) {
    }

    record MixerView(long id, String name, boolean liquid, boolean inStock) {

        static MixerView of(Mixer mixer) {
            return new MixerView(mixer.getId(), mixer.getName(), mixer.isLiquid(), mixer.isInStock());
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    List<MixerView> list() {
        return mixers.findAll(Sort.by("name")).stream().map(MixerView::of).toList();
    }

    @PatchMapping("/{id}")
    @Transactional
    MixerView changeStock(@PathVariable long id, @Valid @RequestBody StockChange change) {
        var mixer = mixers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        mixer.setInStock(change.inStock());
        return MixerView.of(mixer);
    }
}
