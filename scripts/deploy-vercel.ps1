# Deploy GenRights frontend to Vercel (requires: npx vercel login once)
$ErrorActionPreference = "Stop"
$frontend = Join-Path $PSScriptRoot ".." "frontend" | Resolve-Path

Push-Location $frontend

if (-not (Get-Command vercel -ErrorAction SilentlyContinue) -and -not (Test-Path "node_modules")) {
  Write-Host "Run: npm install" -ForegroundColor Yellow
}

$envFile = Join-Path $frontend ".env"
if (-not (Test-Path $envFile)) {
  Write-Host "Missing frontend/.env — copy from .env.example and set NEXT_PUBLIC_CONTRACT_ADDRESS" -ForegroundColor Red
  exit 1
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    if ($name.StartsWith("NEXT_PUBLIC_")) {
      npx vercel env add $name production --force 2>$null | Out-Null
      echo $value | npx vercel env add $name production 2>&1 | Out-Null
    }
  }
}

Write-Host "Deploying to Vercel (production)..." -ForegroundColor Cyan
npx vercel deploy --prod --yes

Pop-Location
