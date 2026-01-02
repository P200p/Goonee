# PowerShell script to create CRX file for Chrome extension
# Note: This requires Chrome browser to be installed

param(
    [string]$ExtensionPath = "build\chrome",
    [string]$OutputPath = "build\shark-tools.crx"
)

Write-Host "🔧 Creating CRX file for Chrome extension..." -ForegroundColor Cyan

# Check if Chrome is installed
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (-not $chromePath) {
    Write-Host "❌ Chrome not found. Please install Chrome or use ZIP files instead." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Chrome at: $chromePath" -ForegroundColor Green

# Check if extension directory exists
if (-not (Test-Path $ExtensionPath)) {
    Write-Host "❌ Extension directory not found: $ExtensionPath" -ForegroundColor Red
    Write-Host "   Run build-extensions.ps1 first to create the extension files." -ForegroundColor Yellow
    exit 1
}

# Create output directory if it doesn't exist
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "📦 Packing extension..." -ForegroundColor Yellow

try {
    # Use Chrome to pack the extension
    $arguments = @(
        "--pack-extension=`"$(Resolve-Path $ExtensionPath)`"",
        "--pack-extension-key=`"$(Join-Path (Resolve-Path $ExtensionPath) '..' 'key.pem')`""
    )
    
    # If no key exists, Chrome will create one
    if (-not (Test-Path (Join-Path (Resolve-Path $ExtensionPath) '..' 'key.pem'))) {
        $arguments = @("--pack-extension=`"$(Resolve-Path $ExtensionPath)`"")
        Write-Host "🔑 No private key found. Chrome will generate a new one." -ForegroundColor Yellow
    }
    
    Start-Process -FilePath $chromePath -ArgumentList $arguments -Wait -WindowStyle Hidden
    
    # Chrome creates the CRX in the parent directory of the extension
    $generatedCrx = "$(Resolve-Path $ExtensionPath).crx"
    
    if (Test-Path $generatedCrx) {
        # Move to desired location
        Move-Item $generatedCrx $OutputPath -Force
        Write-Host "✅ CRX file created: $OutputPath" -ForegroundColor Green
        
        # Show file size
        $fileSize = (Get-Item $OutputPath).Length
        $fileSizeKB = [math]::Round($fileSize / 1024, 2)
        Write-Host "📊 File size: $fileSizeKB KB" -ForegroundColor Gray
        
        # Check if key was generated
        $keyPath = "$(Resolve-Path $ExtensionPath).pem"
        if (Test-Path $keyPath) {
            $newKeyPath = Join-Path (Split-Path $OutputPath -Parent) "shark-tools-private-key.pem"
            Move-Item $keyPath $newKeyPath -Force
            Write-Host "🔑 Private key saved: $newKeyPath" -ForegroundColor Green
            Write-Host "⚠️  Keep this key file secure! You'll need it for updates." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Failed to create CRX file" -ForegroundColor Red
        Write-Host "   Try using the ZIP file instead: build\shark-tools-chrome.zip" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error creating CRX: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Try using the ZIP file instead: build\shark-tools-chrome.zip" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Installation options:" -ForegroundColor Cyan
Write-Host "  • CRX file: Drag $OutputPath to chrome://extensions" -ForegroundColor White
Write-Host "  • ZIP file: Use build\shark-tools-chrome.zip for Chrome Web Store" -ForegroundColor White
Write-Host "  • Unpacked: Load build\chrome folder in developer mode" -ForegroundColor White