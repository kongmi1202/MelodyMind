# 🎵 소리 성찰실 (MelodyMind)

음악 감상 교육을 위한 AI 기반 5단계 비평 구조 웹 애플리케이션

## ✨ 주요 기능

- **5단계 음악 감상 프로세스**: 반응 → 기술 → 분석 → 해석 → 평가
- **AI 기반 피드백**: OpenAI GPT API를 활용한 감상문 분석
- **3D 시각화**: Three.js를 이용한 감상 능력 지표 시각화
- **Google Forms 연동**: 감상 데이터 자동 수집
- **실시간 분석**: 논리적/음악적 근거 제시 여부 진단

## 📋 사전 요구사항

- Node.js 16.x 이상
- OpenAI API Key ([발급 방법](https://platform.openai.com/api-keys))
- (선택) Google Forms Entry Code

## 🚀 로컬 개발 환경 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 입력하세요:

```env
# OpenAI API Key (필수)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# YouTube API Key (선택)
YOUTUBE_API_KEY=AIzaxxxxxxxxxxxxxxxx

# Google Form URL (선택)
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse

# 서버 포트 (기본값: 3000)
PORT=3000
```

### 3. 서버 실행

```bash
npm start
```

또는

```bash
npm run server
```

### 4. 브라우저에서 접속

```
http://localhost:3000
```

---

## 🌐 프로덕션 배포

로컬에서는 정상 작동하지만 Netlify/Vercel 같은 정적 호스팅에서는 백엔드(`server.js`)가 실행되지 않습니다.

**해결책**: 프론트엔드와 백엔드를 분리하여 배포

📖 **상세 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참조

### 간단 요약

1. **백엔드 배포** (Render.com 무료)
   - Render.com에서 Web Service 생성
   - 환경 변수 설정
   - 배포 후 URL 받기: `https://melodymind-backend.onrender.com`

2. **프론트엔드 배포** (Netlify 무료)
   - `index.html`에서 백엔드 URL 수정
   - Netlify에 GitHub 저장소 연결
   - 자동 배포

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 확인하세요.

## 🔧 Google Forms 연동 설정

### Entry Code 찾는 방법

1. Google Forms에서 새 양식 만들기
2. 필요한 질문 필드 추가 (아래 참조)
3. 양식을 열고 F12 (개발자 도구) 열기
4. Network 탭에서 양식 제출 시 `formResponse` 요청 확인
5. `entry.XXXXXXXXX` 형식의 필드명 찾기

### 권장 Google Forms 필드 구조

| 질문 | Entry Code | 설명 |
|------|------------|------|
| 사용자 ID | `entry.123456789` | 자동 생성된 사용자 ID |
| 타임스탬프 | `entry.234567890` | 제출 시간 |
| 악곡 제목 | `entry.345678901` | 감상한 곡 제목 |
| 유튜브 URL | `entry.456789012` | 음악 링크 |
| 감성 키워드 | `entry.567890123` | 선택한 키워드들 |
| 감각적 감상 | `entry.678901234` | 1단계 텍스트 |
| 기술 (소리) | `entry.789012345` | 2단계 - 기술 |
| 분석 (패턴) | `entry.890123456` | 3단계 - 분석 |
| 해석 (의미) | `entry.901234567` | 4단계 - 해석 |
| 평가 (가치) | `entry.012345678` | 5단계 - 평가 |
| 감각적 민감도 점수 | `entry.123456780` | AI 분석 점수 |
| 분석적 이해도 점수 | `entry.234567801` | AI 분석 점수 |
| 심미적 통찰력 점수 | `entry.345678012` | AI 분석 점수 |
| 최종 감상문 | `entry.456789023` | AI가 생성한 최종 감상문 |

### Entry Code 설정하기

Entry Code를 찾은 후 `server.js` 파일의 `/api/google-forms` 엔드포인트를 수정하세요:

```javascript
// server.js의 83번 줄 근처
const mappedData = {
    'entry.123456789': formData.userId,
    'entry.234567890': formData.timestamp,
    'entry.345678901': formData.title,
    'entry.456789012': formData.url,
    // ... 나머지 필드 매핑
};
```

그리고 실제 Google Forms로 전송하도록 주석을 해제하세요:

```javascript
// server.js의 88-92번 줄 근처
const formUrl = process.env.GOOGLE_FORM_URL;
const response = await fetch(formUrl, {
    method: 'POST',
    body: new URLSearchParams(mappedData)
});
```

## 📁 프로젝트 구조

```
MelodyMind/
├── index.html          # 프론트엔드 (단일 HTML 파일)
├── server.js           # Node.js 백엔드 서버
├── package.json        # 프로젝트 설정
├── .env                # 환경 변수 (직접 생성)
├── .gitignore          # Git 제외 파일
└── README.md           # 이 파일
```

## 🎯 사용 흐름

1. **1단계 (반응)**: 악곡 정보 입력 + 감각적 감상 (키워드, 색상, 텍스트)
2. **2단계 (기술/분석)**: 객관적 소리 관찰 + 패턴 파악
3. **3단계 (해석/평가)**: 의미 추론 + 가치 판단
4. **AI 진단**: Gemini가 감상문 분석 및 피드백 제공
5. **보완 단계**: AI의 질문에 답변하여 감상문 개선
6. **최종 결과**: 
   - 3D 시각화된 감상 능력 지표
   - 보완된 최종 감상문
   - 미래 활동 연계 전략 (연주/감상/창작)
   - Google Forms로 자동 제출

## 🔐 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- OpenAI API Key는 외부에 노출되지 않도록 주의하세요
- 프로덕션 환경에서는 HTTPS를 사용하세요

## 🐛 문제 해결

### API 키가 설정되지 않았다는 오류
- `.env` 파일에 `OPENAI_API_KEY`가 올바르게 입력되었는지 확인
- API 키 형식: `sk-proj-` 또는 `sk-`로 시작
- 서버를 재시작하세요 (`Ctrl+C` 후 `npm start`)
- 상태 확인: `http://localhost:3000/api/health`

### CORS 오류
- 서버를 통해 접속하세요 (파일을 직접 열지 마세요)
- `http://localhost:3000`으로 접속

### Google Forms 전송 실패
- Entry Code가 올바르게 매핑되었는지 확인
- `GOOGLE_FORM_URL`이 `.env`에 설정되었는지 확인
- `server.js`에서 전송 코드 주석이 해제되었는지 확인

## 📝 라이센스

이 프로젝트는 교육 목적으로 사용됩니다.

## 🤝 기여

버그 리포트나 기능 제안은 Issues에 등록해주세요.

---

**Made with ❤️ for Music Education**

