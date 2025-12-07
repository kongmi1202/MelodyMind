# 🔍 Netlify Functions 찾는 방법

Netlify Dashboard에서 Functions를 확인하는 방법입니다.

## 📍 Functions 탭 위치

### 방법 1: 왼쪽 사이드바에서 찾기

1. **Netlify Dashboard 접속**
   - https://app.netlify.com
   - `melodymind1` 프로젝트 선택

2. **Functions 찾기**
   - 왼쪽 사이드바를 아래로 스크롤
   - **"Functions"** 섹션 찾기
   - 또는 **"Site configuration"** 아래에 있을 수 있음

3. **Functions 클릭**
   - "Functions" 텍스트 또는 아이콘 클릭
   - Functions 목록이 표시됨

### 방법 2: URL로 직접 이동

현재 프로젝트 오버뷰 페이지(`app.netlify.com/projects/melodymind1/overview`)에서:

다음 URL로 직접 이동하세요:
```
https://app.netlify.com/sites/melodymind1/functions
```

### 방법 3: 배포 상세 페이지에서

1. **Deploys 탭** 클릭
2. 최신 배포 클릭
3. 배포 상세 페이지에서:
   - **"f Functions"** 링크 클릭
   - 또는 Functions 섹션 확인

## 📋 확인해야 할 Functions

다음 3개의 Functions가 표시되어야 합니다:

1. ✅ `analyze` - AI 분석 함수
2. ✅ `google-forms` - Google Forms 전송 함수
3. ✅ `students-data` - 학생 데이터 조회 함수 (새로 추가)

## 🐛 Functions가 보이지 않는 경우

### 문제 1: Functions가 하나도 보이지 않음

**원인:**
- Functions가 배포되지 않았음
- 빌드 과정에서 Functions가 포함되지 않음

**해결:**
1. **GitHub에 코드 푸시 확인**
   - `netlify/functions` 폴더가 GitHub에 있는지 확인
   - `netlify.toml` 파일이 있는지 확인

2. **재배포**
   - Netlify Dashboard → Deploys
   - "Trigger deploy" → "Deploy project without cache"

3. **배포 로그 확인**
   - Deploys → 최신 배포 클릭
   - "Deploy log" 탭에서 Functions 빌드 메시지 확인
   - "Functions bundling" 또는 "Packaging functions" 메시지 확인

### 문제 2: 일부 Functions만 보임

**원인:**
- 특정 Function 파일에 오류가 있을 수 있음
- 빌드 과정에서 특정 Function이 실패했을 수 있음

**해결:**
1. **배포 로그 확인**
   - Deploys → 최신 배포 → Deploy log
   - 빨간색 오류 메시지 찾기
   - Functions 빌드 오류 확인

2. **Functions 파일 확인**
   - `netlify/functions/students-data.js` 파일이 올바른지 확인
   - 문법 오류가 없는지 확인

### 문제 3: students-data Function이 보이지 않음

**원인:**
- 파일이 GitHub에 푸시되지 않았을 수 있음
- 파일 이름이나 경로가 잘못되었을 수 있음

**해결:**
1. **파일 확인**
   - `netlify/functions/students-data.js` 파일이 존재하는지 확인
   - GitHub 저장소에서 파일 확인

2. **파일 이름 확인**
   - 파일 이름이 정확히 `students-data.js`인지 확인 (하이픈 사용)
   - 대소문자 정확히 확인

3. **재배포**
   - 파일을 GitHub에 푸시
   - Netlify에서 자동 재배포 대기
   - 또는 수동 재배포

## ✅ Functions가 정상적으로 보이는 경우

Functions 탭에서 3개의 Functions가 보이면:

1. **각 Function 클릭**
   - Function 상세 페이지 열기

2. **Logs 탭 확인**
   - Function이 호출될 때 로그 확인
   - 오류 메시지 확인

3. **테스트**
   - 배포된 웹앱에서 비교 분석 페이지 열기
   - Functions 로그에서 호출 여부 확인

## 🔗 빠른 링크

- **Functions 페이지 직접 이동:**
  ```
  https://app.netlify.com/sites/melodymind1/functions
  ```

- **배포 로그 확인:**
  ```
  https://app.netlify.com/sites/melodymind1/deploys
  ```

## 📝 참고

- Functions는 코드를 GitHub에 푸시하고 Netlify가 배포한 후에만 나타납니다
- Functions 탭은 배포가 완료된 후에만 활성화됩니다
- Functions가 보이지 않으면 배포 로그를 먼저 확인하세요

