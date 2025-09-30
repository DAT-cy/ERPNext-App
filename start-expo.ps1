# ERPNext App Starter Script
$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$env:PATH;$nodePath"

Write-Host "Starting ERPNext Mobile App..." -ForegroundColor Green
Write-Host "Node.js version:" -ForegroundColor Yellow
& "$nodePath\node.exe" --version

Write-Host "Starting Expo development server..." -ForegroundColor Yellow
& "$nodePath\npx.cmd" expo start -c