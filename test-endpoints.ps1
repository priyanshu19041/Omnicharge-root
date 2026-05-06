# ============================================================
#  OmniCharge — Full Endpoint Test Suite
#  Run AFTER: docker-compose up --build
#  Usage: .\test-endpoints.ps1
# ============================================================

$BASE = "http://localhost:8080"
$pass = 0
$fail = 0
$skip = 0

# ── Helpers ──────────────────────────────────────────────────

function Print-Header($title) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Test-Endpoint($label, $method, $url, $body = $null, $headers = @{}) {
    $fullUrl = "$BASE$url"
    try {
        $params = @{
            Uri             = $fullUrl
            Method          = $method
            Headers         = $headers
            TimeoutSec      = 10
            ErrorAction     = "Stop"
        }
        if ($body) {
            $params.Body        = ($body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }

        $resp = Invoke-RestMethod @params
        $script:pass++
        Write-Host "  [PASS] $label" -ForegroundColor Green
        return $resp
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status) {
            Write-Host "  [FAIL] $label  --> HTTP $status" -ForegroundColor Red
        } else {
            Write-Host "  [FAIL] $label  --> $($_.Exception.Message)" -ForegroundColor Red
        }
        $script:fail++
        return $null
    }
}

function Skip-Test($label, $reason) {
    Write-Host "  [SKIP] $label  --> $reason" -ForegroundColor Yellow
    $script:skip++
}

# ── Wait for gateway ──────────────────────────────────────────

Write-Host ""
Write-Host "  Waiting for API Gateway on port 8080..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        Invoke-WebRequest -Uri "$BASE/api/v1/users" -TimeoutSec 2 -ErrorAction Stop | Out-Null
        $ready = $true; break
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -gt 0) { $ready = $true; break }
        Start-Sleep -Seconds 2
    }
}
if (-not $ready) {
    Write-Host "  Gateway not reachable. Is docker-compose running?" -ForegroundColor Red
    exit 1
}
Write-Host "  Gateway is UP!" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
#  1. USER SERVICE
# ═══════════════════════════════════════════════════════════════
Print-Header "1. USER SERVICE  (/api/v1/users)"

# Register
$newUser = @{ username = "testuser_$(Get-Random)"; password = "Test@1234"; email = "test@omni.com"; phoneNumber = "9876543210" }
$regResp = Test-Endpoint "POST /register" "POST" "/api/v1/users/register" $newUser

# Login
$loginBody = @{ username = $newUser.username; password = $newUser.password }
$loginResp = Test-Endpoint "POST /login" "POST" "/api/v1/users/login" $loginBody

$TOKEN  = $null
$USER_ID = $null
if ($loginResp) {
    $TOKEN   = $loginResp.token
    $USER_ID = $loginResp.userId
    Write-Host "        userId=$USER_ID  token=$($TOKEN.Substring(0,30))..." -ForegroundColor DarkGray
}

$authHeader = @{ Authorization = "Bearer $TOKEN" }

# GET all users
Test-Endpoint "GET  /users" "GET" "/api/v1/users" | Out-Null

# GET by ID
if ($USER_ID) {
    Test-Endpoint "GET  /users/{id}" "GET" "/api/v1/users/$USER_ID" | Out-Null
} else { Skip-Test "GET  /users/{id}" "No userId from login" }

# GET /me
Test-Endpoint "GET  /users/me?username=" "GET" "/api/v1/users/me?username=$($newUser.username)" | Out-Null

# PUT update
if ($USER_ID) {
    Test-Endpoint "PUT  /users/{id}" "PUT" "/api/v1/users/$USER_ID" @{ email = "updated@omni.com"; phoneNumber = "9876543210" } | Out-Null
} else { Skip-Test "PUT  /users/{id}" "No userId" }

# ═══════════════════════════════════════════════════════════════
#  2. OPERATOR SERVICE
# ═══════════════════════════════════════════════════════════════
Print-Header "2. OPERATOR SERVICE  (/api/v1/operators)"

# GET all operators
$operators = Test-Endpoint "GET  /operators" "GET" "/api/v1/operators"

$OP_ID   = $null
$PLAN_ID = $null

if ($operators -and $operators.Count -gt 0) {
    $OP_ID = $operators[0].id
    Write-Host "        Using operatorId=$OP_ID ($($operators[0].name))" -ForegroundColor DarkGray
}

# GET operator by ID
if ($OP_ID) {
    Test-Endpoint "GET  /operators/{id}" "GET" "/api/v1/operators/$OP_ID" | Out-Null
} else { Skip-Test "GET  /operators/{id}" "No operators in DB yet" }

# POST create operator
$newOp = Test-Endpoint "POST /operators (create)" "POST" "/api/v1/operators" @{ name = "TestOperator"; region = "North" }
$newOpId = $newOp.id

# PUT update operator
if ($newOpId) {
    Test-Endpoint "PUT  /operators/{id}" "PUT" "/api/v1/operators/$newOpId" @{ name = "TestOperator-Updated"; region = "South" } | Out-Null
}

# GET all plans (across all operators)
Test-Endpoint "GET  /operators/plans" "GET" "/api/v1/operators/plans" | Out-Null

# GET plans by operator
if ($OP_ID) {
    $plans = Test-Endpoint "GET  /operators/{id}/plans" "GET" "/api/v1/operators/$OP_ID/plans"
    if ($plans -and $plans.Count -gt 0) {
        $PLAN_ID = $plans[0].id
        Write-Host "        Using planId=$PLAN_ID" -ForegroundColor DarkGray
    }
} else { Skip-Test "GET  /operators/{id}/plans" "No operatorId" }

# POST create plan
$newPlanOpId = if ($OP_ID) { $OP_ID } else { $newOpId }
$newPlan = $null
if ($newPlanOpId) {
    $newPlan = Test-Endpoint "POST /operators/{id}/plans (create)" "POST" "/api/v1/operators/$newPlanOpId/plans" @{
        planType = "DATA"; price = 299; validityDays = 30; description = "Test Plan 1GB/day"
    }
    if (-not $PLAN_ID -and $newPlan) { $PLAN_ID = $newPlan.id }
} else { Skip-Test "POST /operators/{id}/plans" "No operatorId" }

# GET plan by ID
if ($PLAN_ID) {
    Test-Endpoint "GET  /operators/plans/{planId}" "GET" "/api/v1/operators/plans/$PLAN_ID" | Out-Null
} else { Skip-Test "GET  /operators/plans/{planId}" "No planId" }

# PUT update plan
if ($newPlan) {
    Test-Endpoint "PUT  /operators/plans/{planId}" "PUT" "/api/v1/operators/plans/$($newPlan.id)" @{
        description = "Updated description"; price = 349
    } | Out-Null
}

# DELETE plan (cleanup test plan)
if ($newPlan) {
    Test-Endpoint "DELETE /operators/plans/{planId}" "DELETE" "/api/v1/operators/plans/$($newPlan.id)" | Out-Null
}

# DELETE operator (cleanup test operator)
if ($newOpId) {
    Test-Endpoint "DELETE /operators/{id}" "DELETE" "/api/v1/operators/$newOpId" | Out-Null
}

# ═══════════════════════════════════════════════════════════════
#  3. RECHARGE SERVICE
# ═══════════════════════════════════════════════════════════════
Print-Header "3. RECHARGE SERVICE  (/api/v1/recharges)"

$RECHARGE_ID = $null

if ($USER_ID -and $PLAN_ID -and $OP_ID) {
    $rechargeBody = @{
        userId       = $USER_ID
        mobileNumber = "9876543210"   # must match registered phoneNumber
        operatorId   = $OP_ID
        planId       = $PLAN_ID
    }
    $rechargeResp = Test-Endpoint "POST /recharges (initiate)" "POST" "/api/v1/recharges" $rechargeBody
    if ($rechargeResp) {
        $RECHARGE_ID = $rechargeResp.id
        Write-Host "        rechargeId=$RECHARGE_ID  status=$($rechargeResp.status)" -ForegroundColor DarkGray
    }
} else {
    Skip-Test "POST /recharges" "Missing userId/planId/operatorId"
}

# GET recharge history for user
if ($USER_ID) {
    Test-Endpoint "GET  /recharges/user/{userId}" "GET" "/api/v1/recharges/user/$USER_ID" | Out-Null
} else { Skip-Test "GET  /recharges/user/{userId}" "No userId" }

# GET recharge by ID
if ($RECHARGE_ID) {
    Test-Endpoint "GET  /recharges/{id}" "GET" "/api/v1/recharges/$RECHARGE_ID" | Out-Null
} else { Skip-Test "GET  /recharges/{id}" "No rechargeId" }

# ═══════════════════════════════════════════════════════════════
#  4. PAYMENT SERVICE
# ═══════════════════════════════════════════════════════════════
Print-Header "4. PAYMENT SERVICE  (/api/v1/payments)"

$PAYMENT_ID = $null

if ($USER_ID -and $PLAN_ID) {
    $paymentBody = @{
        userId        = $USER_ID
        rechargePlanId = $PLAN_ID
        amount        = 299
    }
    $payResp = Test-Endpoint "POST /payments (process)" "POST" "/api/v1/payments" $paymentBody
    if ($payResp) {
        $PAYMENT_ID = $payResp.id
        Write-Host "        paymentId=$PAYMENT_ID  txnId=$($payResp.transactionId)" -ForegroundColor DarkGray
    }
} else { Skip-Test "POST /payments" "Missing userId/planId" }

# GET payments by user
if ($USER_ID) {
    Test-Endpoint "GET  /payments/user/{userId}" "GET" "/api/v1/payments/user/$USER_ID" | Out-Null
} else { Skip-Test "GET  /payments/user/{userId}" "No userId" }

# GET payment by ID
if ($PAYMENT_ID) {
    Test-Endpoint "GET  /payments/{id}" "GET" "/api/v1/payments/$PAYMENT_ID" | Out-Null
} else { Skip-Test "GET  /payments/{id}" "No paymentId" }

# ═══════════════════════════════════════════════════════════════
#  5. NOTIFICATION SERVICE
# ═══════════════════════════════════════════════════════════════
Print-Header "5. NOTIFICATION SERVICE  (/api/v1/notifications)"

Test-Endpoint "GET  /notifications/status"        "GET" "/api/v1/notifications/status"        | Out-Null
Test-Endpoint "GET  /notifications/recent"        "GET" "/api/v1/notifications/recent"        | Out-Null
Test-Endpoint "GET  /notifications/recent/limit"  "GET" "/api/v1/notifications/recent/limit?limit=5" | Out-Null
Test-Endpoint "GET  /notifications/count"         "GET" "/api/v1/notifications/count"         | Out-Null

# ═══════════════════════════════════════════════════════════════
#  CLEANUP — delete the test user
# ═══════════════════════════════════════════════════════════════
Print-Header "CLEANUP"
if ($USER_ID) {
    Test-Endpoint "DELETE /users/{id} (cleanup)" "DELETE" "/api/v1/users/$USER_ID" | Out-Null
} else { Skip-Test "DELETE /users/{id}" "No userId" }

# ═══════════════════════════════════════════════════════════════
#  RESULTS
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host "  TEST RESULTS" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host "  PASSED : $pass" -ForegroundColor Green
Write-Host "  FAILED : $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host "  SKIPPED: $skip" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host ""
