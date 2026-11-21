# Inicio y verificación

Actualizado el 21 de noviembre de 2026. La guía única de instalación está en el [README principal](../../README.md): requisitos, generación de la clave JWT, Docker, variables de Vite, registro, comprobaciones y solución de problemas.

Orden de trabajo:

1. Configurar `voyYvuelvo/.env` desde su plantilla, con una clave Base64 de al menos 32 bytes.
2. Iniciar Docker Compose desde `voyYvuelvo` y esperar a los seis clientes de Eureka.
3. Configurar `frontend/.env`, instalar dependencias y ejecutar Vite.
4. Abrir la web en 5173; 8080 corresponde a la API.
5. Seguir el [recorrido de revisión](RECORRIDO-DE-REVISION.md).

Para entender el intercambio de datos consulta la [integración detallada](INTEGRACION-FRONTEND-BACKEND.md). Esta página enlaza la guía principal para evitar instrucciones de instalación duplicadas y contradictorias.
