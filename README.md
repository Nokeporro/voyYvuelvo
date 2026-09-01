# Voy & Vuelvo - Plataforma de Gestión de Rutas de Trekking

Sistema distribuido basado en arquitectura de microservicios para la administración de usuarios, rutas, equipamiento, reservas y pagos de actividades de trekking.

## Integrantes
* Michel Sanhueza
* Franco Araya

---

## Arquitectura del Sistema

El sistema está compuesto por 7 componentes encapsulados en contenedores Docker:

| Componente | Puerto | Función |
| :--- | :--- | :--- |
| **API Gateway** | `8080` | Punto de entrada único, enrutamiento y validación JWT. |
| **Eureka Server** | `8761` | Registro y descubrimiento dinámico de servicios. |
| **ms-usuario** | `8084` | Gestión de usuarios (CRUD, datos de contacto). |
| **ms-equipamiento** | `8081` | Inventario y arriendo de equipamiento. |
| **ms-ruta** | `8086` | Catálogo de rutas y control de cupos. |
| **ms-reserva** | `8083` | Orquestación de proceso de reservas. |
| **ms-pago** | `8085` | Procesamiento y estados de pago. |
| **MySQL** | `3306` | Base de datos relacional con esquemas lógicos aislados. |

---

## Requisitos Previos
* Docker Engine `>= 20.10`
* Docker Compose `>= 2.0`
* Java JDK `17` (opcional para desarrollo local)

---

## Guía de Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/empresa/voy-y-vuelvo.git](https://github.com/empresa/voy-y-vuelvo.git)
   cd voy-y-vuelvo
