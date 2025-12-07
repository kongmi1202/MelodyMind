# 🔧 students-data Function 문제 해결 가이드

## 현재 상황

- ✅ Functions 페이지에서 `students-data` 함수가 보임 (방금 배포됨)
- ❌ 여전히 "Cannot use import statement outside a module" 오류 발생
- ✅ 다른 Functions(`analyze`, `google-forms`)는 같은 구조로 작동

## 확인 사항

### 1. Functions 로그 확인

1. **Netlify Dashboard → Functions → `students-data` 클릭**
2. **Logs 탭 확인**
   - 오류 메시지 확인
   - 빌드 관련 오류 확인

### 2. 배포 로그 확인

1. **Netlify Dashboard → Deploys → 최신 배포 클릭**
2. **Deploy log 탭 확인**
   - "Functions bundling" 메시지 확인
   - `students-data` 함수 빌드 오류 확인

### 3. 캐시 지우고 재배포

1. **Netlify Dashboard → Deploys**
2. **"Trigger deploy" 클릭**
3. **"Deploy project without cache" 선택**
4. 배포 완료 대기 (2-3분)

## 가능한 해결 방법

### 방법 1: 파일명 변경

파일명에 하이픈이 문제일 수 있습니다. `google-forms`도 하이픈이 있지만, 특정 파일만 문제가 될 수 있습니다.

### 방법 2: Functions 디렉토리 확인

`netlify/functions` 디렉토리에 실제로 파일이 있는지 확인:

```
netlify/functions/
  - analyze.js ✅
  - google-forms.js ✅
  - students-data.js ✅
```

### 방법 3: 배포 설정 확인

`netlify.toml` 파일 확인:
- `functions = "netlify/functions"` 설정 확인
- `node_bundler = "esbuild"` 설정 확인

### 방법 4: 환경 변수 확인

Netlify Dashboard → Site settings → Environment variables:
- `GOOGLE_SHEETS_ID` 확인
- `GOOGLE_API_KEY` 확인

## 다음 단계

1. Functions 로그 확인
2. 배포 로그 확인
3. 캐시 지우고 재배포
4. 여전히 문제가 있으면 파일명 변경 시도

