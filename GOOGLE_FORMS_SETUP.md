# 📝 Google Forms Entry Code 설정 가이드

이 파일은 Google Forms 연동을 위한 **Entry Code** 찾는 방법과 설정 방법을 안내합니다.

## 🎯 1단계: Google Forms 양식 만들기

### 필요한 질문 필드 (총 20개)

Google Forms에서 다음 질문들을 **단답형** 또는 **장문형**으로 추가하세요:

#### 기본 정보 (5개)
1. **사용자 ID** (단답형)
2. **제출 시간** (단답형)
3. **악곡 제목** (단답형)
4. **유튜브 URL** (단답형)
5. **작곡가** (단답형)

#### 악곡 정보 (4개)
6. **연주자/가수** (단답형)
7. **음악 장르** (단답형)
8. **연주 형태** (단답형)
9. **감성 키워드** (단답형)

#### 감상 내용 (5개)
10. **감각적 감상 텍스트** (장문형)
11. **선택한 색상** (단답형)
12. **기술(소리) 관찰** (장문형)
13. **분석(패턴) 파악** (장문형)
14. **해석(의미) 추론** (장문형)

#### 평가 및 피드백 (6개)
15. **평가(가치) 판단** (장문형)
16. **AI 피드백 입력** (장문형)
17. **AI 잘된 점** (장문형)
18. **AI 보완할 점** (장문형)
19. **AI 심화 질문** (장문형)
20. **최종 감상문** (장문형)

#### AI 점수 (3개)
21. **감각적 민감도 점수** (단답형)
22. **분석적 이해도 점수** (단답형)
23. **심미적 통찰력 점수** (단답형)

#### 활용 전략 (3개)
24. **연주 전략** (장문형)
25. **감상 전략** (장문형)
26. **창작 전략** (장문형)

---

## 🔍 2단계: Entry Code 찾기

### 방법 1: 개발자 도구 사용 (권장)

1. Google Forms 양식을 엽니다
2. **F12** 키를 눌러 개발자 도구를 엽니다
3. **Network** (네트워크) 탭을 선택합니다
4. 양식에 아무 값이나 입력하고 **제출**을 클릭합니다
5. Network 탭에서 `formResponse` 요청을 찾습니다
6. 요청 내용(Payload)을 확인하면 다음과 같은 형식을 볼 수 있습니다:

```
entry.1234567890=테스트값
entry.2345678901=테스트값2
entry.3456789012=테스트값3
...
```

7. 각 질문의 **entry 번호**를 메모합니다

### 방법 2: 양식 HTML 소스 보기

1. Google Forms 양식을 엽니다
2. 페이지에서 **마우스 오른쪽 클릭** → **페이지 소스 보기**
3. `Ctrl+F`로 "entry." 검색
4. 각 질문의 `entry.XXXXXXXXX` 형식의 코드를 찾습니다

---

## ⚙️ 3단계: server.js에 Entry Code 설정

`server.js` 파일의 **83번 줄 근처**에서 다음 부분을 수정하세요:

### 현재 코드 (기본값):

```javascript
// Google Forms entry code를 사용한 데이터 매핑
// 나중에 entry code를 받으면 이 부분을 수정합니다
const mappedData = {
    // 예시: entry.123456789: formData.entry_123456789
    // 실제 entry code를 받으면 여기에 매핑 로직 추가
};
```

### 수정 후 코드 (예시):

```javascript
const mappedData = {
    // 기본 정보
    'entry.1234567890': formData.userId,           // 사용자 ID
    'entry.2345678901': formData.timestamp,        // 제출 시간
    'entry.3456789012': formData.title,            // 악곡 제목
    'entry.4567890123': formData.url,              // 유튜브 URL
    'entry.5678901234': formData.composer,         // 작곡가
    
    // 악곡 정보
    'entry.6789012345': formData.artist,           // 연주자/가수
    'entry.7890123456': formData.musicGenre,       // 음악 장르
    'entry.8901234567': formData.ensembleType1,    // 연주 형태
    'entry.9012345678': formData.senseKeywords,    // 감성 키워드
    
    // 감상 내용
    'entry.0123456789': formData.senseText,        // 감각적 감상
    'entry.1234567891': formData.senseColor,       // 선택한 색상
    'entry.2345678902': formData.tech,             // 기술(소리)
    'entry.3456789013': formData.analysis,         // 분석(패턴)
    'entry.4567890124': formData.interpretation,   // 해석(의미)
    
    // 평가 및 피드백
    'entry.5678901235': formData.evaluation,       // 평가(가치)
    'entry.6789012346': formData.feedbackInput,    // AI 피드백 입력
    'entry.7890123457': formData.goodPoints,       // AI 잘된 점
    'entry.8901234568': formData.badPoints,        // AI 보완할 점
    'entry.9012345679': formData.structuredQuestion, // AI 심화 질문
    'entry.0123456780': formData.finalAppreciation, // 최종 감상문
    
    // AI 점수
    'entry.1234567892': formData.senseScore,       // 감각적 민감도
    'entry.2345678903': formData.analysisScore,    // 분석적 이해도
    'entry.3456789014': formData.aestheticScore,   // 심미적 통찰력
    
    // 활용 전략
    'entry.4567890125': formData.performanceStrategy,   // 연주 전략
    'entry.5678901236': formData.appreciationStrategy,  // 감상 전략
    'entry.6789012347': formData.compositionStrategy    // 창작 전략
};
```

> ⚠️ **중요**: 위의 `entry.XXXXXXXXX` 번호들은 **예시**입니다. 
> 실제 Google Forms에서 찾은 번호로 교체해야 합니다!

---

## 🚀 4단계: Google Forms 전송 활성화

`server.js` 파일의 **88-92번 줄 근처**에서 주석을 해제하세요:

### 현재 (주석 처리됨):

```javascript
// TODO: Google Forms로 데이터 전송 (entry code 필요)
// const formUrl = process.env.GOOGLE_FORM_URL;
// const response = await fetch(formUrl, {
//     method: 'POST',
//     body: new URLSearchParams(mappedData)
// });
```

### 수정 후 (주석 제거):

```javascript
// Google Forms로 데이터 전송
const formUrl = process.env.GOOGLE_FORM_URL;
const response = await fetch(formUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(mappedData)
});

if (!response.ok) {
    throw new Error(`Google Forms 전송 실패: ${response.status}`);
}

console.log('✅ Google Forms 전송 성공!');
```

---

## 🔐 5단계: .env 파일에 Form URL 추가

`.env` 파일에 Google Forms의 **formResponse URL**을 추가하세요:

```env
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse
```

### Form URL 찾는 방법:

1. Google Forms 양식 편집 화면에서 **보내기** 버튼 클릭
2. 링크 아이콘을 클릭하여 양식 링크 복사
3. 링크의 `/viewform` 부분을 `/formResponse`로 변경

**예시:**
- 원본: `https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform`
- 변경: `https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse`

---

## ✅ 6단계: 테스트

1. 서버를 재시작하세요:
   ```bash
   npm start
   ```

2. 웹 앱에서 전체 프로세스를 완료하세요

3. Google Forms 응답 탭에서 데이터가 정상적으로 수신되었는지 확인하세요

---

## 📧 Entry Code 알려주기

이 파일을 참고하여 Google Forms를 만드신 후, 
다음 형식으로 Entry Code를 알려주시면 `server.js` 파일을 업데이트해드리겠습니다:

```
사용자 ID: entry.1234567890
제출 시간: entry.2345678901
악곡 제목: entry.3456789012
...
```

또는 전체 매핑 객체를 복사해서 보내주셔도 됩니다!

---

**도움이 필요하면 언제든 말씀해주세요!** 🎵

