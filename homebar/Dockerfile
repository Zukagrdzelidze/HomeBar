# Builds the React frontend into the Spring Boot jar so one service serves both (same origin keeps
# the session and CSRF cookies first-party).

FROM node:22 AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:25-jdk AS backend
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src
COPY --from=frontend /frontend/dist src/main/resources/static
RUN chmod +x mvnw && ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=backend /app/target/homebar-*.jar app.jar
# Render's free tier has 512 MB of RAM.
ENV JAVA_OPTS="-Xmx300m -Xss512k -XX:+UseSerialGC"
EXPOSE 8080
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
