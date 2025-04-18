# Local webhook URL - update if using a different port or URL
$WebhookUrl = "http://localhost:5173/api/webhook"
$TestEndpointUrl = "http://localhost:5173/api/webhook/test"

# Optional ID parameter
$Id = "test-deposit"

# Full URL with ID parameter
$FullUrl = "$WebhookUrl`?id=$Id"

# Read the JSON payload from file
$Payload = Get-Content -Path "curl_test.json" -Raw

Write-Host "=== SENDING WEBHOOK TO MAIN ENDPOINT ===" -ForegroundColor Cyan
# Send the webhook request to the main endpoint
$Response = Invoke-RestMethod -Uri $FullUrl -Method Post -Body $Payload -ContentType "application/json"

# Output results
Write-Host "Webhook sent to $FullUrl"
Write-Host "Response:" -ForegroundColor Green
$Response | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "=== RUNNING DIAGNOSTIC TEST ===" -ForegroundColor Cyan

# Send the same payload to the test endpoint
$TestResponse = Invoke-RestMethod -Uri $TestEndpointUrl -Method Post -Body $Payload -ContentType "application/json"

# Output test results
Write-Host "Test results:" -ForegroundColor Green
$TestResponse | ConvertTo-Json -Depth 10 