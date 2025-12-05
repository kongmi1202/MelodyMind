# MelodyMind 배포 가이드

## 🌐 배포 구조

이 프로젝트는 **프론트엔드**(Netlify)와 **백엔드**(Render.com)를 분리하여 배포합니다.

```
┌─────────────────┐         ┌──────────────────┐
│   Netlify       │  HTTP   │   Render.com     │
│  (Frontend)     │ ──────> │   (Backend)      │
│  index.html     │         │   server.js      │
└─────────────────┘         └──────────────────┘
```

---

## 📦 백엔드 배포 (Render.com)

### 1. Render.com 계정 생성
https://render.com 에서 GitHub 계정으로 가입

### 2. 새 Web Service 생성
1. Dashboard → **"New +"** → **"Web Service"**
2. GitHub 저장소 연결 (MelodyMind)
3. 다음 설정 입력:

| 설정 | 값 |
|------|-----|
| **Name** | `melodymind-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | `Free` |

### 3. 환경 변수 설정
**Environment** 탭에서 다음 변수 추가:

```
OPENAI_API_KEY=sk-xxx...
YOUTUBE_API_KEY=AIzaXXX...
GOOGLE_FORM_URL=https://docs.google.com/forms/d/xxx/formResponse
PORT=3000
```

### 4. Deploy 실행
- **"Manual Deploy" → "Deploy latest commit"** 클릭
- 배포 완료 후 URL 확인: `https://melodymind-backend.onrender.com`

---

## 🌍 프론트엔드 배포 (Netlify)

### 1. index.html 수정
백엔드 URL을 업데이트:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://melodymind-backend.onrender.com'; // ⚠️ 실제 Render URL로 변경!
```

### 2. Netlify에 배포
1. https://app.netlify.com 에서 GitHub 계정으로 가입
2. **"Add new site" → "Import an existing project"**
3. GitHub 저장소 연결
4. 다음 설정:

| 설정 | 값 |
|------|-----|
| **Build command** | (비워둠) |
| **Publish directory** | `.` |

5. **Deploy site** 클릭

### 3. 배포 확인
- Netlify URL 접속: `https://your-app.netlify.app`
- AI 진단 기능 테스트

---

## ⚠️ 주의사항

### 1. Render.com Free Plan 제한
- **첫 요청이 느릴 수 있음** (Cold Start 약 1분)
- 15분 동안 요청이 없으면 서버가 Sleep 상태로 전환
- 다음 요청 시 다시 Wake up (약 50초 소요)

**해결책**: Render.com의 Paid Plan 사용 또는 Railway.app/Fly.io 사용

### 2. CORS 오류가 발생하면
`server.js`에서 CORS 설정 확인:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-app.netlify.app'],
  credentials: true
}));
```

### 3. 환경 변수 노출 방지
- `.env` 파일을 절대 GitHub에 올리지 마세요
- `.gitignore`에 `.env` 추가 확인

---

## 🔄 업데이트 방법

### 백엔드 업데이트
1. GitHub에 코드 push
2. Render.com이 자동으로 재배포

### 프론트엔드 업데이트
1. GitHub에 코드 push
2. Netlify가 자동으로 재배포

---

## 🆘 문제 해결

### 404 에러 (API 호출 실패)
- Render.com 백엔드가 Sleep 상태일 수 있음 → 1분 대기 후 재시도
- `index.html`의 `API_BASE_URL`이 올바른지 확인

### CORS 에러
- Render.com 백엔드에서 Netlify 도메인 허용 확인
- `server.js`의 `cors()` 설정 확인

### 환경 변수 오류
- Render.com Dashboard → Environment 탭에서 변수 확인
- OpenAI API Key, YouTube API Key 유효성 확인

---

## 📚 참고 링크

- Render.com 문서: https://render.com/docs
- Netlify 문서: https://docs.netlify.com
- Express.js CORS: https://expressjs.com/en/resources/middleware/cors.html

