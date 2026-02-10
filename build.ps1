# Thunderbird Extension Build Script
# This script packages the extension into a .xpi file

$ErrorActionPreference = "Stop"

# Configuration
$ExtensionName = "calendar-meeting-opener"
$OutputDir = "dist"
$OutputFile = "$ExtensionName.xpi"

# Files and directories to include in the extension
$FilesToInclude = @(
    "manifest.json",
    "background.js",
    "implementation.js",
    "schema.json",
    "experiments",
    "schema"
)

# Clean up old build
Write-Host "Cleaning up old builds..." -ForegroundColor Cyan
if (Test-Path $OutputDir) {
    Remove-Item -Path $OutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputDir | Out-Null

# Temporary directory for staging files
$TempDir = Join-Path $OutputDir "temp"
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy files to temp directory
Write-Host "Copying files..." -ForegroundColor Cyan
foreach ($item in $FilesToInclude) {
    $sourcePath = Join-Path $PSScriptRoot $item
    
    if (-not (Test-Path $sourcePath)) {
        Write-Warning "Warning: $item not found, skipping..."
        continue
    }
    
    if (Test-Path $sourcePath -PathType Container) {
        # It's a directory
        Copy-Item -Path $sourcePath -Destination $TempDir -Recurse -Force
        Write-Host "  Copied directory: $item" -ForegroundColor Gray
    } else {
        # It's a file
        Copy-Item -Path $sourcePath -Destination $TempDir -Force
        Write-Host "  Copied file: $item" -ForegroundColor Gray
    }
}

# Create the XPI file (which is just a ZIP file)
Write-Host "Creating XPI package..." -ForegroundColor Cyan
$xpiPath = Join-Path $OutputDir $OutputFile

# Use .NET compression to create the archive
Add-Type -Assembly System.IO.Compression.FileSystem
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
[System.IO.Compression.ZipFile]::CreateFromDirectory($TempDir, $xpiPath, $compressionLevel, $false)

# Clean up temp directory
Remove-Item -Path $TempDir -Recurse -Force

# Display results
Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Output: $xpiPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "File size: $([math]::Round((Get-Item $xpiPath).Length / 1KB, 2)) KB" -ForegroundColor Gray
Write-Host ""
Write-Host "To install in Thunderbird:" -ForegroundColor Cyan
Write-Host "  1. Open Thunderbird" -ForegroundColor White
Write-Host "  2. Go to Tools -> Add-ons and Themes (Ctrl+Shift+A)" -ForegroundColor White
Write-Host "  3. Click the gear icon and select 'Install Add-on From File'" -ForegroundColor White
Write-Host "  4. Select the file: $xpiPath" -ForegroundColor White
Write-Host ""

# Optional: Open the dist folder
$openFolder = Read-Host "Open dist folder? (y/n)"
if ($openFolder -eq 'y' -or $openFolder -eq 'Y') {
    Invoke-Item $OutputDir
}