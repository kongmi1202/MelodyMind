// Netlify Serverless Function for Students Data
// This function reads student data from Google Sheets API
// Google Forms 응답을 Google Sheets에 연결해야 합니다.

export default async (req, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    // GET 요청만 허용
    if (req.method !== 'GET') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers }
        );
    }

    try {
        // URL 파라미터 파싱
        const url = new URL(req.url);
        const title = url.searchParams.get('title');
        const composer = url.searchParams.get('composer');
        const limit = url.searchParams.get('limit');

        // Google Sheets API를 사용하여 데이터 읽기
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const apiKey = process.env.GOOGLE_API_KEY || process.env.YOUTUBE_API_KEY;

        let studentsData = [];

        // Google Sheets가 설정되어 있으면 데이터 읽기
        if (spreadsheetId && apiKey) {
            try {
                // Google Sheets API v4로 데이터 읽기
                // 범위: 응답 시트의 모든 데이터
                // 시트명: "설문지 응답 시트1" (Google Forms 기본 응답 시트명)
                const range = '설문지 응답 시트1!A:Z';
                const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
                
                const response = await fetch(sheetsUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.values && data.values.length > 1) {
                        // 첫 번째 행은 헤더
                        const headerRow = data.values[0];
                        const rows = data.values.slice(1);
                        
                        // 헤더에서 인덱스 찾기 (유연하게)
                        const getIndex = (searchTerms) => {
                            for (let term of searchTerms) {
                                const idx = headerRow.findIndex(h => 
                                    h && h.toLowerCase().includes(term.toLowerCase())
                                );
                                if (idx >= 0) return idx;
                            }
                            return -1;
                        };
                        
                        // 필드 매핑 (실제 Google Forms 응답 컬럼명에 맞게 설정)
                        const fieldMappings = {
                            timestamp: ['타임스탬프', 'timestamp', '제출 시각'],
                            studentId: ['학번', 'studentid', 'student id'],
                            studentName: ['이름', 'studentname', 'student name', 'name'],
                            url: ['유튜브 링크', 'youtube', 'url', '유튜브'],
                            title: ['악곡 제목', 'title', 'song title'],
                            composer: ['작곡가', 'composer'],
                            artist: ['가수', '연주자', 'artist', 'performer', '가수 또는 연주자 이름'],
                            musicGenre: ['음악 분류', '장르', 'musicgenre', 'genre'],
                            ensembleType1: ['연주 형태', 'ensembletype', '연주 형태 1'],
                            senseKeywords: ['감성 키워드', '키워드', 'sensekeywords', 'keywords'],
                            senseColors: ['핵심 색상', '색상', 'sensecolors', 'colors'],
                            senseText: ['느낌/분위기 서술', '감상', 'sensetext', '감각적 감상']
                        };
                        
                        // 행을 객체로 변환
                        studentsData = rows.map((row, rowIndex) => {
                            const obj = {};
                            
                            // 기본 필드 추출
                            Object.keys(fieldMappings).forEach(field => {
                                const idx = getIndex(fieldMappings[field]);
                                if (idx >= 0 && row[idx]) {
                                    const value = row[idx].toString().trim();
                                    if (field === 'senseKeywords' && value) {
                                        obj[field] = value.split(',').map(s => s.trim()).filter(s => s);
                                    } else if (field === 'senseColors' && value) {
                                        obj[field] = value.split(',').map(s => s.trim()).filter(s => s);
                                    } else {
                                        obj[field] = value;
                                    }
                                } else {
                                    if (field === 'senseKeywords' || field === 'senseColors') {
                                        obj[field] = [];
                                    } else {
                                        obj[field] = '';
                                    }
                                }
                            });
                            
                            // timestamp 설정 (먼저)
                            const timestampIdx = getIndex(fieldMappings.timestamp);
                            obj.timestamp = timestampIdx >= 0 && row[timestampIdx] 
                                ? row[timestampIdx]
                                : new Date().toISOString();
                            
                            // userId 생성 (타임스탬프 기반)
                            if (!obj.userId) {
                                const timestampStr = obj.timestamp;
                                // 타임스탬프를 파싱하여 고유 ID 생성
                                let timestampNum;
                                try {
                                    // "2025. 11. 24 오후 8:35:5" 형식 파싱 시도
                                    timestampNum = new Date(timestampStr).getTime();
                                    if (isNaN(timestampNum)) {
                                        timestampNum = Date.now();
                                    }
                                } catch (e) {
                                    timestampNum = Date.now();
                                }
                                obj.userId = `user_${timestampNum}_${rowIndex}`;
                            }
                            
                            // scores 객체 생성 (기본값)
                            obj.scores = {
                                senseScore: 0,
                                techScore: 0,
                                analysisScore: 0,
                                consistencyScore: 0,
                                aestheticScore: 0
                            };
                            
                            return obj;
                        }).filter(item => item.title || item.studentId); // 제목 또는 학번이 있는 것만
                    }
                } else {
                    console.warn('⚠️ Google Sheets API 응답 오류:', response.status, response.statusText);
                }
            } catch (sheetsError) {
                console.warn('⚠️ Google Sheets에서 데이터를 읽을 수 없습니다:', sheetsError.message);
                // 계속 진행 (빈 배열 반환)
            }
        } else {
            console.warn('⚠️ Google Sheets ID 또는 API Key가 설정되지 않았습니다.');
        }

        // 필터링 적용
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

        return new Response(
            JSON.stringify({
                success: true,
                students: filteredData,
                count: filteredData.length,
                total: studentsData.length
            }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('학생 데이터 조회 오류:', error);
        return new Response(
            JSON.stringify({ 
                success: true, // 에러가 나도 빈 배열 반환하여 프론트엔드 오류 방지
                students: [],
                count: 0,
                total: 0,
                error: error.message
            }),
            { status: 200, headers } // 200으로 반환하여 프론트엔드에서 처리
        );
    }
};

export const config = {
    path: "/api/students-data"
};

