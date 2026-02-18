# FCM(푸시 알림) 설정 가이드

앱에서 푸시 알림을 사용하려면 Firebase 프로젝트를 만들고 **google-services.json**을 Android 프로젝트에 추가해야 합니다.

---

## ✅ 서비스 계정 키까지 발급받은 경우 (다음 단계)

1. **시크릿 등록**: Supabase Dashboard → Project Settings → Edge Functions → Secrets에서  
   `FIREBASE_SERVICE_ACCOUNT_JSON` 이름으로, 서비스 계정 JSON **전체 내용**을 Value에 붙여넣기.
2. **Edge Function 배포**: 터미널에서 `supabase functions deploy send-push` 실행 (Supabase CLI 로그인 및 프로젝트 링크 필요).
3. **푸시 테스트**: 아래 [7. 서비스 계정 키로 푸시 보내기](#7-서비스-계정-키로-푸시-보내기-edge-function)의 7-3처럼 `send-push` 함수에 POST 요청 (user_id 또는 token + title/body).

자세한 내용은 아래 섹션을 참고하세요.

### ⚠️ "FIREBASE_SERVICE_ACCOUNT_JSON secret not set" 오류가 나는 경우

푸시 발송 시 위 오류가 나면 **시크릿이 아직 등록되지 않은 것**입니다. 아래 중 한 가지 방법으로 반드시 등록하세요.

- **대시보드**: [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택 → **Project Settings** → **Edge Functions** → **Secrets** → **Add new secret**  
  - Name: `FIREBASE_SERVICE_ACCOUNT_JSON`  
  - Value: Firebase 콘솔에서 받은 **서비스 계정 키 JSON 파일 전체 내용**을 복사해 붙여넣기 (한 줄이어도 됨)
- **CLI (PowerShell)**: 서비스 계정 JSON 파일 경로를 본인 환경에 맞게 바꾼 뒤 실행:
  ```powershell
  supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON="$(Get-Content -Path 'C:\경로\서비스계정키.json' -Raw)"
  ```
  JSON 파일이 없다면 Firebase Console → 프로젝트 설정 → **서비스 계정** → **키** 탭에서 **새 비공개 키 추가**로 다시 다운로드하세요.

## 1. Firebase Console 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속 후 **프로젝트 추가** (또는 기존 프로젝트 선택).
2. **프로젝트 설정** (톱니바퀴) → **일반** 탭에서 **Android 앱 추가**.
3. **Android 패키지 이름**에 `com.dancersbio.app` 입력 후 앱 등록.
4. **google-services.json** 파일 다운로드.

## 2. Android 프로젝트에 적용

다운로드한 `google-services.json`을 아래 경로에 복사합니다.

```
android/app/google-services.json
```

- **주의**: 이 파일은 Git에 커밋하지 마세요. (이미 `.gitignore`에 포함되어 있을 수 있음. 팀 공유 시에는 보안에 유의해 별도로 전달.)

## 3. 빌드 및 실행

- `android/app/build.gradle`에는 이미 `google-services` 플러그인 적용 로직이 있습니다.  
  `google-services.json`이 있으면 자동으로 적용됩니다.
- 앱을 다시 빌드한 뒤 실행하면, 앱 실행 시 **알림 권한 요청**이 뜨고, 수락 시 FCM 토큰이 발급·저장됩니다.

```bash
npm run build:cap
# Android Studio에서 Run 또는:
# $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; npx cap run android
```

## 4. 푸시 토큰 저장 (Supabase)

- 로그인한 사용자의 FCM 토큰은 **Supabase `push_tokens` 테이블**에 자동으로 저장됩니다.
- 테이블 구조: `user_id`, `token`, `platform` (android/ios/web), `updated_at`.
- 서버(또는 Supabase Edge Function)에서 `push_tokens`의 `token`으로 FCM HTTP v1 API를 호출하면 해당 사용자에게 푸시를 보낼 수 있습니다.

## 5. 테스트 알림 보내기 (Firebase Console)

1. Firebase Console → **Engage** → **Messaging** (또는 **빌드** → **Cloud Messaging**).
2. **첫 번째 캠페인 만들기** → **Firebase 알림 메시지**.
3. 알림 제목/본문 입력 후 **테스트 메시지 보내기**에서 기기의 **FCM 토큰** 입력 후 전송.

FCM 토큰은 앱 실행 후 Supabase `push_tokens` 테이블에서 확인하거나, 앱에서 디버그 로그로 출력해 확인할 수 있습니다.

## 6. (선택) 푸시 아이콘 (Android)

알림에 전용 아이콘을 쓰려면:

1. 흰색 단색 아이콘 리소스를 `android/app/src/main/res/drawable/` 등에 추가 (예: `ic_push.xml`).
2. `android/app/src/main/AndroidManifest.xml`의 `<application>` 안에 추가:

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_push" />
```

지정하지 않으면 앱 아이콘이 사용됩니다.

---

## 7. 서비스 계정 키로 푸시 보내기 (Edge Function)

Firebase 콘솔에서 **서비스 계정** → **키** 탭에서 키를 추가해 JSON 키 파일을 받았다면, 아래처럼 설정하면 **특정 사용자**나 **FCM 토큰**으로 푸시를 보낼 수 있습니다.

### 7-1. 시크릿 등록 (한 번만)

서비스 계정 JSON 파일 **전체 내용**을 Supabase 시크릿으로 등록합니다.

**방법 A: Supabase 대시보드**

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Project Settings** → **Edge Functions** → **Secrets**
3. **Add secret**  
   - Name: `FIREBASE_SERVICE_ACCOUNT_JSON`  
   - Value: 서비스 계정 JSON 파일을 열어 **전체를 복사**해 붙여넣기 (한 줄이어도 됨)

**방법 B: Supabase CLI**

```bash
# JSON 파일 경로를 지정해 시크릿 설정
supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON="$(cat /path/to/your-service-account-key.json)"
```

- Windows PowerShell 예시 (파일 경로만 바꿔서 사용):

```powershell
supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON="$(Get-Content -Path 'C:\path\to\your-service-account-key.json' -Raw)"
```

⚠️ **주의**: 서비스 계정 키는 절대 앱 소스코드나 Git에 넣지 마세요. 반드시 시크릿으로만 관리합니다.

### 7-2. Edge Function 배포

프로젝트 루트에서:

```bash
# Supabase CLI 로그인 후
supabase functions deploy send-push
```

배포 후 함수 URL은  
`https://<project-ref>.supabase.co/functions/v1/send-push`  
형식입니다 (Project Settings → API에서 확인).

### 7-3. 푸시 전송 요청

**Authorization** 헤더에 Supabase `anon` 키 또는 `service_role` 키를 넣어 POST로 호출합니다.

**요청 body 예시:**

| 필드 | 필수 | 설명 |
|------|------|------|
| `user_id` | user_id 또는 token 중 하나 | 푸시를 받을 사용자 UUID (Supabase Auth). `push_tokens` 테이블에서 해당 사용자의 토큰으로 전송 |
| `token` | user_id 또는 token 중 하나 | FCM 토큰 한 개. 이 토큰으로만 전송 |
| `title` | O | 알림 제목 |
| `body` | O | 알림 본문 (title/body 중 하나는 있어야 함) |
| `data` | X | 추가 데이터 (딥링크 등). 문자열 키/값 객체 |

**예: 특정 사용자에게 보내기**

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-push' \
  -H 'Authorization: Bearer <SUPABASE_ANON_OR_SERVICE_ROLE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "사용자-uuid",
    "title": "새 메시지",
    "body": "제안서가 도착했습니다."
  }'
```

**예: FCM 토큰으로 직접 보내기 (테스트)**

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-push' \
  -H 'Authorization: Bearer <SUPABASE_ANON_OR_SERVICE_ROLE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "여기에-push_tokens에-저장된-FCM-토큰",
    "title": "테스트",
    "body": "푸시 테스트입니다."
  }'
```

**예: 딥링크 데이터 포함**

```json
{
  "user_id": "사용자-uuid",
  "title": "제안서 도착",
  "body": "대시보드에서 확인하세요.",
  "data": { "link": "/dashboard" }
}
```

응답 예시: `{ "sent": 1, "total": 1, "results": [...] }`

정리하면:

1. **서비스 계정 키** → Supabase 시크릿 `FIREBASE_SERVICE_ACCOUNT_JSON`에 등록  
2. **Edge Function** `send-push` 배포  
3. 위와 같이 **POST**로 `user_id` 또는 `token` + `title`/`body` (및 필요 시 `data`) 보내기
