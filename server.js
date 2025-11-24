import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// YouTube Data API를 사용하여 동영상 정보 가져오기
async function getYouTubeVideoInfo(videoUrl) {
    try {
        // YouTube URL에서 video ID 추출
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (!videoIdMatch) {
            return null;
        }
        const videoId = videoIdMatch[1];
        
        // YouTube Data API 키 확인
        const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
        if (!youtubeApiKey) {
            console.warn('⚠️ YouTube API Key가 설정되지 않았습니다. .env 파일에 YOUTUBE_API_KEY를 추가하세요.');
            return null;
        }
        
        // YouTube Data API 호출
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`;
        const response = await fetch(youtubeApiUrl);
        
        if (!response.ok) {
            console.error('YouTube API Error:', response.status, response.statusText);
            return null;
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            return null;
        }
        
        const video = data.items[0];
        return {
            title: video.snippet.title,
            description: video.snippet.description,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            tags: video.snippet.tags || []
        };
    } catch (error) {
        console.error('YouTube API 호출 오류:', error);
        return null;
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 정적 파일 서빙 (index.html 등)

// YouTube 정보 조회 엔드포인트
app.post('/api/youtube-info', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl) {
            return res.status(400).json({ error: 'videoUrl이 필요합니다.' });
        }
        
        const videoInfo = await getYouTubeVideoInfo(videoUrl);
        if (!videoInfo) {
            return res.status(404).json({ error: 'YouTube 동영상 정보를 가져올 수 없습니다.' });
        }
        
        res.json({ videoInfo });
    } catch (error) {
        console.error('YouTube Info Error:', error);
        res.status(500).json({ error: 'YouTube 정보 조회 중 오류가 발생했습니다.', details: error.message });
    }
});

// OpenAI GPT API 프록시 엔드포인트
app.post('/api/analyze', async (req, res) => {
    try {
        const { systemInstruction, userPrompt, jsonOutput, youtubeUrl } = req.body;
        
        // YouTube URL이 제공된 경우, 동영상 정보를 먼저 가져옴
        let youtubeInfo = null;
        if (youtubeUrl) {
            youtubeInfo = await getYouTubeVideoInfo(youtubeUrl);
            if (youtubeInfo) {
                console.log('📺 YouTube 정보:', youtubeInfo.title);
            }
        }
        
        // VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY 둘 다 지원
        const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.' });
        }

        const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

        // YouTube 정보가 있으면 userPrompt에 구조화하여 추가
        let enhancedUserPrompt = userPrompt;
        if (youtubeInfo) {
            enhancedUserPrompt = `
--- [YouTube Data API로 가져온 정확한 동영상 정보] ---
동영상 제목: ${youtubeInfo.title}
채널명: ${youtubeInfo.channelTitle}
게시일: ${youtubeInfo.publishedAt}
태그: ${youtubeInfo.tags.join(', ') || '없음'}
설명:
${youtubeInfo.description}

**중요 지시사항**:
1. 위 YouTube 정보에서 작곡가, 악곡 제목, 연주자 정보를 추출하세요.
2. 이 정보를 바탕으로 자신의 학습된 지식을 활용하여 해당 악곡의 객관적인 음악 정보를 제공하세요.
3. YouTube 정보와 학습된 지식이 충돌하는 경우, YouTube 정보를 우선하세요.

--- [원본 사용자 입력] ---
${userPrompt}
            `;
        }

        const messages = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: enhancedUserPrompt }
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
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    res.json({ 
        status: 'OK', 
        openaiApiKeySet: !!apiKey,
        youtubeApiKeySet: !!youtubeApiKey,
        googleFormUrlSet: !!process.env.GOOGLE_FORM_URL
    });
});

app.listen(PORT, () => {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📝 OpenAI API Key 설정: ${apiKey ? '✅' : '❌'}`);
    console.log(`📺 YouTube API Key 설정: ${youtubeApiKey ? '✅' : '❌'}`);
    console.log(`📋 Google Form URL 설정: ${process.env.GOOGLE_FORM_URL ? '✅' : '❌'}`);
});

