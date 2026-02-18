# 무선 디버깅으로 연결 후 APK 설치
# 사용법 (프로젝트 루트에서):
#   .\scripts\install-android-wireless.ps1 -PairPort 33781 -ConnectPort 44077 -PairingCode 042287
# APK가 이미 빌드되어 있으면 -SkipBuild 사용 가능

param(
    [Parameter(Mandatory=$true)] [string] $PairPort,
    [Parameter(Mandatory=$true)] [string] $ConnectPort,
    [Parameter(Mandatory=$true)] [string] $PairingCode,
    [string] $IP = "172.30.1.68",
    [switch] $SkipBuild
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    Write-Host "adb를 찾을 수 없습니다: $adb" -ForegroundColor Red
    Write-Host "Android SDK platform-tools 경로를 확인하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "0. 무선 연결 중..." -ForegroundColor Cyan
& $adb pair "${IP}:${PairPort}" $PairingCode
if ($LASTEXITCODE -ne 0) { Write-Host "페어링 실패(이미 페어링됐을 수 있음). 연결 시도..." -ForegroundColor Yellow }
& $adb connect "${IP}:${ConnectPort}"
if ($LASTEXITCODE -ne 0) { Write-Host "연결 실패." -ForegroundColor Red; exit 1 }
Start-Sleep -Seconds 2
& $adb devices

if (-not $SkipBuild) {
    Write-Host "1. Next.js 빌드 및 Capacitor 동기화..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npx cap sync android
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "2. Android APK 빌드..." -ForegroundColor Cyan
    $env:JAVA_HOME = if (Test-Path "C:\Program Files\Android\Android Studio\jbr") { "C:\Program Files\Android\Android Studio\jbr" } else { $env:JAVA_HOME }
    Push-Location android
    .\gradlew.bat assembleDebug
    $gradleExit = $LASTEXITCODE
    Pop-Location
    if ($gradleExit -ne 0) { exit $gradleExit }
}

$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
    Write-Host "APK를 찾을 수 없습니다. -SkipBuild 없이 다시 실행하세요." -ForegroundColor Red
    exit 1
}

Write-Host "3. 기기에 설치 중..." -ForegroundColor Cyan
$tempApk = Join-Path $env:TEMP "dancersbio-debug.apk"
Copy-Item $apk $tempApk -Force
& $adb install -r $tempApk
$installExit = $LASTEXITCODE
Remove-Item $tempApk -ErrorAction SilentlyContinue
if ($installExit -ne 0) {
    Write-Host "설치 실패. 기기에서 무선 디버깅이 켜져 있고, 같은 Wi‑Fi인지 확인하세요." -ForegroundColor Red
    exit $installExit
}

Write-Host "설치 완료." -ForegroundColor Green
