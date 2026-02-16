# Playwright MCP – 터미널 없이 사용하기

이 프로젝트에는 **프로젝트 수준 MCP 설정**이 포함되어 있습니다.  
`.cursor/mcp.json`에 Playwright MCP가 등록되어 있으므로, Cursor가 이 프로젝트를 열면 **자동으로 Playwright MCP를 사용할 수 있습니다** (stdio 방식).

- **처음 적용 시**: Cursor에서 `Cmd+Shift+P` → "Developer: Reload Window" 실행하거나 Cursor를 재시작하면 MCP가 로드됩니다.
- **MCP 확인**: Cursor 설정 → Features → MCP에서 "playwright" 서버가 켜져 있는지 확인할 수 있습니다.

아래는 **터미널에서 서버를 직접 띄워서** 사용하는 방식(예: localhost:8931)입니다. 프로젝트 MCP로 충분하면 생략 가능합니다.

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
