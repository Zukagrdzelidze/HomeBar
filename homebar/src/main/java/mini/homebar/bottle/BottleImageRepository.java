package mini.homebar.bottle;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface BottleImageRepository extends JpaRepository<BottleImage, Long> {

    @Query("select i.bottleId from BottleImage i")
    Set<Long> findAllBottleIds();
}
