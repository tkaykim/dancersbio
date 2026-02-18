# Android 디버그 빌드 및 연결 기기 설치
# 사용: .\scripts\android-build-install.ps1
# 필요: Android Studio 설치(JDK 포함), USB 디버깅 켠 기기 연결 또는 에뮬레이터 실행

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $root) { $root = (Get-Location).Path }

# JAVA_HOME 자동 탐색 (Android Studio JBR 우선)
if (-not $env:JAVA_HOME) {
    $candidates = @(
        "C:\Program Files\Android\Android Studio\jbr",
        "C:\Program Files\Microsoft\jdk-17*",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Java\jdk-17*"
    )
    foreach ($c in $candidates) {
        $resolved = Get-Item $c -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved) {
            $env:JAVA_HOME = $resolved.FullName
            Write-Host "JAVA_HOME: $env:JAVA_HOME"
            break
        }
    }
}
if (-not $env:JAVA_HOME) {
    Write-Host "JAVA_HOME이 없습니다. Android Studio를 설치하거나 JAVA_HOME을 설정한 뒤 다시 실행하세요." -ForegroundColor Red
    exit 1
}

Set-Location $root
Write-Host "Next.js 빌드 중..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Capacitor 동기화 중..."
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location "$root\android"
Write-Host "Android 디버그 빌드 및 설치 중..."
.\gradlew.bat installDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "설치 완료. 연결된 기기에서 앱을 실행하세요." -ForegroundColor Green
