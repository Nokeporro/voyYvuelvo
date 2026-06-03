    package com.voy_vuelvo.ms_equipamiento.controller;

    import com.voy_vuelvo.ms_equipamiento.dto.EquipamientoDto;
    import com.voy_vuelvo.ms_equipamiento.model.Equipamiento;
    import com.voy_vuelvo.ms_equipamiento.service.EquipamientoService;

    import jakarta.validation.Valid;

    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/equipamiento")
    public class EquipamientoController {

        private final EquipamientoService service;

        public EquipamientoController(EquipamientoService service) {
            this.service = service;
        }

        @PostMapping
        public ResponseEntity<Equipamiento> crear(@RequestBody @Valid EquipamientoDto dto) {

            Equipamiento nuevo = service.crear(dto);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevo);
        }

        @GetMapping("/recomendacion/{rutaId}")
        public ResponseEntity<List<Equipamiento>> recomendar(
                @PathVariable Long rutaId) {

            return ResponseEntity.ok(service.recomendarPorRuta(rutaId));
        }


        @GetMapping
        public ResponseEntity<List<Equipamiento>> listar() {
            return ResponseEntity.ok(service.listar());
        }

        @GetMapping("/{id}")
        public ResponseEntity<Equipamiento> obtener(@PathVariable Long id) {

            return ResponseEntity.ok(service.obtener(id));
        }

        @PutMapping("/{id}")
        public ResponseEntity<Equipamiento> actualizar(
                @PathVariable Long id,
                @RequestBody @Valid EquipamientoDto dto) {

            Equipamiento actualizado = service.actualizar(id, dto);

            return ResponseEntity.ok(actualizado);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(@PathVariable Long id) {

            service.eliminar(id);

            return ResponseEntity.noContent().build();
        }


        @GetMapping("/disponibles")
        public ResponseEntity<List<Equipamiento>> disponibles() {
            return ResponseEntity.ok(service.disponibles());
        }




        @GetMapping("/dificultad/{dificultad}")
        public ResponseEntity<List<Equipamiento>> buscarPorDificultad(
                @PathVariable String dificultad) {

            return ResponseEntity.ok(service.buscarPorDificultad(dificultad));
        }

    }