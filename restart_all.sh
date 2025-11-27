#!/bin/bash

echo "=================================================="
echo "   RESTARTING JEE MEDICONNECT MICROSERVICES"
echo "=================================================="

# Step 1: Kill all Java processes and services on ports
echo ""
echo "[1/3] 🔴 Stopping all services..."
pkill -f java 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8082 | xargs kill -9 2>/dev/null
lsof -ti:8083 | xargs kill -9 2>/dev/null
lsof -ti:8084 | xargs kill -9 2>/dev/null
lsof -ti:8085 | xargs kill -9 2>/dev/null
lsof -ti:8761 | xargs kill -9 2>/dev/null
echo "✅ All services stopped"

# Step 2: Wait a bit for ports to be released
echo ""
echo "[2/3] ⏳ Waiting 5 seconds for ports to be released..."
sleep 5

# Step 3: Restart all services
echo ""
echo "[3/3] 🚀 Starting all services..."
sh start_all.sh

echo ""
echo "=================================================="
echo "   SERVICES RESTARTED"
echo "=================================================="
echo ""
echo "⏳ Please wait 60 seconds for all services to fully start"
echo "📊 Check Eureka Dashboard: http://localhost:8761"
echo "🌐 Frontend: http://localhost:4200"
echo ""
