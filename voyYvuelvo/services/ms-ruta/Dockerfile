FROM maven:3.9.14-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp package -DskipTests
FROM eclipse-temurin:25-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
WORKDIR /app
COPY --from=build --chown=app:app /app/target/*.jar app.jar
USER app
EXPOSE 8086
HEALTHCHECK --interval=30s --timeout=5s --start-period=150s --retries=5 CMD curl -fsS http://127.0.0.1:8086/actuator/health || exit 1
ENTRYPOINT ["java","-XX:MaxRAMPercentage=65.0","-jar","app.jar"]
