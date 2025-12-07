# 🔧 Netlify 환경 변수 설정 가이드

현재 Netlify 프로젝트 오버뷰 페이지에서 환경 변수를 설정하는 방법입니다.

## 📍 환경 변수 설정 위치 찾기

### 방법 1: 프로젝트 이름 클릭 (가장 쉬운 방법)

1. **현재 페이지에서 프로젝트 이름 클릭**
   - 화면 상단의 **"melodymind1"** (또는 프로젝트 이름) 클릭
   - 또는 프로젝트 카드에서 프로젝트 이름 클릭

2. **Site settings 메뉴 찾기**
   - 왼쪽 사이드바에서 **"Site settings"** 찾기
   - 클릭

3. **Environment variables 클릭**
   - Site settings 페이지가 열리면
   - 왼쪽 메뉴에서 **"Environment variables"** 클릭

### 방법 2: URL로 직접 이동

현재 URL이 `app.netlify.com/projects/melodymind1/overview`라면:

다음 URL로 직접 이동하세요:
```
https://app.netlify.com/sites/melodymind1/configuration/env
```

또는:
```
https://app.netlify.com/sites/melodymind1/configuration/env
```

### 방법 3: 프로젝트 설정 아이콘 사용

1. **프로젝트 카드에서 설정 아이콘 찾기**
   - 프로젝트 카드 우측 상단의 ⚙️ (기어) 아이콘 클릭
   - 또는 "Site settings" 버튼이 있으면 클릭

2. **Environment variables 선택**
   - 메뉴에서 "Environment variables" 선택

## ⚙️ 환경 변수 추가하기

Environment variables 페이지에 도달하면:

### 1. "Add a variable" 버튼 클릭

### 2. 다음 두 개의 환경 변수 추가

#### 첫 번째 변수:
- **Key**: `GOOGLE_SHEETS_ID`
- **Value**: `1lyks5uVVrnA5Nv0jVOzN8xELz7BU7Y5hxH6diT9Dp8Q`
- **Scopes**: "All scopes" 선택 (또는 "Production" 선택)
- **"Add variable"** 클릭

#### 두 번째 변수:
- **Key**: `GOOGLE_API_KEY`
- **Value**: 기존 Google API 키 (YouTube API와 같은 키 사용 가능)
- **Scopes**: "All scopes" 선택
- **"Add variable"** 클릭

### 3. 저장 확인

변수가 추가되면 목록에 표시됩니다.

## 🔑 Google API 키 확인 방법

Google API 키가 없다면:

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com

2. **API 및 서비스 → 사용자 인증 정보**
   - 왼쪽 메뉴에서 "API 및 서비스" → "사용자 인증 정보"

3. **기존 API 키 확인 또는 새로 만들기**
   - 기존 키가 있으면 복사
   - 없으면 "사용자 인증 정보 만들기" → "API 키" 선택

4. **Google Sheets API 활성화 확인**
   - "API 및 서비스" → "라이브러리"
   - "Google Sheets API" 검색
   - "사용 설정" 클릭 (아직 안 했다면)

## ✅ 설정 완료 후

1. **재배포 필요**
   - Netlify Dashboard → "Deploys" 탭
   - "Trigger deploy" → "Clear cache and deploy site"

2. **테스트**
   - 배포 완료 후 웹앱에서 비교 분석 페이지 확인

## 📸 스크린샷 가이드

환경 변수 페이지는 다음과 같이 생겼습니다:

```
┌─────────────────────────────────────┐
│  Environment variables              │
├─────────────────────────────────────┤
│  [Add a variable] 버튼              │
│                                     │
│  Key                Value    Scopes │
│  ────────────────────────────────── │
│  GOOGLE_SHEETS_ID   [값]     All    │
│  GOOGLE_API_KEY     [값]     All    │
└─────────────────────────────────────┘
```

## 🆘 여전히 찾을 수 없다면

1. **브라우저 주소창에 직접 입력**:
   ```
   https://app.netlify.com/sites/melodymind1/configuration/env
   ```

2. **Netlify 검색 기능 사용**:
   - Netlify 대시보드 상단 검색창에 "environment" 입력

3. **프로젝트 메뉴 확인**:
   - 프로젝트 이름 옆의 ▼ 아이콘 클릭
   - 드롭다운 메뉴에서 "Site configuration" 선택

## 📝 참고

- 환경 변수는 대소문자를 구분합니다
- 변수명은 정확히 입력해야 합니다: `GOOGLE_SHEETS_ID`, `GOOGLE_API_KEY`
- 환경 변수를 변경한 후에는 **반드시 재배포**해야 적용됩니다

