# 🚀 빠른 설정 가이드 - Netlify 배포 환경

이미지에서 확인한 정보를 바탕으로 빠르게 설정하는 방법입니다.

## 📋 확인된 정보

- **Spreadsheet ID**: `1lyks5uVVrnA5Nv0jVOzN8xELz7BU7Y5hxH6diT9Dp8Q`
- **시트명**: `설문지 응답 시트1`

## ⚡ 빠른 설정 (3단계)

### 1단계: Netlify 환경 변수 설정

**가장 빠른 방법: URL로 직접 이동**

현재 프로젝트 오버뷰 페이지(`app.netlify.com/projects/melodymind1/overview`)에서:

**아래 URL을 브라우저 주소창에 복사하여 이동하세요:**
```
https://app.netlify.com/sites/melodymind1/configuration/env
```

**또는 다음 방법:**

1. **프로젝트 이름 클릭**
   - 화면 상단의 **"melodymind1"** 클릭
   - 왼쪽 사이드바에서 **"Site settings"** 클릭
   - **"Environment variables"** 클릭

3. **환경 변수 추가**

   다음 두 개의 환경 변수를 추가하세요:

   | Key | Value |
   |-----|-------|
   | `GOOGLE_SHEETS_ID` | `1lyks5uVVrnA5Nv0jVOzN8xELz7BU7Y5hxH6diT9Dp8Q` |
   | `GOOGLE_API_KEY` | `기존 API 키 사용` (또는 YouTube API와 같은 키) |

   **참고**: 
   - `GOOGLE_API_KEY`는 이미 YouTube API를 위해 설정된 키를 사용할 수 있습니다.
   - 새로운 키가 필요하면: Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → API 키 만들기

4. **저장**
   - "Save" 버튼 클릭

### 2단계: Google Sheets API 활성화

1. **Google Cloud Console 열기**
   - https://console.cloud.google.com 접속

2. **API 및 서비스 > 라이브러리**
   - 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭

3. **Google Sheets API 검색 및 활성화**
   - 검색창에 "Google Sheets API" 입력
   - **"Google Sheets API"** 클릭
   - **"사용 설정"** 버튼 클릭

### 3단계: 재배포

1. **Netlify Dashboard로 돌아가기**
   - "Deploys" 탭 클릭

2. **재배포 실행**
   - "Trigger deploy" 드롭다운 클릭
   - **"Clear cache and deploy site"** 선택

3. **배포 완료 대기**
   - 배포가 완료될 때까지 기다립니다 (약 1-2분)

## ✅ 테스트

1. **배포된 웹앱 열기**
   - Netlify URL 접속

2. **비교 분석 페이지 열기**
   - 감상문 작성 플로우를 완료한 후
   - "전체 비교 분석 보기" 버튼 클릭

3. **데이터 확인**
   - 키워드 클라우드가 표시되는지 확인
   - Google Sheets의 데이터가 표시되는지 확인

## 🐛 문제 해결

### "데이터가 없습니다" 메시지가 표시되는 경우

1. **환경 변수 확인**
   - Netlify Dashboard에서 환경 변수가 올바르게 설정되었는지 확인
   - 변수명이 정확한지 확인 (`GOOGLE_SHEETS_ID`, `GOOGLE_API_KEY`)

2. **API 키 확인**
   - Google Cloud Console에서 Google Sheets API가 활성화되었는지 확인
   - API 키가 유효한지 확인

3. **Google Sheets 확인**
   - Google Sheets에 실제로 데이터가 있는지 확인
   - 시트명이 "설문지 응답 시트1"인지 확인

4. **Netlify Functions 로그 확인**
   - Netlify Dashboard → Functions 탭
   - `students-data` 함수 로그 확인
   - 에러 메시지 확인

### CORS 오류

- 이미 CORS 헤더가 설정되어 있으므로 문제없을 것입니다.
- 문제가 지속되면 브라우저 콘솔에서 오류 메시지 확인

## 📝 참고사항

- 환경 변수를 변경한 후에는 **반드시 재배포**해야 합니다.
- Google Sheets API는 무료 할당량이 있습니다 (일일 300회 요청).
- 데이터가 많으면 응답 시간이 느릴 수 있습니다.

## 🔗 관련 문서

- [NETLIFY_SHEETS_SETUP.md](./NETLIFY_SHEETS_SETUP.md) - 상세 설정 가이드
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 전체 배포 가이드

