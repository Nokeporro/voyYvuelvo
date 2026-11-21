# Etapa de compilacion
FROM maven:3.9.14-eclipse-temurin-25 AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.m2,sharing=locked mvn -B -ntp clean package -DskipTests

# Etapa de ejecucion
FROM eclipse-temurin:25-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]