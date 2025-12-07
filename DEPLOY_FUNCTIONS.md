# 🚀 Netlify Functions 배포 가이드

Functions 페이지가 비어있는 경우, Functions를 배포하는 방법입니다.

## ⚠️ 문제 상황

- Functions 페이지(`app.netlify.com/projects/melodymind1/functions`)가 비어있음
- `/api/students-data`가 404 오류 반환

## 🔍 원인

1. **GitHub에 Functions 파일이 푸시되지 않음**
   - 로컬에만 파일이 있고 GitHub에는 없을 수 있음

2. **Netlify가 Functions를 감지하지 못함**
   - 배포가 완료되지 않았을 수 있음

## ✅ 해결 방법

### 1단계: GitHub에 파일 푸시 확인

**중요:** 다음 파일들이 GitHub에 있어야 합니다:

1. `netlify/functions/students-data.js` ✅
2. `netlify/functions/analyze.js` ✅
3. `netlify/functions/google-forms.js` ✅
4. `netlify.toml` ✅

**확인 방법:**
- GitHub 저장소에 접속
- `netlify/functions` 폴더 확인
- 3개의 `.js` 파일이 있는지 확인

**없다면:**
- 로컬에서 Git 명령어로 푸시:
  ```bash
  git add netlify/functions/students-data.js
  git add netlify.toml
  git commit -m "Add students-data Netlify Function"
  git push
  ```

### 2단계: Netlify 재배포

1. **Netlify Dashboard 접속**
   - https://app.netlify.com
   - `melodymind1` 프로젝트 선택

2. **Deploys 탭**
   - 왼쪽 사이드바에서 "Deploys" 클릭

3. **재배포 실행**
   - "Trigger deploy" 버튼 클릭
   - **"Deploy project without cache"** 선택

4. **배포 완료 대기**
   - 배포가 완료될 때까지 기다림 (1-2분)

### 3단계: 배포 로그 확인

배포가 완료되면:

1. **최신 배포 클릭**
   - Deploys 목록에서 최신 배포 선택

2. **Deploy log 탭 확인**
   - "Deploy log" 탭 클릭

3. **Functions 빌드 메시지 확인**
   - 다음 메시지들이 보여야 함:
     - "Packaging functions..."
     - "Functions bundling..."
     - "3 functions packaged"

4. **오류 확인**
   - 빨간색 오류 메시지가 있는지 확인
   - Functions 빌드 관련 오류 확인

### 4단계: Functions 페이지 다시 확인

배포가 완료된 후:

1. **Functions 페이지 접속**
   - 왼쪽 사이드바에서 "Functions" 클릭
   - 또는 URL: `app.netlify.com/projects/melodymind1/functions`

2. **Functions 목록 확인**
   - 다음 3개가 보여야 함:
     - `analyze`
     - `google-forms`
     - `students-data`

## 🔧 문제가 계속되는 경우

### 문제 1: Functions가 여전히 보이지 않음

**확인 사항:**
1. GitHub에 파일이 푸시되었는지 확인
2. 배포 로그에서 Functions 빌드 메시지 확인
3. `netlify.toml` 파일이 올바른지 확인

**해결:**
- GitHub 저장소에서 직접 파일 확인
- Netlify 배포 설정에서 Functions 디렉토리 확인

### 문제 2: 배포 로그에 Functions 관련 메시지가 없음

**원인:**
- Netlify가 Functions 디렉토리를 찾지 못함

**해결:**
1. Netlify Dashboard → Site settings → Build & deploy
2. "Functions directory" 확인
3. `netlify/functions`로 설정되어 있는지 확인
4. 또는 `netlify.toml`의 `functions = "netlify/functions"` 확인

### 문제 3: 빌드 오류

**원인:**
- Functions 파일에 문법 오류
- 의존성 문제

**해결:**
1. 배포 로그에서 오류 메시지 확인
2. Functions 파일 문법 확인
3. `node-fetch` 등 필요한 패키지 확인

## 📝 빠른 체크리스트

배포 전 확인:
- [ ] `netlify/functions/students-data.js` 파일 존재
- [ ] `netlify.toml` 파일 존재
- [ ] GitHub에 모든 파일 푸시됨
- [ ] Netlify 환경 변수 설정됨 (`GOOGLE_SHEETS_ID`, `GOOGLE_API_KEY`)

배포 후 확인:
- [ ] 배포 로그에서 "Functions bundling" 메시지 확인
- [ ] Functions 페이지에 3개 함수 표시
- [ ] 웹앱에서 404 오류 없음

## 🆘 여전히 문제가 있다면

1. **Netlify Support에 문의**
   - Functions 탭이 비어있는 스크린샷
   - 배포 로그 스크린샷

2. **대안 방법 고려**
   - Express 서버를 별도로 배포 (Render.com 등)
   - 외부 API 서비스 사용

