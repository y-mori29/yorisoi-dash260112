# Create Zip Script for Manual Deployment
$ErrorActionPreference = "Stop"

$exclude = @("node_modules", "dist", ".git", ".gitignore", ".env.local", "*.zip")
$outputZip = "yorisoi-demo-drag.zip"

if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

Write-Host "Creating $outputZip..." -ForegroundColor Cyan
Write-Host "Excluding: $($exclude -join ', ')" -ForegroundColor Gray

$items = Get-ChildItem -Path . | Where-Object { 
    $name = $_.Name
    $skip = $false
    foreach ($ex in $exclude) {
        if ($name -eq $ex) { $skip = $true; break }
    }
    return -not $skip
}

Compress-Archive -Path $items.FullName -DestinationPath $outputZip

Write-Host "Done! Upload '$outputZip' to Google Cloud Console." -ForegroundColor Green
