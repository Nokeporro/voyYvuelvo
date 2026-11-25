import json
import os
import sys
import types
import unittest
from unittest.mock import Mock, patch
from handler import procesar, lambda_handler

EVENTO = {"eventId": "evt-1", "tipo": "RESERVA_CREADA", "reservaId": 7,
          "rutaId": 2, "creado": "2026-11-24T00:00:00Z"}


class HandlerTest(unittest.TestCase):
    def test_confirmacion(self):
        tabla = Mock()
        procesar(EVENTO, tabla)
        item = tabla.put_item.call_args.kwargs["Item"]
        self.assertEqual(item["eventId"], "evt-1")
        self.assertEqual(item["reservaId"], 7)
        self.assertEqual(item["estado"], "CONFIRMACION_REGISTRADA")

    def test_reintento_usa_misma_clave(self):
        tabla = Mock()
        procesar(EVENTO, tabla)
        procesar(EVENTO, tabla)
        self.assertEqual(tabla.put_item.call_count, 2)
        self.assertEqual(tabla.put_item.call_args_list[0], tabla.put_item.call_args_list[1])

    def test_evento_invalido(self):
        tabla = Mock()
        with self.assertRaises(ValueError):
            procesar(dict(EVENTO, tipo="OTRO"), tabla)
        tabla.put_item.assert_not_called()

    def test_lambda_consume_sqs(self):
        tabla = Mock()
        boto = types.SimpleNamespace(resource=lambda _: types.SimpleNamespace(Table=lambda _: tabla))
        with patch.dict(sys.modules, {"boto3": boto}), patch.dict(os.environ, {"TABLE_NAME": "test"}):
            respuesta = lambda_handler({"Records": [{"body": json.dumps(EVENTO)}]}, None)
        self.assertEqual(respuesta, {"procesados": 1})
        tabla.put_item.assert_called_once()

    def test_fallo_se_propaga_para_reintento_sqs(self):
        tabla = Mock()
        tabla.put_item.side_effect = RuntimeError("Fallo de prueba")
        with self.assertRaises(RuntimeError):
            procesar(EVENTO, tabla)


if __name__ == "__main__":
    unittest.main()
