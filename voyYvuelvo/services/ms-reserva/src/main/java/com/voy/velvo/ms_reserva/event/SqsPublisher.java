package com.voy.velvo.ms_reserva.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voy.velvo.ms_reserva.model.Reserva;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class SqsPublisher {
    private static final Logger log = LoggerFactory.getLogger(SqsPublisher.class);
    private final ObjectMapper mapper;
    private final String queueUrl;
    private final SqsClient sqs;

    @Autowired
    public SqsPublisher(ObjectMapper mapper,
            @Value("${app.events.queue-url:}") String queueUrl,
            @Value("${app.events.region:us-east-1}") String region) {
        this(mapper, queueUrl, queueUrl.isBlank() ? null : SqsClient.builder()
                .region(Region.of(region))
                .overrideConfiguration(c -> c.apiCallTimeout(Duration.ofSeconds(8)))
                .build());
    }

    // Permite probar el productor sin conectarse a AWS.
    SqsPublisher(ObjectMapper mapper, String queueUrl, SqsClient sqs) {
        this.mapper = mapper;
        this.queueUrl = queueUrl;
        this.sqs = sqs;
    }

    // Se llama después de guardar la reserva. Lambda procesa el mensaje por separado.
    public void publicar(Reserva reserva) {
        if (sqs == null) {
            log.info("SQS desactivado en desarrollo local");
            return;
        }
        String eventId = UUID.randomUUID().toString();
        try {
            String mensaje = mapper.writeValueAsString(Map.of(
                    "eventId", eventId,
                    "tipo", "RESERVA_CREADA",
                    "reservaId", reserva.getId(),
                    "rutaId", reserva.getRutaId(),
                    "creado", Instant.now().toString()));
            SendMessageRequest solicitud = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(mensaje)
                    .build();
            sqs.sendMessage(solicitud);
            log.info("Reserva {}: evento {} publicado en SQS", reserva.getId(), eventId);
        } catch (Exception e) {
            // La reserva ya fue guardada: no devolver un falso error de creación.
            log.error("Reserva {} guardada, pero falló la publicación SQS ({})",
                    reserva.getId(), e.getClass().getSimpleName());
        }
    }

    @PreDestroy
    public void cerrar() {
        if (sqs != null) sqs.close();
    }
}
