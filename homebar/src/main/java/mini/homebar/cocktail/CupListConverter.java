package mini.homebar.cocktail;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Stores a Cocktail's Cups as comma-separated text, best cup first (e.g. "COUPE,MARTINI,WINE"). */
@Converter
class CupListConverter implements AttributeConverter<List<Cup>, String> {

    @Override
    public String convertToDatabaseColumn(List<Cup> cups) {
        return cups.stream().map(Cup::name).collect(Collectors.joining(","));
    }

    @Override
    public List<Cup> convertToEntityAttribute(String text) {
        return Arrays.stream(text.split(","))
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(Cup::valueOf)
                .toList();
    }
}
