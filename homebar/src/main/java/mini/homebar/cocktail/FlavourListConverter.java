package mini.homebar.cocktail;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Stores a Cocktail's Flavours as comma-separated text (e.g. "SOUR,FRUITY"). */
@Converter
class FlavourListConverter implements AttributeConverter<List<Flavour>, String> {

    @Override
    public String convertToDatabaseColumn(List<Flavour> flavours) {
        return flavours.stream().map(Flavour::name).collect(Collectors.joining(","));
    }

    @Override
    public List<Flavour> convertToEntityAttribute(String text) {
        return Arrays.stream(text.split(","))
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(Flavour::valueOf)
                .toList();
    }
}
