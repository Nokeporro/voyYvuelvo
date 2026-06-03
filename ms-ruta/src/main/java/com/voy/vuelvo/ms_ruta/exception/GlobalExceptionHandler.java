package com.voy.vuelvo.ms_ruta.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new HashMap<>();

        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {

                    String campo =
                            ((FieldError) error).getField();

                    String mensaje =
                            error.getDefaultMessage();

                    errores.put(campo, mensaje);
                });

        return new ResponseEntity<>(
                errores,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntime(
            RuntimeException ex) {

        Map<String, Object> body = new HashMap<>();

        body.put("error", "Error en proceso");
        body.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.BAD_REQUEST);
    }
}