# Playwright MCP – 터미널 없이 사용하기

Cursor에서 Playwright MCP는 기본적으로 **localhost:8931**에 떠 있는 서버에 연결합니다.  
아래 중 한 가지 방식으로 서버를 켜 두면 됩니다.

## 방법 1: 로그인 시 자동 실행 (권장)

매번 터미널을 열 필요 없이, Mac 로그인 시 Playwright MCP 서버가 백그라운드에서 자동으로 실행되게 할 수 있습니다.

```bash
# 1. 이 프로젝트 루트에서 실행. LaunchAgent 파일 복사
mkdir -p ~/Library/LaunchAgents
cp scripts/com.playwright.mcp.plist ~/Library/LaunchAgents/

# 2. 서비스 로드 (지금 바로 실행)
launchctl load ~/Library/LaunchAgents/com.playwright.mcp.plist
```

이후에는 Cursor를 켜기만 하면 Playwright MCP를 사용할 수 있습니다.

- **중지:** `launchctl unload ~/Library/LaunchAgents/com.playwright.mcp.plist`
- **로그 확인:** `cat /tmp/playwright-mcp.out.log` / `cat /tmp/playwright-mcp.err.log`

## 방법 2: 필요할 때만 터미널에서 실행

```bash
npm run mcp:playwright
```

이 터미널을 닫지 않고 두면 Cursor에서 Playwright MCP를 사용할 수 있습니다.
