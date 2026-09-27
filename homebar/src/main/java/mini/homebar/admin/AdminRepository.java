package mini.homebar.admin;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByName(String name);
}
