package mini.homebar.web;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import tools.jackson.core.JacksonException;

@RestControllerAdvice
class ApiErrors {

    record ValidationErrors(Map<String, String> errors) {
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ValidationErrors invalid(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return new ValidationErrors(errors);
    }

    record Message(String message) {
    }

    /** A value the JSON can't be read into, e.g. an unknown Spirit Kind, reported against its field. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ValidationErrors unreadable(HttpMessageNotReadableException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (e.getCause() instanceof JacksonException jackson && !jackson.getPath().isEmpty()) {
            var field = jackson.getPath().getLast().getPropertyName();
            if (field != null) {
                errors.put(field, "Not a valid value");
            }
        }
        return new ValidationErrors(errors);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Message tooLarge() {
        return new Message("Photo must be 5 MB or smaller");
    }
}
