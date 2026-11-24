package com.voy.velvo.ms_reserva.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voy.velvo.ms_reserva.model.Reserva;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SqsPublisherTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void publicaMensajeDeReserva() throws Exception {
        SqsClient sqs = mock(SqsClient.class);
        SqsPublisher publisher = new SqsPublisher(mapper, "https://sqs.example/cola", sqs);
        Reserva reserva = new Reserva();
        reserva.setId(7L);
        reserva.setRutaId(2L);
        publisher.publicar(reserva);
        ArgumentCaptor<SendMessageRequest> captor = ArgumentCaptor.forClass(SendMessageRequest.class);
        verify(sqs).sendMessage(captor.capture());
        assertEquals("https://sqs.example/cola", captor.getValue().queueUrl());
        var mensaje = mapper.readTree(captor.getValue().messageBody());
        assertEquals("RESERVA_CREADA", mensaje.get("tipo").asText());
        assertEquals(7L, mensaje.get("reservaId").asLong());
        assertEquals(2L, mensaje.get("rutaId").asLong());
        assertFalse(mensaje.get("eventId").asText().isBlank());
    }

    @Test
    void desarrolloLocalNoNecesitaAws() {
        SqsPublisher publisher = new SqsPublisher(mapper, "", "us-east-1");
        assertDoesNotThrow(() -> publisher.publicar(new Reserva()));
    }

    @Test
    void falloSqsNoCambiaReservaGuardada() {
        SqsClient sqs = mock(SqsClient.class);
        when(sqs.sendMessage(any(SendMessageRequest.class))).thenThrow(new IllegalStateException("fallo"));
        SqsPublisher publisher = new SqsPublisher(mapper, "https://sqs.example/cola", sqs);
        Reserva reserva = new Reserva();
        reserva.setId(7L);
        reserva.setRutaId(2L);
        assertDoesNotThrow(() -> publisher.publicar(reserva));
        verify(sqs).sendMessage(any(SendMessageRequest.class));
    }
}
