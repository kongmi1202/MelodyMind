// Netlify Serverless Function for Google Forms
import fetch from 'node-fetch';

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
        const formData = await req.json();
        
        // Google Forms URL
        const formUrl = process.env.GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/1c37LIvsiqaRk9ivEKUvmlKgt9O83D05qtAHNxa5jWOY/formResponse';

        // Entry point 매핑
        const mappedData = {
            'entry.514455809': formData.studentId || '',
            'entry.1927164281': formData.studentName || '',
            'entry.759135577': formData.url || '',
            'entry.651308062': formData.title || '',
            'entry.879467409': formData.composer || '',
            'entry.1693298501': formData.artist || '',
            'entry.1313965673': formData.ensembleType1 || '',
            'entry.2019841641': formData.musicGenre || '',
            'entry.402441130': formData.senseKeywords || '',
            'entry.56073634': formData.senseText || '',
            'entry.1205363687': formData.senseColors || '',
            'entry.1842277818': formData.techSound || '',
            'entry.1494839761': formData.techRhythm || '',
            'entry.951948701': formData.analysisHarmony || '',
            'entry.730534621': formData.analysisForm || '',
            'entry.1563387102': formData.interpIntent || '',
            'entry.1108413047': formData.interpScene || '',
            'entry.251864974': formData.evalArt || '',
            'entry.2091835272': formData.evalApply || '',
            'entry.1358120920': formData.feedbackInput || '',
            'entry.1985851644': formData.finalAppreciation || ''
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

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'Google Forms로 데이터가 성공적으로 전송되었습니다.',
                status: response.status || 200
            }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Google Forms Error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Google Forms 전송 중 오류가 발생했습니다.', 
                details: error.message 
            }),
            { status: 500, headers }
        );
    }
};

export const config = {
    path: "/api/google-forms"
};

