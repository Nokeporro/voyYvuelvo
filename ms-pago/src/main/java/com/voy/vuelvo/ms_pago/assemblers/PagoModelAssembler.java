package com.voy.vuelvo.ms_pago.assemblers;

import com.voy.vuelvo.ms_pago.controller.PagoController;
import com.voy.vuelvo.ms_pago.model.Pago;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Component
public class PagoModelAssembler
        implements RepresentationModelAssembler<Pago, EntityModel<Pago>> {

    @Override
    public EntityModel<Pago> toModel(Pago pago) {
        return EntityModel.of(pago,
                linkTo(methodOn(PagoController.class)
                        .getPagoPorId(pago.getId())).withSelfRel(),
                linkTo(methodOn(PagoController.class)
                        .getPagos()).withRel("pagos"));
    }
}