# 📊 정적 JSON 파일 방식 사용 가이드

비교 분석 기능이 이제 **정적 JSON 파일**을 사용하도록 변경되었습니다.

## ✨ 변경 사항

- ✅ Google Sheets API 설정 불필요
- ✅ 환경 변수 설정 불필요  
- ✅ 즉시 작동 (추가 설정 없음)
- ⚠️ 데이터는 수동 업데이트 필요

## 📁 파일 위치

- `students-data.json` - 루트 디렉토리 (배포용)
- `public/students-data.json` - 백업 복사본

## 🔄 데이터 업데이트 방법

### 방법 1: Google Sheets에서 다운로드

1. Google Sheets 열기
2. 파일 → 다운로드 → CSV 형식 선택
3. CSV를 JSON으로 변환
4. `students-data.json` 파일 교체
5. Git에 커밋 및 푸시
6. Netlify 자동 재배포

### 방법 2: 수동 추가

`students-data.json` 파일을 직접 편집하여 새로운 데이터 추가:

```json
[
  {
    "userId": "user_...",
    "timestamp": "2025-12-07T...",
    "title": "악곡 제목",
    "composer": "작곡가",
    "artist": "연주자",
    ...
  },
  // 새 데이터 추가
]
```

### 방법 3: Google Forms 응답에서 직접 복사

Google Forms 응답을 JSON 형식으로 변환하여 추가

## 🚀 배포 후 확인

1. 배포된 웹앱 접속
2. "전체 비교 분석 보기" 페이지 열기
3. 데이터가 정상적으로 표시되는지 확인

## 📝 주의사항

- 데이터 업데이트 시 **Git에 커밋하고 푸시**해야 Netlify에 반영됩니다
- Google Forms는 계속 데이터를 수집하지만, **비교 분석에 표시되려면 JSON 파일을 업데이트**해야 합니다
- 새로운 데이터가 자동으로 반영되지 않으므로, 정기적으로 JSON 파일을 업데이트해주세요

## 🔧 문제 해결

### "데이터가 없습니다" 메시지가 표시되는 경우

1. `students-data.json` 파일이 루트에 있는지 확인
2. JSON 형식이 올바른지 확인 (온라인 JSON validator 사용)
3. 브라우저 개발자 도구(F12) → Network 탭에서 `/students-data.json` 요청 확인

### 로컬에서 테스트

로컬 환경에서는:
- 서버 실행 시: `server.js`가 `students-data.json` 파일을 읽어 API로 제공
- 서버 미실행 시: 정적 파일 직접 로드 (fallback)

## 💡 향후 개선 사항

필요시 다음 방법으로 자동화 가능:
- GitHub Actions로 Google Sheets → JSON 자동 변환
- 주기적 자동 업데이트 스크립트
- 다른 클라우드 서비스 연동 (Supabase, MongoDB 등)

