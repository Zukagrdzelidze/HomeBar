package mini.homebar.cocktail;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface CocktailImageRepository extends JpaRepository<CocktailImage, Long> {

    @Query("select i.cocktailId from CocktailImage i")
    Set<Long> findAllCocktailIds();
}
