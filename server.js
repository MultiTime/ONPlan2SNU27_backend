// server.js 파일 내용
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env 파일의 환경변수를 불러옴

const app = express();
app.use(cors()); // 프론트엔드와의 통신 허용
app.use(express.json()); // JSON 데이터 파싱

// 환경변수에서 API 키 가져오기 (코드에 직접 노출 안 됨!)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 프론트엔드에서 요청을 보낼 주소 (API 엔드포인트)
app.post('/api/chat', async (req, res) => {
    try {
        const { historyContents } = req.body;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: historyContents,
                systemInstruction: {
                    parts: [{ text: "너는 서울대학교 컴퓨터공학부를 목표로 하는 고등학생 '송민찬'을 돕는 최고의 AI 멘토야. 친절하고, 분석적이며, 공부 계획과 컴퓨터 공학 지식에 대해 핵심만 짚어서 조언해줘." }]
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("🚨 구글 API가 거절한 진짜 이유:", errorData);
            throw new Error(`구글 API 에러: ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        
        // 프론트엔드로 결과 전송
        res.json({ reply: botReply });

    } catch (error) {
        console.error("서버 에러:", error);
        res.status(500).json({ error: "서버에서 응답을 생성하지 못했습니다." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
});
