package com.voy.velvo.ms_reserva.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Maneja errores de validación (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarErroresValidacion(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new HashMap<>();

        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {

                    String campo = ((FieldError) error).getField();
                    String mensaje = error.getDefaultMessage();

                    errores.put(campo, mensaje);
                });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errores);
    }

    // Maneja recursos no encontrados
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<String> manejarNoEncontrado(
            RecursoNoEncontradoException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }

    // Maneja cualquier error inesperado
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarErrorGeneral(
            Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error interno del servidor: " + ex.getMessage());
    }
}