#!/bin/bash

# Base URL
GATEWAY_URL="http://localhost:8080"
AUTH_URL="$GATEWAY_URL/auth"

echo "============================================="
echo "      TESTING MEDICONNECT RBAC SCENARIOS"
echo "============================================="

# Utilities
generate_email() {
  echo "$1.$(date +%s)@mail.com"
}

# 1. SETUP USERS (REGISTER)
echo "\n--- [Step 1] Creating Users for each Role ---"

ADMIN_EMAIL=$(generate_email "admin")
DOCTOR_EMAIL=$(generate_email "doctor")
PATIENT_EMAIL=$(generate_email "patient")

# Register ADMIN
echo "Creating ADMIN..."
curl -s -X POST "$AUTH_URL/register" \
     -H "Content-Type: application/json" \
     -d "{ \"fullName\": \"Admin User\", \"email\": \"$ADMIN_EMAIL\", \"password\": \"password123\", \"phone\": \"111\", \"role\": \"ADMIN\" }" > /dev/null

echo "Creating DOCTOR..."
curl -s -X POST "$AUTH_URL/register" \
     -H "Content-Type: application/json" \
     -d "{ \"fullName\": \"Doctor User\", \"email\": \"$DOCTOR_EMAIL\", \"password\": \"password123\", \"phone\": \"222\", \"role\": \"DOCTOR\" }" > /dev/null

echo "Creating PATIENT..."
curl -s -X POST "$AUTH_URL/register" \
     -H "Content-Type: application/json" \
     -d "{ \"fullName\": \"Patient User\", \"email\": \"$PATIENT_EMAIL\", \"password\": \"password123\", \"phone\": \"333\", \"role\": \"PATIENT\" }" > /dev/null

# 2. LOGIN & GET TOKENS
echo "\n--- [Step 2] Retrieving Tokens ---"

get_token() {
  response=$(curl -s -X POST "$AUTH_URL/login" \
       -H "Content-Type: application/json" \
       -d "{ \"email\": \"$1\", \"password\": \"password123\" }")
  
  # Debug output if empty
  token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ -z "$token" ]; then
      echo "LOGIN FAILED for $1. Response: $response" >&2
  fi
  echo $token
}

ADMIN_TOKEN=$(get_token "$ADMIN_EMAIL")
DOCTOR_TOKEN=$(get_token "$DOCTOR_EMAIL")
PATIENT_TOKEN=$(get_token "$PATIENT_EMAIL")

echo "Admin Token:   ${ADMIN_TOKEN:0:15}..."
echo "Doctor Token:  ${DOCTOR_TOKEN:0:15}..."
echo "Patient Token: ${PATIENT_TOKEN:0:15}..."

# 3. TEST HELPERS
check_access() {
  # usage: check_access "ROLE_NAME" "TOKEN" "METHOD" "URL" "EXPECTED_CODE"
  ROLE=$1
  TOKEN=$2
  METHOD=$3
  URL=$4
  EXPECTED=$5

  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $METHOD "$URL" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  
  if [ "$CODE" == "$EXPECTED" ]; then
    echo "✅ [$ROLE] $METHOD $URL -> $CODE (Expected: $EXPECTED)"
  else
    echo "❌ [$ROLE] $METHOD $URL -> $CODE (Expected: $EXPECTED) - FAILED"
  fi
}

# 4. RUN SCENARIOS
echo "\n--- [Step 3] Running RBAC Tests ---"

# --- SCENARIO A: GET /api/patients (List all) ---
# Admin: 200, Doctor: 200, Patient: 403
echo "\n[TEST] List all patients (GET /api/patients)"
check_access "ADMIN"   "$ADMIN_TOKEN"   "GET" "$GATEWAY_URL/api/patients" 200
check_access "DOCTOR"  "$DOCTOR_TOKEN"  "GET" "$GATEWAY_URL/api/patients" 200
check_access "PATIENT" "$PATIENT_TOKEN" "GET" "$GATEWAY_URL/api/patients" 403

# --- SCENARIO B: POST /api/doctors (Create Doctor) ---
# Admin: 200 (or 201), Doctor: 403, Patient: 403
echo "\n[TEST] Create Doctor (POST /api/doctors)"
DOC_BODY='{"fullName":"Dr. Test","email":"newdoc@test.com","phone":"000","specialty":"Gen","office":"A1"}'

# Note: We just check status, passing dummy body is fine usually, but let's be cleaner
# Admin creation might create logic errors if email dupes, but Gateway check is first.
# actually 400 is fine if validation fails, as long as it's not 403. 
# But let's assume valid body for clean auth check.
# Since we are checking AUTH, even a 400 means "Authorized but bad request". 403 means "Forbidden".
# Ideally we want 200/201.
# Let's perform a dry run request.

check_creation() {
  ROLE=$1; TOKEN=$2; EXPECTED=$3
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY_URL/api/doctors" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"fullName\":\"Dr $ROLE\",\"email\":\"dr.$ROLE.$(date +%s)@mail.com\",\"phone\":\"000\",\"specialty\":\"Ortho\",\"office\":\"B2\"}")
  
  if [ "$CODE" == "$EXPECTED" ] || ([ "$EXPECTED" == "200" ] && [ "$CODE" == "201" ]); then
     echo "✅ [$ROLE] POST /api/doctors -> $CODE (Matches $EXPECTED)"
  else
     echo "❌ [$ROLE] POST /api/doctors -> $CODE (Expected $EXPECTED)"
  fi
}

check_creation "ADMIN"   "$ADMIN_TOKEN"   200
check_creation "DOCTOR"  "$DOCTOR_TOKEN"  403
check_creation "PATIENT" "$PATIENT_TOKEN" 403

# --- SETUP: Ensure Patient Profile Exists for Scenario C ---
echo "\n[SETUP] Creating Patient Profile (by Admin)..."
curl -s -X POST "$GATEWAY_URL/api/patients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
        \"fullName\": \"Patient User\",
        \"email\": \"$PATIENT_EMAIL\",
        \"phone\": \"333\",
        \"birthDate\": \"1990-01-01\",
        \"gender\": \"M\",
        \"address\": \"Home\"
      }" > /dev/null

# --- SCENARIO C: GET /api/patients/me (Own Profile) ---
# Patient: 200 (Admin/Doctor might be 403 or 404 depending on impl, but RBAC says Patient only)
echo "\n[TEST] Get Own Profile (GET /api/patients/me)"
# Assuming implementation of /me relies on X-User-Email
check_access "PATIENT" "$PATIENT_TOKEN" "GET" "$GATEWAY_URL/api/patients/me" 200
# Admin/Doctor might fail logic (not found) or auth. Our filter allows Patient explicitly.
# Based on code: if role=PATIENT -> /api/patients/me is allowed. 
# Others fall through to default.
# The filter we wrote: if role != PATIENT, explicit rules apply.
# For DOCTOR: only /patients (list) allowed, so /me might match /patients prefix but logic might differ. 
# Actually strict filter: 
# DOCTOR: if startsWith /api/patients AND !contains /me -> GET.
# So DOCTOR -> /api/patients/me -> isAuthorized returns FALSE -> 403. CORRECT.
check_access "DOCTOR" "$DOCTOR_TOKEN" "GET" "$GATEWAY_URL/api/patients/me" 403

# --- SCENARIO D: POST /api/rendezvous (Booking) ---
# All roles Allowed ?
# Plan says: Admin/Doctor/Patient ALL OK.
echo "\n[TEST] Book RendezVous (POST /api/rendezvous)"
# Need valid IDs. Let's assume ID 1 exists (from previous setup).
RDV_BODY="{\"patientId\": 1, \"doctorId\": 1, \"date\": \"2025-01-01T10:00:00\"}"

check_rdv() {
  ROLE=$1; TOKEN=$2; EXPECTED=$3
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY_URL/api/rendezvous" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$RDV_BODY")
   
   # Accept 200 or 201
  if [ "$CODE" == "$EXPECTED" ] || ([ "$EXPECTED" == "200" ] && [ "$CODE" == "201" ]); then
     echo "✅ [$ROLE] POST /api/rendezvous -> $CODE (Matches $EXPECTED)"
  else
     echo "❌ [$ROLE] POST /api/rendezvous -> $CODE (Expected $EXPECTED)"
  fi
}

check_rdv "ADMIN"   "$ADMIN_TOKEN"   200
check_rdv "DOCTOR"  "$DOCTOR_TOKEN"  200
check_rdv "PATIENT" "$PATIENT_TOKEN" 200

# --- SCENARIO E: POST /api/factures (Create Invoice) ---
# Admin: 200, Doctor: 403, Patient: 403
echo "\n[TEST] Create Facture (POST /api/factures)"
INVOICE_BODY="{\"rendezVousId\": 1, \"typeConsultation\": \"GENERALISTE\", \"assurance\": true}"

check_invoice() {
  ROLE=$1; TOKEN=$2; EXPECTED=$3
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY_URL/api/factures" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$INVOICE_BODY")
   
  if [ "$CODE" == "$EXPECTED" ] || ([ "$EXPECTED" == "200" ] && [ "$CODE" == "201" ]); then
     echo "✅ [$ROLE] POST /api/factures -> $CODE (Matches $EXPECTED)"
  else
     echo "❌ [$ROLE] POST /api/factures -> $CODE (Expected $EXPECTED)"
  fi
}

check_invoice "ADMIN"   "$ADMIN_TOKEN"   200
check_invoice "DOCTOR"  "$DOCTOR_TOKEN"  403
check_invoice "PATIENT" "$PATIENT_TOKEN" 403


echo "\n============================================="
echo "      SCENARIO TESTS COMPLETED"
echo "============================================="
