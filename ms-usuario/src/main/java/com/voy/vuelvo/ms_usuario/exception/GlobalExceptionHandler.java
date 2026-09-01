package com.voy.vuelvo.ms_usuario.exception;

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> manejarErroresValidacion(
            MethodArgumentNotValidException ex) {

        Map<String,String> errores = new HashMap<>();

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



    //Captura cualquier excepcion que ocurra en la aplicacion
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> prueba(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("ERROR: " + ex.getMessage());
    }

 //----------------------------------------------------
 @ExceptionHandler(IllegalArgumentException.class)
 public ResponseEntity<String> manejarCorreoDuplicado(
         IllegalArgumentException ex) {

     return ResponseEntity
             .status(HttpStatus.CONFLICT)
             .body(ex.getMessage());
 }

}