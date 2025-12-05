# Netlify 배포 가이드

## 🚀 Netlify에 배포하기

### 1. Netlify에 프로젝트 연결

1. [Netlify](https://www.netlify.com/)에 로그인
2. "Add new site" → "Import an existing project" 선택
3. GitHub 저장소 연결
4. 이 저장소 선택

### 2. 빌드 설정

Netlify가 자동으로 `netlify.toml` 파일을 감지합니다.

**수동 설정이 필요한 경우:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

### 3. 환경 변수 설정 (중요!)

Netlify 대시보드에서 **Site settings → Environment variables**로 이동하여 다음 환경 변수를 추가하세요:

#### 필수 환경 변수:

```
OPENAI_API_KEY=your_openai_api_key_here
또는
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

#### 선택적 환경 변수:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_FORM_URL=https://docs.google.com/forms/d/1c37LIvsiqaRk9ivEKUvmlKgt9O83D05qtAHNxa5jWOY/formResponse
```

### 4. 배포

1. 환경 변수 설정 후 "Deploy site" 클릭
2. 자동으로 빌드 및 배포됩니다
3. 배포 완료 후 제공된 URL로 접속

### 5. 자동 배포

- GitHub에 push하면 자동으로 재배포됩니다
- `main` 또는 `master` 브랜치에 push할 때마다 자동 배포

---

## 📝 작동 방식

### 로컬 개발 환경:
```
프론트엔드 (Vite) → Express 서버 (localhost:3000)
                    → /api/analyze
                    → /api/google-forms
```

### Netlify 프로덕션 환경:
```
프론트엔드 (정적 파일) → Netlify Functions (서버리스)
                       → /.netlify/functions/analyze
                       → /.netlify/functions/google-forms
```

`netlify.toml`의 리다이렉트 설정으로 `/api/*` 요청이 자동으로 `/.netlify/functions/*`로 전달됩니다.

---

## 🔧 문제 해결

### 404 오류가 계속 발생하는 경우:

1. **환경 변수 확인**
   - Netlify 대시보드에서 `OPENAI_API_KEY` 등이 올바르게 설정되었는지 확인

2. **Functions 빌드 확인**
   - Netlify 배포 로그에서 "Functions bundling" 섹션 확인
   - `analyze` 함수와 `google-forms` 함수가 성공적으로 빌드되었는지 확인

3. **Functions 로그 확인**
   - Netlify 대시보드 → Functions → 해당 함수 선택 → Logs 확인

4. **재배포**
   - 환경 변수를 변경한 경우 수동으로 재배포 필요:
   - Deploys → Trigger deploy → Clear cache and deploy site

---

## 🆘 대안: 백엔드를 별도로 배포

Netlify Functions가 작동하지 않는 경우, Express 서버를 별도로 배포할 수 있습니다:

### Railway/Render/Heroku에 백엔드 배포:

1. `server.js`를 별도 저장소로 분리
2. Railway/Render/Heroku에 배포
3. 배포된 백엔드 URL을 환경 변수로 설정:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
4. `index.html`의 `API_BASE_URL` 코드 수정:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
       || (window.location.hostname === 'localhost' 
           ? 'http://localhost:3000' 
           : window.location.origin);
   ```

---

## ✅ 배포 체크리스트

- [ ] GitHub 저장소에 코드 push
- [ ] Netlify에 저장소 연결
- [ ] 환경 변수 설정 (`OPENAI_API_KEY` 등)
- [ ] 배포 트리거
- [ ] 배포 로그에서 Functions 빌드 확인
- [ ] 배포된 사이트에서 AI 진단 기능 테스트
- [ ] 브라우저 콘솔에서 404 오류 없는지 확인

성공적인 배포를 기원합니다! 🎉

