// Netlify Serverless Function for Students Data
import fetch from 'node-fetch';

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
        // URL 파라미터 파싱 (Netlify Functions v2 호환)
        let title = null;
        let composer = null;
        let limit = null;
        
        try {
            // req.url이 전체 URL인 경우
            if (req.url && req.url.includes('?')) {
                const url = new URL(req.url);
                title = url.searchParams.get('title');
                composer = url.searchParams.get('composer');
                limit = url.searchParams.get('limit');
            }
        } catch (e) {
            // URL 파싱 실패 시 무시
        }

        // Google Sheets API를 사용하여 데이터 읽기
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const apiKey = process.env.GOOGLE_API_KEY || process.env.YOUTUBE_API_KEY;

        // 디버깅 정보 로깅
        console.log('📊 학생 데이터 조회 시작:', {
            hasSpreadsheetId: !!spreadsheetId,
            hasApiKey: !!apiKey,
            spreadsheetId: spreadsheetId ? spreadsheetId.substring(0, 10) + '...' : '없음'
        });

        let studentsData = [];

        // Google Sheets가 설정되어 있으면 데이터 읽기
        if (spreadsheetId && apiKey) {
            try {
                // 먼저 스프레드시트 메타데이터를 가져와서 시트 목록 확인
                let sheetNames = [];
                try {
                    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
                    console.log('📋 메타데이터 API 호출 시도:', metadataUrl.substring(0, 100) + '...');
                    const metadataResponse = await fetch(metadataUrl);
                    
                    console.log('📋 메타데이터 API 응답 상태:', metadataResponse.status, metadataResponse.statusText);
                    
                    if (metadataResponse.ok) {
                        const metadata = await metadataResponse.json();
                        console.log('📋 메타데이터 응답:', {
                            hasSheets: !!metadata.sheets,
                            sheetsCount: metadata.sheets?.length || 0
                        });
                        
                        if (metadata.sheets && metadata.sheets.length > 0) {
                            sheetNames = metadata.sheets.map(sheet => sheet.properties.title);
                            console.log(`✅ 발견된 시트 목록:`, sheetNames);
                        } else {
                            console.warn('⚠️ 메타데이터에 시트 정보가 없습니다.');
                        }
                    } else {
                        const errorText = await metadataResponse.text().catch(() => '응답 본문 읽기 실패');
                        console.error('❌ 메타데이터 API 오류:', {
                            status: metadataResponse.status,
                            statusText: metadataResponse.statusText,
                            error: errorText.substring(0, 500)
                        });
                    }
                } catch (metadataErr) {
                    console.error('❌ 시트 메타데이터 가져오기 실패:', {
                        message: metadataErr.message,
                        stack: metadataErr.stack
                    });
                }
                
                // 시트명 목록이 없으면 기본값 사용
                if (sheetNames.length === 0) {
                    sheetNames = [
                        '설문지 응답 시트1',
                        '시트1',
                        'Form Responses 1',
                        'Sheet1'
                    ];
                }
                
                let data = null;
                let successfulRange = null;
                
                // 첫 번째 시트명부터 시도
                console.log(`📋 시도할 시트명 목록:`, sheetNames);
                for (const sheetName of sheetNames) {
                    try {
                        // 시트명에 공백이나 특수문자가 있을 수 있으므로 URL 인코딩
                        const encodedSheetName = encodeURIComponent(sheetName);
                        const range = `${sheetName}!A:Z`;
                        const encodedRange = encodeURIComponent(range);
                        const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?key=${apiKey}`;
                        
                        console.log(`📋 시트명 시도: "${sheetName}"`);
                        console.log(`📋 URL: ${sheetsUrl.substring(0, 150)}...`);
                        const response = await fetch(sheetsUrl);
                        
                        if (response.ok) {
                            const responseData = await response.json();
                            console.log(`📋 시트명 "${sheetName}" 응답:`, {
                                hasValues: !!responseData.values,
                                valuesLength: responseData.values?.length || 0,
                                error: responseData.error
                            });
                            
                            if (responseData.values && responseData.values.length > 0) {
                                data = responseData;
                                successfulRange = sheetName;
                                console.log(`✅ 시트명 "${sheetName}"에서 데이터 발견: ${responseData.values.length}행`);
                                break;
                            } else if (responseData.error) {
                                console.error(`❌ Google Sheets API 오류:`, responseData.error);
                            }
                        } else {
                            const errorText = await response.text().catch(() => '응답 본문 읽기 실패');
                            console.error(`❌ 시트명 "${sheetName}" 실패:`, {
                                status: response.status,
                                statusText: response.statusText,
                                error: errorText.substring(0, 500)
                            });
                        }
                    } catch (err) {
                        console.log(`❌ 시트명 "${sheetName}" 오류:`, err.message);
                        continue;
                    }
                }
                
                if (data && data.values && data.values.length > 1) {
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
                        }).filter(item => {
                            // 필터링 조건 완화: 타임스탬프가 있으면 데이터로 간주
                            return item.timestamp || item.title || item.studentId || item.url;
                        });
                    } else {
                        console.log('⚠️ 데이터가 없거나 헤더만 있습니다.');
                    }
            } catch (sheetsError) {
                console.error('⚠️ Google Sheets에서 데이터를 읽을 수 없습니다:', {
                    message: sheetsError.message,
                    stack: sheetsError.stack
                });
                // 계속 진행 (빈 배열 반환)
            }
        } else {
            console.warn('⚠️ Google Sheets ID 또는 API Key가 설정되지 않았습니다.', {
                hasSpreadsheetId: !!spreadsheetId,
                hasApiKey: !!apiKey
            });
        }
        
        console.log(`📊 데이터 조회 완료: ${studentsData.length}개 항목 발견`);

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

        const result = {
            success: true,
            students: filteredData,
            count: filteredData.length,
            total: studentsData.length
        };
        
        console.log(`✅ 응답 반환: ${result.count}개 항목 (전체 ${result.total}개)`);
        
        return new Response(
            JSON.stringify(result),
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

