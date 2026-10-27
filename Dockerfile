# ============================================================
# Backend Dockerfile - Spring Boot 3 + Java 21
# Optimized for Render Cloud Web Service & Docker
# ============================================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and cache dependencies
COPY banking-system/backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B || true

# Copy backend source code
COPY banking-system/backend/src ./src

# Build application JAR skipping tests
RUN mvn clean package -DskipTests

# ── Runtime Stage ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy compiled JAR
COPY --from=builder /app/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Health check (Render monitors /api/actuator/health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/api/actuator/health || exit 1

# Start Spring Boot binding to Render's dynamic $PORT
ENTRYPOINT ["sh", "-c", "java -Djava.net.preferIPv4Stack=true -Dserver.port=${PORT:-8080} -Dspring.profiles.active=prod -Xms128m -Xmx400m -jar app.jar"]
