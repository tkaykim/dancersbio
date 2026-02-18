# 안드로이드 기기에 앱 빌드 후 ADB로 설치
# 사용법: .\scripts\install-android-device.ps1 [-PairingCode "307294"] [-DeviceIp "172.30.1.68"] [-PairPort "33781"]

param(
    [string]$DeviceIp = "172.30.1.68",
    [string]$PairPort = "33781",
    [string]$PairingCode = "307294",
    [string]$ConnectPort = "5555"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = $PSScriptRoot
    while ($ProjectRoot -and -not (Test-Path (Join-Path $ProjectRoot "package.json"))) { $ProjectRoot = Split-Path -Parent $ProjectRoot }
}
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) { Write-Host "프로젝트 루트(package.json)를 찾을 수 없습니다." -ForegroundColor Red; exit 1 }
Set-Location $ProjectRoot

Write-Host "=== 1. Next.js 빌드 ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== 2. Capacitor Android 동기화 ===" -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== 3. Android Debug APK 빌드 ===" -ForegroundColor Cyan
if (-not $env:JAVA_HOME -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "JAVA_HOME이 없거나 java가 PATH에 없습니다. Android Studio 또는 JDK를 설치한 뒤 다시 실행하세요." -ForegroundColor Yellow
    Write-Host "수동 빌드: android 폴더에서 .\gradlew.bat assembleDebug" -ForegroundColor Gray
    Write-Host "APK 경로: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Gray
    Write-Host "`n아래 4~6단계만 진행하려면 APK를 빌드한 뒤 이 스크립트를 다시 실행하거나, 아래 명령을 직접 실행하세요." -ForegroundColor Cyan
    Write-Host "  adb pair ${DeviceIp}:${PairPort}   (페어링 코드 입력: $PairingCode)" -ForegroundColor Gray
    Write-Host "  adb connect ${DeviceIp}:${ConnectPort}" -ForegroundColor Gray
    Write-Host "  adb install -r android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Gray
    exit 1
}
Push-Location (Join-Path $ProjectRoot "android")
& .\gradlew.bat assembleDebug
$gradleExit = $LASTEXITCODE
Pop-Location
if ($gradleExit -ne 0) { exit $gradleExit }

$apkPath = Join-Path $ProjectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "APK를 찾을 수 없습니다: $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 4. ADB 페어링 (한 번만 필요) ===" -ForegroundColor Cyan
Write-Host "페어링 코드 입력이 필요하면: $PairingCode" -ForegroundColor Yellow
adb pair "${DeviceIp}:${PairPort}"
# 이미 페어됐으면 무시

Write-Host "`n=== 5. ADB 연결 ===" -ForegroundColor Cyan
adb connect "${DeviceIp}:${ConnectPort}"
Start-Sleep -Seconds 2
$devices = adb devices
if ($devices -notmatch "172\.30\.1\.68.*device") {
    Write-Host "기기가 연결되지 않았습니다. 무선 디버깅에서 '연결할 IP:포트'를 확인한 뒤 ConnectPort를 바꿔 주세요." -ForegroundColor Yellow
    adb devices
}

Write-Host "`n=== 6. APK 설치(업데이트) ===" -ForegroundColor Cyan
adb install -r $apkPath
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n설치 완료. 앱을 실행하면 알림 허용 여부를 묻는 시스템 창이 뜹니다." -ForegroundColor Green
