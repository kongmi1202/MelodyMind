// Netlify Serverless Function
import fetch from 'node-fetch';

// YouTube Data API를 사용하여 동영상 정보 가져오기
async function getYouTubeVideoInfo(videoUrl) {
    try {
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (!videoIdMatch) {
            return null;
        }
        const videoId = videoIdMatch[1];
        
        const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
        if (!youtubeApiKey) {
            console.warn('⚠️ YouTube API Key가 설정되지 않았습니다.');
            return null;
        }
        
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`;
        const response = await fetch(youtubeApiUrl);
        
        if (!response.ok) {
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

export default async (req, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers }
        );
    }

    try {
        const { systemInstruction, userPrompt, jsonOutput, youtubeUrl } = await req.json();
        
        // YouTube 정보 가져오기
        let youtubeInfo = null;
        let youtubeInfoError = null;
        if (youtubeUrl) {
            const result = await getYouTubeVideoInfo(youtubeUrl);
            if (result && result.title) {
                youtubeInfo = result;
            }
        }

        // OpenAI API 호출
        const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }),
                { status: 500, headers }
            );
        }

        // YouTube 정보를 프롬프트에 추가
        let enhancedUserPrompt = userPrompt;
        if (youtubeInfo) {
            enhancedUserPrompt = `
--- [YouTube Data API로 가져온 동영상 정보 (참고용)] ---
⚠️ **중요**: 아래 YouTube 정보는 **참고 자료**일 뿐입니다. 이 정보를 그대로 믿지 말고, 반드시 자신의 학습된 지식과 검색 능력을 활용하여 **정확한 악곡 정보를 확정**하세요.

동영상 제목: ${youtubeInfo.title}
채널명 (보통 연주자/가수): ${youtubeInfo.channelTitle}
게시일: ${youtubeInfo.publishedAt}
태그: ${youtubeInfo.tags.join(', ') || '없음'}
설명:
${youtubeInfo.description}

**필수 작업**:
1. 위 YouTube 정보에서 악곡 제목, 작곡가, 연주자 정보를 **단서**로 추출하세요:
   - 동영상 제목에서 악곡 제목과 작곡가를 추출 (예: "베토벤 - 월광 소나타" → 작곡가: 베토벤, 제목: 월광 소나타)
   - 채널명은 보통 **연주자/가수** 정보입니다 (예: "ALLDAY PROJECT" → 연주자: ALLDAY PROJECT)
2. **이 단서를 바탕으로 자신의 학습된 지식과 검색 능력을 활용**하여 해당 악곡의 **정확한 정보**를 확정하세요.
3. YouTube 정보가 잘못되었거나 불일치하는 경우, **학습된 지식과 검색 결과를 우선**하세요.
4. 확정한 정확한 정보를 학생이 입력한 정보와 비교할 때:
   - **악곡 제목과 작곡가**를 비교하세요 (가장 중요)
   - **연주자/가수**는 참고만 하세요 (다른 연주 버전일 수 있으므로)
   - 채널명(연주자)과 학생이 입력한 **작곡가**를 비교하지 마세요
5. 확정한 정확한 정보를 기준으로 학생의 감상문을 평가하세요.

--- [원본 사용자 입력] ---
${userPrompt}
            `;
        }

        const messages = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: enhancedUserPrompt }
        ];

        const payload = {
            model: 'gpt-4o',
            messages: messages,
            temperature: 0.7,
            ...(jsonOutput && {
                response_format: { type: "json_object" }
            })
        };

        // Retry logic
        let lastError;
        for (let i = 0; i < 5; i++) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                
                return new Response(
                    JSON.stringify({ result: aiResponse }),
                    { status: 200, headers }
                );
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
        return new Response(
            JSON.stringify({ 
                error: 'AI 분석 중 오류가 발생했습니다.', 
                details: error.message 
            }),
            { status: 500, headers }
        );
    }
};

export const config = {
    path: "/api/analyze"
};

