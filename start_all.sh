#!/bin/bash

# Function to open a new tab and run a command title
open_tab() {
    local title="$1"
    local dir="$2"
    local cmd="$3"
    
    osascript <<EOF
    tell application "Terminal"
        tell window 1
            set newTab to do script "cd \"$dir\" && echo 'Starting $title...' && $cmd"
        end tell
    end tell
EOF
}

echo "=================================================="
echo "   STARTING JEE MEDICONNECT MICROSERVICES"
echo "=================================================="

# 1. Start Infrastructure (Docker)
echo "[1/4] Starting Kafka & Zookeeper..."
docker-compose up -d
echo "Waiting 10s for Kafka to stabilize..."
sleep 10

# 2. Start Eureka Server
echo "[2/4] Starting Eureka Server..."
open_tab "Eureka Server" "$(pwd)/eureka-server" "mvn spring-boot:run"
sleep 15

# 3. Start Config Server (if needed, skipping for now as we used local properties)
# echo "[Optional] Starting Config Server..."
# open_tab "Config Server" "$(pwd)/config-server" "mvn spring-boot:run"
# sleep 10

# 4. Start API Gateway
echo "[3/4] Starting API Gateway..."
open_tab "API Gateway" "$(pwd)/api-gateway" "mvn spring-boot:run"
sleep 10

# 5. Start Services
echo "[4/4] Starting Core Services..."
open_tab "Auth Service" "$(pwd)/auth-service" "mvn spring-boot:run"
open_tab "Patient Service" "$(pwd)/patient-service" "mvn spring-boot:run"
open_tab "Doctor Service" "$(pwd)/doctor-service" "mvn spring-boot:run"
open_tab "RendezVous Service" "$(pwd)/rendezvous-service" "mvn spring-boot:run"
open_tab "Facture Service" "$(pwd)/facture-service" "mvn spring-boot:run"

echo "=================================================="
echo "   ALL SERVICES LAUNCHED IN SEPARATE TABS"
echo "=================================================="
echo "Monitor the tabs for startup logs."
echo "Eureka Dashboard: http://localhost:8761"
