# 📊 Netlify 배포 환경에서 비교 분석 데이터 설정 가이드

로컬호스트에서는 `students-data.json` 파일에서 데이터를 읽지만, Netlify 배포 환경에서는 파일 시스템을 사용할 수 없습니다. 따라서 **Google Sheets API**를 사용하여 데이터를 읽어야 합니다.

## 🎯 해결 방법

Google Forms 응답을 **Google Sheets**에 연결하고, Netlify Functions에서 Google Sheets API로 데이터를 읽습니다.

---

## 📝 1단계: Google Forms를 Google Sheets에 연결

1. **Google Forms 열기**
   - https://forms.google.com 에서 양식 열기

2. **"응답" 탭 클릭**
   - Google Forms 상단의 **"응답"** 탭 클릭

3. **Google Sheets 아이콘 클릭**
   - 응답 탭에서 **초록색 Google Sheets 아이콘** (📊) 클릭
   - 또는 "응답을 스프레드시트에 연결" 클릭

4. **새 스프레드시트 만들기**
   - "새 스프레드시트 만들기" 선택
   - 스프레드시트 이름 입력 (예: "MelodyMind 학생 데이터")
   - **"만들기"** 클릭

5. **스프레드시트 ID 확인**
   - 생성된 Google Sheets URL에서 ID 추출
   - 예: `https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit`
   - 여기서 `1ABC123xyz...` 부분이 **스프레드시트 ID**입니다

---

## 🔑 2단계: Google Sheets API 키 확인

Google Sheets API를 사용하려면 **Google API 키**가 필요합니다.

1. **Google Cloud Console 열기**
   - https://console.cloud.google.com 접속

2. **API 및 서비스 > 라이브러리**
   - 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭

3. **Google Sheets API 활성화**
   - 검색창에 "Google Sheets API" 입력
   - **"Google Sheets API"** 클릭
   - **"사용 설정"** 클릭

4. **API 키 확인**
   - 왼쪽 메뉴에서 "사용자 인증 정보" 클릭
   - 기존 API 키가 있으면 사용 (YouTube API와 같은 키 사용 가능)
   - 없으면 "사용자 인증 정보 만들기" > "API 키" 선택

---

## ⚙️ 3단계: Netlify 환경 변수 설정

1. **Netlify Dashboard 열기**
   - https://app.netlify.com 접속
   - 프로젝트 선택

2. **Site settings > Environment variables**
   - 왼쪽 메뉴에서 "Site settings" 클릭
   - "Environment variables" 클릭

3. **환경 변수 추가**

   | Key | Value | 설명 |
   |-----|-------|------|
   | `GOOGLE_SHEETS_ID` | `1ABC123xyz...` | Google Sheets 스프레드시트 ID |
   | `GOOGLE_API_KEY` | `AIzaXXX...` | Google API 키 (YouTube API와 같은 키 사용 가능) |

   **또는** 기존에 `GOOGLE_API_KEY` 또는 `YOUTUBE_API_KEY`가 있으면, 그것을 사용할 수 있습니다.

4. **변수 저장 후 재배포**
   - "Save" 클릭
   - "Deploys" 탭에서 **"Trigger deploy"** > **"Clear cache and deploy site"** 클릭

---

## 🔍 4단계: Google Sheets 시트명 확인

Netlify Functions에서 데이터를 읽을 때 시트명이 필요합니다.

1. **Google Sheets 열기**
   - 연결된 스프레드시트 열기

2. **시트명 확인**
   - 하단 탭에서 시트명 확인
   - 기본값: `시트1` 또는 `Form Responses 1`

3. **시트명이 다른 경우**
   - `netlify/functions/students-data.js` 파일 열기
   - 다음 줄 찾기:
     ```javascript
     const range = '시트1!A:Z';
     ```
   - 실제 시트명으로 변경:
     ```javascript
     const range = 'Form Responses 1!A:Z'; // 실제 시트명
     ```

---

## ✅ 5단계: 테스트

1. **학생 데이터 제출**
   - 배포된 웹앱에서 감상문 작성 및 제출

2. **Google Sheets 확인**
   - Google Sheets에서 데이터가 추가되었는지 확인

3. **비교 분석 페이지 확인**
   - 배포된 웹앱에서 "전체 비교 분석 보기" 페이지 열기
   - 키워드 클라우드가 표시되는지 확인

---

## 🐛 문제 해결

### "데이터가 없습니다" 메시지가 표시되는 경우

1. **Google Sheets ID 확인**
   - Netlify 환경 변수에 `GOOGLE_SHEETS_ID`가 올바르게 설정되었는지 확인

2. **API 키 확인**
   - Google API 키가 유효한지 확인
   - Google Sheets API가 활성화되었는지 확인

3. **시트명 확인**
   - `netlify/functions/students-data.js`의 `range` 변수가 실제 시트명과 일치하는지 확인

4. **데이터 확인**
   - Google Sheets에 실제로 데이터가 저장되었는지 확인

### CORS 오류가 발생하는 경우

- Netlify Functions에서 CORS 헤더가 올바르게 설정되어 있는지 확인
- `netlify/functions/students-data.js` 파일의 CORS 설정 확인

### API 할당량 초과

- Google API 키의 할당량 확인
- 필요시 Google Cloud Console에서 할당량 증가

---

## 📚 참고 자료

- [Google Sheets API 문서](https://developers.google.com/sheets/api)
- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)
- [Google Forms 응답을 스프레드시트에 연결](https://support.google.com/docs/answer/6281888)

---

## 💡 대안 방법

Google Sheets API 설정이 복잡하다면, 다른 방법도 사용할 수 있습니다:

1. **Supabase 사용**: 무료 데이터베이스 서비스
2. **MongoDB Atlas 사용**: 클라우드 데이터베이스
3. **JSONBin 사용**: 간단한 JSON 저장소

하지만 Google Forms와 이미 연동되어 있다면, Google Sheets가 가장 간단한 방법입니다.

