// server.js 파일 내용 수정본
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { historyContents, model } = req.body;

        // 프론트엔드가 준 모델 ID가 매핑 테이블에 있다면 변환하고, 없다면 안전하게 2.5-flash로 기본 설정
        const googleModelName = "gemini-3-flash-preview";
        
        // 구글 API 공식 엔드포인트에 동적으로 모델명 대입
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${googleModelName}:generateContent?key=${GEMINI_API_KEY}`;

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
            console.error("🚨 구글 API 에러 원인:", errorData);
            throw new Error(`구글 API 에러: ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        
        res.json({ reply: botReply });

    } catch (error) {
        console.error("서버 에러:", error);
        res.status(500).json({ error: error.message || "서버에서 응답을 생성하지 못했습니다." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
});
