# 🐛 배포 환경 비교 분석 디버깅 가이드

배포 페이지에서 비교 분석이 표시되지 않는 문제를 해결하는 방법입니다.

## 📋 확인 체크리스트

### 1. 브라우저 콘솔 확인

1. **배포된 웹앱 열기**
   - `melodymind1.netlify.app` 접속
   - 비교 분석 페이지 열기

2. **개발자 도구 열기**
   - F12 키 또는 우클릭 → "검사"
   - "Console" 탭 클릭

3. **오류 메시지 확인**
   - 빨간색 오류 메시지가 있는지 확인
   - 특히 `fetch`, `API`, `students-data` 관련 오류 확인

4. **Network 탭 확인**
   - "Network" 탭 클릭
   - 비교 분석 페이지 새로고침
   - `students-data` 요청 찾기
   - 요청이 200 상태 코드를 반환하는지 확인
   - 응답 내용 확인

### 2. Netlify Functions 로그 확인

1. **Netlify Dashboard 접속**
   - https://app.netlify.com
   - `melodymind1` 프로젝트 선택

2. **Functions 탭**
   - 왼쪽 사이드바에서 "Functions" 클릭
   - `students-data` 함수 찾기

3. **로그 확인**
   - `students-data` 함수 클릭
   - "Logs" 탭에서 로그 확인
   - 다음과 같은 로그가 보여야 함:
     - `📊 학생 데이터 조회 시작`
     - `📋 시트명 시도: ...`
     - `✅ 시트명 "...에서 데이터 발견`
     - 또는 오류 메시지

4. **주요 로그 메시지**
   - `⚠️ Google Sheets ID 또는 API Key가 설정되지 않았습니다` → 환경 변수 확인 필요
   - `❌ 시트명 "...실패` → 시트명 문제
   - `✅ 시트명 "...에서 데이터 발견` → 정상 작동

### 3. 환경 변수 확인

1. **Netlify Dashboard**
   - Site settings → Environment variables

2. **확인할 변수**
   - `GOOGLE_SHEETS_ID` = `1lyks5uVVrnA5Nv0jVOzN8xELz7BU7Y5hxH6diT9Dp8Q`
   - `GOOGLE_API_KEY` = (API 키 값)

3. **값 확인 방법**
   - 각 변수의 드롭다운 화살표 클릭
   - 값이 올바르게 설정되어 있는지 확인

### 4. Google Sheets 확인

1. **Google Sheets 열기**
   - https://docs.google.com/spreadsheets/d/1lyks5uVVrnA5Nv0jVOzN8xELz7BU7Y5hxH6diT9Dp8Q/edit

2. **데이터 확인**
   - 데이터가 실제로 있는지 확인
   - 시트명 확인 (하단 탭 이름)

3. **공개 설정 확인** (선택사항)
   - 필요시 시트를 "링크가 있는 모든 사용자"로 공개
   - 하지만 API 키가 있으면 공개할 필요 없음

## 🔍 일반적인 문제와 해결 방법

### 문제 1: "데이터가 없습니다" 메시지

**원인:**
- Google Sheets에 데이터가 없음
- 시트명이 일치하지 않음
- API 키가 잘못됨

**해결:**
1. Google Sheets에 데이터가 있는지 확인
2. Netlify Functions 로그 확인
3. 환경 변수 재확인

### 문제 2: 네트워크 오류

**원인:**
- Netlify Functions가 호출되지 않음
- CORS 오류
- 404 오류

**해결:**
1. 브라우저 콘솔에서 오류 확인
2. Network 탭에서 요청 상태 확인
3. Netlify Functions가 제대로 배포되었는지 확인

### 문제 3: API 키 오류

**원인:**
- API 키가 유효하지 않음
- Google Sheets API가 활성화되지 않음

**해결:**
1. Google Cloud Console에서 API 키 확인
2. Google Sheets API가 활성화되어 있는지 확인
3. API 키 재생성 후 환경 변수 업데이트

## 📞 추가 도움

위의 방법으로도 해결되지 않으면:

1. **브라우저 콘솔 스크린샷**
   - 오류 메시지 포함

2. **Netlify Functions 로그 스크린샷**
   - Functions → students-data → Logs

3. **Network 탭 스크린샷**
   - students-data 요청의 Request/Response

이 정보들을 공유해주시면 더 정확한 진단이 가능합니다.

