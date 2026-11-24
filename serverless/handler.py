"""Consume eventos de reserva desde SQS y guarda una confirmación en DynamoDB."""
import json
import logging
import os

log = logging.getLogger()
log.setLevel(logging.INFO)


def procesar(evento, tabla):
    if evento["tipo"] != "RESERVA_CREADA":
        raise ValueError("Tipo de evento no válido")
    confirmacion = {
        "eventId": str(evento["eventId"]),
        "reservaId": int(evento["reservaId"]),
        "rutaId": int(evento["rutaId"]),
        "creado": str(evento["creado"]),
        "estado": "CONFIRMACION_REGISTRADA",
        "mensaje": "Reserva registrada; pago pendiente de confirmación."
    }
    # La misma clave eventId vuelve a escribir el mismo registro si SQS reintenta.
    tabla.put_item(Item=confirmacion)
    log.info("Confirmación registrada: evento=%s reserva=%s",
             confirmacion["eventId"], confirmacion["reservaId"])


def lambda_handler(event, context):
    import boto3
    tabla = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])
    for mensaje in event["Records"]:
        procesar(json.loads(mensaje["body"]), tabla)
    return {"procesados": len(event["Records"])}
