#!/bin/bash

BASE_URL="http://localhost:8080"
EMAIL="testpatient_repro@test.com"
NAME="Repro Patient"
PASSWORD="password123"

echo "============================================="
echo "   REPRODUCING PROFILE SYNC ISSUE"
echo "============================================="

# 1. Simulate Admin creating Auth User
echo ""
echo "[1] Creating Auth User..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"PATIENT\"}"

# 2. Simulate Admin creating Patient Profile (Entity)
echo ""
echo "[2] Creating Patient Entity..."
curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $(curl -s -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d '{"email":"admin2@test.com","password":"test123"}' | cut -d'"' -f4)" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"$NAME\",\"email\":\"$EMAIL\",\"phone\":\"0000000000\",\"birthDate\":\"2000-01-01\",\"gender\":\"M\"}"

# Note: In the real app, we need an Admin Token to call /api/patients. 
# I'll assume we have a valid admin from previous steps (admin2@test.com / test123 from Step 1414/1443).
# If not, I'll use the one I just created if I can register an admin first.

# Let's clean up and ensure we have an admin
echo ""
echo "[SETUP] Ensuring Admin exists..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Admin Repro\",\"email\":\"admin_repro@test.com\",\"password\":\"admin123\",\"role\":\"ADMIN\"}"

ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin_repro@test.com\",\"password\":\"admin123\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Admin Token: ${ADMIN_TOKEN:0:10}..."

echo ""
echo "[2] Creating Patient Entity (Authenticated)..."
curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"$NAME\",\"email\":\"$EMAIL\",\"phone\":\"0000000000\",\"birthDate\":\"2000-01-01\",\"gender\":\"M\"}"


# 3. Simulate Patient Login
echo ""
echo "[3] Logging in as Patient..."
PATIENT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Patient Token: ${PATIENT_TOKEN:0:10}..."

# 4. Fetch Profile
echo ""
echo "[4] Fetching Profile (GET /api/patients/me)..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/patients/me" \
  -H "Authorization: Bearer $PATIENT_TOKEN")

echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "HTTP_STATUS:200"; then
  echo ""
  echo "✅ SUCCESS: Profile found!"
else
  echo ""
  echo "❌ FAILURE: Profile not found or error."
fi
