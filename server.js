import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터 파일 경로
const STUDENTS_DATA_FILE = path.join(__dirname, 'students-data.json');

// 데이터 파일 초기화 함수
function ensureDataFile() {
    if (!fs.existsSync(STUDENTS_DATA_FILE)) {
        fs.writeFileSync(STUDENTS_DATA_FILE, JSON.stringify([], null, 2), 'utf8');
        console.log('📁 학생 데이터 파일 생성:', STUDENTS_DATA_FILE);
    }
}

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
        console.log('🌐 YouTube API 호출:', `videoId=${videoId}`);
        
        const response = await fetch(youtubeApiUrl);
        console.log('📡 YouTube API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || errorData.message || response.statusText;
            const errorReason = errorData.error?.reason || '';
            
            console.error('❌ YouTube API 에러 상세:', {
                status: response.status,
                statusText: response.statusText,
                reason: errorReason,
                message: errorMessage,
                fullError: errorData
            });
            
            // 할당량 초과 에러 확인
            if (response.status === 403) {
                if (errorReason === 'quotaExceeded' || errorReason === 'dailyLimitExceeded' || 
                    errorMessage.includes('quota') || errorMessage.includes('quotaExceeded') || 
                    errorMessage.includes('dailyLimitExceeded') || errorMessage.includes('quota')) {
                    console.error('❌ YouTube API 할당량 초과:', errorMessage);
                    console.error('💡 Google Cloud Console에서 할당량을 확인하거나, API 키를 추가로 생성하세요.');
                    return { error: 'quotaExceeded', message: errorMessage };
                } else if (errorMessage.includes('API key not valid') || errorMessage.includes('keyInvalid') || errorReason === 'keyInvalid') {
                    console.error('❌ YouTube API 키가 유효하지 않습니다:', errorMessage);
                } else {
                    console.error('❌ YouTube API 접근 거부 (403):', errorMessage, 'Reason:', errorReason);
                }
            } else {
                console.error('❌ YouTube API Error:', response.status, response.statusText, errorMessage);
            }
            return null;
        }
        
        const data = await response.json();
        console.log('📦 YouTube API 응답 데이터:', {
            itemsCount: data.items?.length || 0,
            hasItems: !!data.items && data.items.length > 0
        });
        
        if (!data.items || data.items.length === 0) {
            console.warn('⚠️ YouTube 동영상을 찾을 수 없습니다. (videoId:', videoId, ')');
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
        let youtubeInfoError = null;
        let youtubeQuotaExceeded = false;
        if (youtubeUrl) {
            console.log('🔍 YouTube URL 수신:', youtubeUrl);
            const result = await getYouTubeVideoInfo(youtubeUrl);
            console.log('📥 YouTube API 응답:', result ? '성공' : '실패', result);
            
            if (result && typeof result === 'object' && result.error === 'quotaExceeded') {
                youtubeQuotaExceeded = true;
                youtubeInfoError = 'YouTube API 할당량이 초과되었습니다. Google Cloud Console에서 할당량을 확인하세요.';
                console.error('❌', youtubeInfoError);
            } else if (result && result.title) {
                youtubeInfo = result;
                console.log('✅ YouTube 정보 성공적으로 가져옴:', youtubeInfo.title);
                console.log('   - 채널:', youtubeInfo.channelTitle);
                console.log('   - 태그:', youtubeInfo.tags?.length || 0, '개');
            } else {
                const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
                if (!youtubeApiKey) {
                    youtubeInfoError = 'YouTube API Key가 설정되지 않았습니다.';
                    console.warn('⚠️', youtubeInfoError);
                } else {
                    youtubeInfoError = 'YouTube 동영상 정보를 가져올 수 없습니다. (API 호출 실패 또는 잘못된 URL)';
                    console.warn('⚠️', youtubeInfoError, 'URL:', youtubeUrl);
                }
            }
        } else {
            console.log('ℹ️ YouTube URL이 제공되지 않았습니다.');
        }

        // VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY 둘 다 지원
        const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.' });
        }

        const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

        // YouTube 정보가 있으면 userPrompt에 구조화하여 추가
        let enhancedUserPrompt = userPrompt;
        console.log('📝 OpenAI 프롬프트 준비 중...');
        if (youtubeInfo) {
            console.log('✅ YouTube 정보를 OpenAI 프롬프트에 포함');
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
            console.log('📋 YouTube 정보 포함된 프롬프트 길이:', enhancedUserPrompt.length, '자');
        } else if (youtubeUrl && youtubeInfoError) {
            console.log('⚠️ YouTube 정보 없이 OpenAI 프롬프트 전송 (에러:', youtubeInfoError, ')');
            // YouTube 정보를 가져올 수 없을 때
            const quotaMessage = youtubeQuotaExceeded 
                ? '\n\n⚠️ **참고**: YouTube API 할당량이 초과되어 동영상 정보를 가져올 수 없었습니다. 학생이 입력한 정보를 기반으로 평가하세요.'
                : '';
            
            enhancedUserPrompt = `
--- [YouTube 정보 가져오기 실패] ---
⚠️ **중요**: YouTube 동영상 정보를 가져올 수 없었습니다. (${youtubeInfoError})${quotaMessage}
따라서 학생이 입력한 악곡 정보를 기반으로, **자신의 학습된 지식과 검색 능력을 활용**하여 해당 악곡의 **정확한 정보**를 확정하세요.

**필수 작업**:
1. 학생이 입력한 악곡 제목, 작곡가, 연주자 정보를 **단서**로 사용하세요.
2. **이 단서를 바탕으로 자신의 학습된 지식과 검색 능력을 활용**하여 해당 악곡의 **정확한 정보**를 확정하세요.
3. 확정한 정확한 정보를 기준으로 학생의 감상문을 평가하세요.
4. **"실제 악곡: 확인 불가"라고 표시하지 마세요.** 학습된 지식을 활용하여 가능한 한 정확한 정보를 확정하세요.

--- [원본 사용자 입력] ---
${userPrompt}
            `;
        }

        const messages = [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: enhancedUserPrompt }
        ];
        
        console.log('🤖 OpenAI API 호출 준비 완료');
        console.log('   - System instruction 길이:', systemInstruction.length, '자');
        console.log('   - User prompt 길이:', enhancedUserPrompt.length, '자');
        console.log('   - YouTube 정보 포함:', youtubeInfo ? '✅' : '❌');

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
                console.log('✅ OpenAI API 호출 성공');
                console.log('   - 응답 길이:', aiResponse.length, '자');
                console.log('   - 응답 미리보기:', aiResponse.substring(0, 200), '...');
                
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

// Google Forms 데이터 수신 및 전송 엔드포인트
app.post('/api/google-forms', async (req, res) => {
    try {
        const formData = req.body;
        
        console.log('📝 Google Forms 데이터 수신:', Object.keys(formData));

        // Google Forms URL
        const formUrl = process.env.GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/1c37LIvsiqaRk9ivEKUvmlKgt9O83D05qtAHNxa5jWOY/formResponse';

        // Entry point 매핑
        const mappedData = {
            'entry.514455809': formData.studentId || '', // 학번
            'entry.1927164281': formData.studentName || '', // 이름
            'entry.759135577': formData.url || '', // 유튜브 링크
            'entry.651308062': formData.title || '', // 악곡 제목
            'entry.879467409': formData.composer || '', // 작곡가
            'entry.1693298501': formData.artist || '', // 가수 / 연주자 이름
            'entry.1313965673': formData.ensembleType1 || '', // 연주 형태 1 (기악/성악)
            'entry.2019841641': formData.musicGenre || '', // 음악 분류 (장르)
            'entry.402441130': formData.senseKeywords || '', // 감성 키워드 (2~3가지 선택)
            'entry.56073634': formData.senseText || '', // 느낌/분위기 서술 (50자 내외)
            'entry.1205363687': formData.senseColors || '', // 핵심 색상 (1~4개 선택)
            'entry.1842277818': formData.techSound || '', // 2-1. 소리 및 음색
            'entry.1494839761': formData.techRhythm || '', // 2-2. 속도 및 리듬
            'entry.951948701': formData.analysisHarmony || '', // 3-1. 화성 및 분위기
            'entry.730534621': formData.analysisForm || '', // 3-2. 형식 및 전개
            'entry.1563387102': formData.interpIntent || '', // 4-1. 작곡 의도 및 메시지
            'entry.1108413047': formData.interpScene || '', // 4-2. 음악의 사회적 의미 및 역할
            'entry.251864974': formData.evalArt || '', // 5-1. 예술적 가치 평가
            'entry.2091835272': formData.evalApply || '', // 5-2. 융합 및 확장 적용
            'entry.1358120920': formData.feedbackInput || '', // 감상문 보완 내용 직접 입력
            'entry.1985851644': formData.finalAppreciation || '' // 📝 학생의 보완된 최종 감상문
        };

        // Google Forms로 데이터 전송
        const formParams = new URLSearchParams();
        Object.entries(mappedData).forEach(([key, value]) => {
            if (value) {
                formParams.append(key, value);
            }
        });

        const response = await fetch(formUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formParams.toString()
        });

        // Google Forms는 성공 시 200 상태 코드를 반환하지 않을 수 있으므로 응답 확인
        if (response.status === 200 || response.status === 0) {
            console.log('✅ Google Forms 전송 성공');
        } else {
            console.warn('⚠️ Google Forms 응답 상태:', response.status);
        }

        // ✅ 로컬 JSON 파일에 저장 (비교 기능용)
        try {
            ensureDataFile();
            let studentsData = [];
            
            try {
                const fileContent = fs.readFileSync(STUDENTS_DATA_FILE, 'utf8');
                studentsData = JSON.parse(fileContent);
            } catch (error) {
                console.warn('기존 데이터 파일 읽기 실패, 새로 생성:', error.message);
                studentsData = [];
            }
            
            // 색상 데이터 파싱 (문자열 또는 배열)
            let parsedColors = [];
            if (formData.senseColors) {
                if (typeof formData.senseColors === 'string') {
                    // "파랑(평화, 고요), 빨강(긴장, 역동)" 형식에서 실제 색상 값 추출
                    parsedColors = formData.senseColors.split(',').map(s => {
                        const trimmed = s.trim();
                        // COLOR_PALETTE에서 매칭되는 색상 값 찾기 (클라이언트에서 처리)
                        // 여기서는 원본 문자열을 그대로 저장
                        return trimmed;
                    }).filter(s => s);
                } else if (Array.isArray(formData.senseColors)) {
                    parsedColors = formData.senseColors;
                }
            }
            
            // 중복 저장 방지: userId와 url을 기반으로 중복 체크
            const userId = formData.userId || `user_${Date.now()}`;
            const url = formData.url || '';
            const timestamp = formData.timestamp || new Date().toISOString();
            
            // 기존 데이터에서 같은 userId와 url 조합이 있는지 확인
            const existingIndex = studentsData.findIndex(s => 
                s.userId === userId && s.url === url
            );
            
            const newStudentData = {
                userId: userId,
                studentId: formData.studentId || '',
                studentName: formData.studentName || '',
                timestamp: timestamp,
                // 악곡 정보
                title: formData.title || '',
                composer: formData.composer || '',
                artist: formData.artist || '',
                url: url,
                musicGenre: formData.musicGenre || '',
                ensembleType1: formData.ensembleType1 || '',
                // 감각적 감상 데이터 (비교용)
                senseKeywords: formData.senseKeywords ? 
                    (typeof formData.senseKeywords === 'string' 
                        ? formData.senseKeywords.split(',').map(s => s.trim()).filter(s => s)
                        : formData.senseKeywords) 
                    : [],
                senseColors: parsedColors,
                senseText: formData.senseText || '',
                // 추가 데이터 (선택사항)
                scores: {
                    senseScore: formData.senseScore || 0,
                    techScore: formData.techScore || 0,
                    analysisScore: formData.analysisScore || 0,
                    consistencyScore: formData.consistencyScore || 0,
                    aestheticScore: formData.aestheticScore || 0
                }
            };
            
            if (existingIndex >= 0) {
                // 기존 데이터 업데이트 (최신 정보로 덮어쓰기)
                studentsData[existingIndex] = newStudentData;
                console.log(`🔄 학생 데이터 업데이트 완료 (userId: ${userId})`);
            } else {
                // 새 데이터 추가
                studentsData.push(newStudentData);
                console.log(`✅ 새 학생 데이터 저장 완료 (userId: ${userId})`);
            }
            
            // 파일에 저장
            fs.writeFileSync(STUDENTS_DATA_FILE, JSON.stringify(studentsData, null, 2), 'utf8');
            console.log(`📊 총 ${studentsData.length}명의 학생 데이터 저장됨`);
        } catch (saveError) {
            console.warn('⚠️ 로컬 데이터 저장 실패 (비교 기능에 영향 없음):', saveError.message);
        }

        res.json({ 
            success: true, 
            message: 'Google Forms로 데이터가 성공적으로 전송되었습니다.',
            status: response.status || 200
        });

    } catch (error) {
        console.error('Google Forms Error:', error);
        res.status(500).json({ 
            error: 'Google Forms 전송 중 오류가 발생했습니다.', 
            details: error.message 
        });
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

// ✅ 학생 데이터 조회 엔드포인트
app.get('/api/students-data', (req, res) => {
    try {
        ensureDataFile();
        
        const fileContent = fs.readFileSync(STUDENTS_DATA_FILE, 'utf8');
        const studentsData = JSON.parse(fileContent);
        
        // 필터링 옵션 (선택사항)
        const { title, composer, limit } = req.query;
        let filteredData = studentsData;
        
        if (title) {
            filteredData = filteredData.filter(s => 
                s.title && s.title.toLowerCase().includes(title.toLowerCase())
            );
        }
        
        if (composer) {
            filteredData = filteredData.filter(s => 
                s.composer && s.composer.toLowerCase().includes(composer.toLowerCase())
            );
        }
        
        if (limit) {
            filteredData = filteredData.slice(-parseInt(limit)); // 최근 N개만
        }
        
        res.json({
            success: true,
            students: filteredData,
            count: filteredData.length,
            total: studentsData.length
        });
    } catch (error) {
        console.error('학생 데이터 조회 오류:', error);
        res.status(500).json({ 
            error: '데이터를 가져올 수 없습니다.', 
            details: error.message 
        });
    }
});

// ✅ 특정 악곡의 데이터만 조회
app.get('/api/students-data/by-music', (req, res) => {
    try {
        const { title, composer } = req.query;
        
        if (!title && !composer) {
            return res.status(400).json({ 
                error: 'title 또는 composer 파라미터가 필요합니다.' 
            });
        }
        
        ensureDataFile();
        const fileContent = fs.readFileSync(STUDENTS_DATA_FILE, 'utf8');
        const studentsData = JSON.parse(fileContent);
        
        const filteredData = studentsData.filter(s => {
            const titleMatch = title ? 
                (s.title && s.title.toLowerCase().includes(title.toLowerCase())) : true;
            const composerMatch = composer ? 
                (s.composer && s.composer.toLowerCase().includes(composer.toLowerCase())) : true;
            return titleMatch && composerMatch;
        });
        
        res.json({
            success: true,
            students: filteredData,
            count: filteredData.length,
            filter: { title, composer }
        });
    } catch (error) {
        console.error('악곡별 데이터 조회 오류:', error);
        res.status(500).json({ error: '데이터를 가져올 수 없습니다.' });
    }
});

app.listen(PORT, () => {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`📝 OpenAI API Key 설정: ${apiKey ? '✅' : '❌'}`);
    console.log(`📺 YouTube API Key 설정: ${youtubeApiKey ? '✅' : '❌'}`);
    console.log(`📋 Google Form URL 설정: ${process.env.GOOGLE_FORM_URL ? '✅' : '❌'}`);
});

