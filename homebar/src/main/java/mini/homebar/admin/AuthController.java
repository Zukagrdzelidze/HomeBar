package mini.homebar.admin;

import java.security.Principal;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final AdminRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;

    AuthController(AdminRepository admins, PasswordEncoder passwordEncoder,
                   AuthenticationManager authenticationManager, SecurityContextRepository contextRepository) {
        this.admins = admins;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
    }

    record Credentials(@NotBlank @Size(max = 50) String name, @NotBlank @Size(min = 8, max = 72) String password) {
    }

    record Me(String name) {
    }

    record RegistrationStatus(boolean open) {
    }

    @GetMapping("/registration-open")
    RegistrationStatus registrationOpen() {
        return new RegistrationStatus(admins.count() == 0);
    }

    @PostMapping("/register")
    ResponseEntity<Me> register(@Valid @RequestBody Credentials credentials,
                                HttpServletRequest request, HttpServletResponse response) {
        if (admins.count() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration is closed");
        }
        try {
            admins.saveAndFlush(new Admin(credentials.name(), passwordEncoder.encode(credentials.password())));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration is closed");
        }
        logIn(credentials, request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Me(credentials.name()));
    }

    @PostMapping("/login")
    Me login(@Valid @RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
        logIn(credentials, request, response);
        return new Me(credentials.name());
    }

    @GetMapping("/me")
    Me me(Principal principal) {
        return new Me(principal.getName());
    }

    /** Touching the token makes Spring Security write the XSRF-TOKEN cookie the frontend echoes back. */
    @GetMapping("/csrf")
    ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    private void logIn(Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
        try {
            var authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(credentials.name(), credentials.password()));
            if (request.getSession(false) != null) {
                request.changeSessionId();
            }
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong name or password");
        }
    }
}
