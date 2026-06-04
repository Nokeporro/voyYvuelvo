    package com.voy_vuelvo.ms_equipamiento.controller;

    import com.voy_vuelvo.ms_equipamiento.dto.EquipamientoDto;
    import com.voy_vuelvo.ms_equipamiento.model.Equipamiento;
    import com.voy_vuelvo.ms_equipamiento.service.EquipamientoService;

    import io.swagger.v3.oas.annotations.Operation;
    import io.swagger.v3.oas.annotations.tags.Tag;
    import jakarta.validation.Valid;

    import org.springframework.hateoas.CollectionModel;
    import org.springframework.hateoas.EntityModel;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
    import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

    @RestController
    @RequestMapping("/api/equipamiento")
    @Tag(name= "equipamiento", description = "Gestor de equipamiento para rutas de Trekking")
    public class EquipamientoController {

        private final EquipamientoService service;

        public EquipamientoController(EquipamientoService service) {
            this.service = service;
        }

    //----------------------------------------------------
    //CREA USUARIO
        @Operation(summary = "Crear equipamiento")
        @PostMapping
        public EntityModel<Equipamiento> crear(@RequestBody @Valid EquipamientoDto dto) {

            Equipamiento nuevo = service.crear(dto);

            return EntityModel.of(nuevo,
                    linkTo(methodOn(EquipamientoController.class).obtener(nuevo.getId())).withSelfRel(),
                    linkTo(methodOn(EquipamientoController.class).listar()).withRel("equipamientos")
            );
        }


    //Para listas se uso CollectionModel que es lo más correcto en Hateoas
        @Operation(summary = "Recomendar equipamiento según una ruta",
                description = "Obtiene el equipamiento recomendado para una ruta de trekking de acuerdo asu dificultad")
        @GetMapping("/recomendacion/{rutaId}")
        public CollectionModel<Equipamiento> recomendar(
                @PathVariable Long rutaId) {

            List<Equipamiento> equipamientos =
                    service.recomendarPorRuta(rutaId);

            return CollectionModel.of(equipamientos,
                    linkTo(methodOn(EquipamientoController.class).recomendar(rutaId)).withSelfRel());
        }



        @GetMapping
        public ResponseEntity<List<Equipamiento>> listar() {
            return ResponseEntity.ok(service.listar());
        }



    //-------------------------------------------------------------------------------
        // se implementa
        @Operation(summary = "Obetener equipamiento por ID",
            description = "Retorna un equipamiento segun su identificador")

        @GetMapping("/{id}")
        public EntityModel<Equipamiento> obtener(@PathVariable Long id) {

            Equipamiento equipamiento = service.obtener(id);

            return EntityModel.of(equipamiento,
                    linkTo(methodOn(EquipamientoController.class).obtener(id)).withSelfRel(),
                    linkTo(methodOn(EquipamientoController.class).listar())
                            .withRel("equipamientos")
            );
        }
    //-----------------------------------------------------------------------------------
        @Operation(summary = "Actualizar equipamiento",
            description = "Actualización de equipamiento buscando por identificador")

        @PutMapping("/{id}")
        public ResponseEntity<Equipamiento> actualizar(
                @PathVariable Long id,
                @RequestBody @Valid EquipamientoDto dto) {

            Equipamiento actualizado = service.actualizar(id, dto);

            return ResponseEntity.ok(actualizado);
        }
    //----------------------------------------------------------------------------
        @Operation(summary = "Eliminar equipamiento",
            description = "Elimina un equipmiento por ID")

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(@PathVariable Long id) {

            service.eliminar(id);

            return ResponseEntity.noContent().build();
        }

    //----------------------------------------------------------------------
        @Operation (summary = "Lista el equipamiento que se encuentre disponible")
        @GetMapping("/disponibles")
        public ResponseEntity<List<Equipamiento>> disponibles() {
            return ResponseEntity.ok(service.disponibles());
        }



    //-------------------------------------------------------------------------
        @Operation(summary = "Buscar equipamiento por dificultad")
        @GetMapping("/dificultad/{dificultad}")
        public CollectionModel<Equipamiento> buscarPorDificultad(
                @PathVariable String dificultad) {

            List<Equipamiento> equipamientos =
                service.buscarPorDificultad(dificultad);

            return CollectionModel.of(equipamientos,
                linkTo(methodOn(EquipamientoController.class).buscarPorDificultad(dificultad)).withSelfRel()
            );
        }

    }