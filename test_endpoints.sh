#!/bin/bash

# Base URLs (Direct access to services)
AUTH_URL="http://localhost:8081/auth"
PATIENT_URL="http://localhost:8082/api/patients"
DOCTOR_URL="http://localhost:8083/api/doctors"
RDV_URL="http://localhost:8084/api/rendezvous"
FACTURE_URL="http://localhost:8085/api/factures"

echo "============================================="
echo "      TESTING MEDICONNECT MICROSERVICES"
echo "============================================="

# Generate random email to avoid collision
EMAIL="jean.dupont.$(date +%s)@mail.com"

# 1. REGISTER
echo "\n[1] Registering User..."
curl -X POST "$AUTH_URL/register" \
     -H "Content-Type: application/json" \
     -d "{
           \"fullName\": \"Jean Dupont\",
           \"email\": \"$EMAIL\",
           \"password\": \"password123\",
           \"phone\": \"0601020304\",
           \"role\": \"PATIENT\"
         }"
echo ""

# 2. LOGIN
echo "\n[2] Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
     -H "Content-Type: application/json" \
     -d "{
           \"email\": \"$EMAIL\",
           \"password\": \"password123\"
         }")
echo "Response: $LOGIN_RESPONSE"

# Extract Token (Key is "token")
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"

# 3. CREATE PATIENT
echo "\n[3] Creating Patient..."
PATIENT_RESPONSE=$(curl -s -X POST "$PATIENT_URL" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "fullName": "Jean Dupont",
           "email": "jean.dupont@mail.com",
           "phone": "0601020304",
           "birthDate": "1990-01-01",
           "gender": "M",
           "address": "123 Rue de la Santé"
         }')
echo "$PATIENT_RESPONSE"
# Extract ID (first "id":123 occurrence)
PATIENT_ID=$(echo $PATIENT_RESPONSE | grep -o '"id":[0-9]*' | head -n1 | grep -o '[0-9]*')
echo "Patient ID: $PATIENT_ID"

# 4. CREATE DOCTOR
echo "\n[4] Creating Doctor..."
DOCTOR_RESPONSE=$(curl -s -X POST "$DOCTOR_URL" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "fullName": "Dr. Strange",
           "email": "strange@marvel.com",
           "phone": "0102030405",
           "specialty": "Chirurgie",
           "office": "Salle 101",
           "biography": "Expert en neurochirurgie"
         }')
echo "$DOCTOR_RESPONSE"
DOCTOR_ID=$(echo $DOCTOR_RESPONSE | grep -o '"id":[0-9]*' | head -n1 | grep -o '[0-9]*')
echo "Doctor ID: $DOCTOR_ID"

# 5. CREATE RENDEZ-VOUS (Dynamic IDs)
echo "\n[5] Creating Rendez-Vous..."
if [ -z "$PATIENT_ID" ] || [ -z "$DOCTOR_ID" ]; then
  echo "Error: Missing Patient or Doctor ID. Using fallback 1."
  PATIENT_ID=1
  DOCTOR_ID=1
fi

RDV_RESPONSE=$(curl -s -X POST "$RDV_URL" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d "{
           \"patientId\": $PATIENT_ID,
           \"doctorId\": $DOCTOR_ID,
           \"date\": \"2024-12-25T10:00:00\"
         }")
echo "$RDV_RESPONSE"
RDV_ID=$(echo $RDV_RESPONSE | grep -o '"id":[0-9]*' | head -n1 | grep -o '[0-9]*')
echo "Rdv ID: $RDV_ID"

# 6. CREATE FACTURE (Dynamic Rdv ID)
echo "\n[6] Creating Facture..."
if [ -z "$RDV_ID" ]; then
  echo "Error: Missing Rendez-Vous ID. Using fallback 1."
  RDV_ID=1
fi

curl -X POST "$FACTURE_URL" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d "{
           \"rendezVousId\": $RDV_ID,
           \"typeConsultation\": \"SPECIALISTE\",
           \"assurance\": true
         }"
echo ""

echo "\n============================================="
echo "      TESTS COMPLETED"
echo "============================================="
