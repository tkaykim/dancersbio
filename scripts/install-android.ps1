# dancersbio Android APK 빌드 후 기기에 설치
# 사용법: 프로젝트 루트에서 .\scripts\install-android.ps1
# 또는: cd 프로젝트경로 후 .\scripts\install-android.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

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

$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
    Write-Host "APK를 찾을 수 없습니다: $apk" -ForegroundColor Red
    exit 1
}

Write-Host "3. 기기에 설치 중..." -ForegroundColor Cyan
$tempApk = Join-Path $env:TEMP "dancersbio-debug.apk"
Copy-Item $apk $tempApk -Force
adb install -r $tempApk
$installExit = $LASTEXITCODE
Remove-Item $tempApk -ErrorAction SilentlyContinue
if ($installExit -ne 0) {
    Write-Host "설치 실패. adb connect 172.30.1.68:43003 등으로 기기가 연결되어 있는지 확인하세요." -ForegroundColor Red
    exit $installExit
}

Write-Host "설치 완료." -ForegroundColor Green
