import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 정적 파일 서빙 (index.html 등)

// OpenAI GPT API 프록시 엔드포인트
app.post('/api/analyze', async (req, res) => {
    try {
        const { systemInstruction, userPrompt, jsonOutput } = req.body;
        
        // VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY 둘 다 지원
        const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.' });
        }

        const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

        const messages = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
        ];

        const payload = {
            model: 'gpt-4o', // 또는 gpt-4, gpt-3.5-turbo
            messages: messages,
            temperature: 0.7,
            ...(jsonOutput && {
                response_format: { type: "json_object" }
            })
        };

        // Retry logic with exponential backoff
        let lastError;
        for (let i = 0; i < 5; i++) {
            try {
                const response = await fetch(OPENAI_API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
                }

                const result = await response.json();
                const aiResponse = result.choices?.[0]?.message?.content || "AI 분석에 실패했습니다.";
                
                // 디버깅: AI 응답 로깅
                console.log('OpenAI API Response:', aiResponse.substring(0, 500));
                
                return res.json({ result: aiResponse });
            } catch (error) {
                lastError = error;
                if (i < 4) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.', details: error.message });
    }
});

// Google Forms 데이터 수신 엔드포인트 (entry code 연동용)
app.post('/api/google-forms', async (req, res) => {
    try {
        const formData = req.body;
        
        console.log('📝 Google Forms 데이터 수신:', formData);

        // Google Forms entry code를 사용한 데이터 매핑
        // 나중에 entry code를 받으면 이 부분을 수정합니다
        const mappedData = {
            // 예시: entry.123456789: formData.entry_123456789
            // 실제 entry code를 받으면 여기에 매핑 로직 추가
        };

        // TODO: Google Forms로 데이터 전송 (entry code 필요)
        // const formUrl = process.env.GOOGLE_FORM_URL;
        // const response = await fetch(formUrl, {
        //     method: 'POST',
        //     body: new URLSearchParams(mappedData)
        // });

        res.json({ 
            success: true, 
            message: 'Google Forms 연동 준비 완료. entry code를 설정해주세요.',
            receivedData: formData
        });

    } catch (error) {
        console.error('Google Forms Error:', error);
        res.status(500).json({ error: 'Google Forms 전송 중 오류가 발생했습니다.' });
    }
});

// 건강 체크 엔드포인트
app.get('/api/health', (req, res) => {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    res.json({ 
        status: 'OK', 
        openaiApiKeySet: !!apiKey,
        googleFormUrlSet: !!process.env.GOOGLE_FORM_URL
    });
});

app.listen(PORT, () => {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📝 OpenAI API Key 설정: ${apiKey ? '✅' : '❌'}`);
    console.log(`📋 Google Form URL 설정: ${process.env.GOOGLE_FORM_URL ? '✅' : '❌'}`);
});

