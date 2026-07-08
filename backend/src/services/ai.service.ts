import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

function getClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong backend/.env');
  }
  return new GoogleGenAI({ apiKey: env.geminiApiKey });
}

// Cắt lấy JSON đầu tiên trong chuỗi (phòng khi model kèm chữ thừa).
function parseJson<T>(raw: string): T {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Không đọc được phản hồi AI');
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

export interface WritingGrade {
  score: number; // 0..100
  isCorrect: boolean;
  corrected: string; // câu đã sửa cho đúng/tự nhiên
  explanation: string; // nhận xét ngắn bằng tiếng Việt
}

// Chấm bài "viết lại câu / viết tự do" bằng Gemini.
export async function gradeWriting(input: {
  instruction: string;
  reference?: string;
  userAnswer: string;
  level: string;
}): Promise<WritingGrade> {
  const ai = getClient();

  const system = `Bạn là giáo viên tiếng Anh thân thiện, chấm bài cho học viên trình độ ${input.level}.
Nhiệm vụ: đánh giá câu trả lời của học viên so với yêu cầu.
Trả về DUY NHẤT một object JSON dạng:
{"score": <0-100>, "isCorrect": <true|false>, "corrected": "<câu tiếng Anh đúng & tự nhiên nhất>", "explanation": "<nhận xét NGẮN bằng tiếng Việt, tự nhiên, khích lệ, chỉ ra lỗi chính nếu có>"}
Chấm theo mức đúng ngữ pháp + đáp ứng yêu cầu + tự nhiên. isCorrect=true nếu câu đúng và hợp yêu cầu (cho phép diễn đạt khác đáp án mẫu nếu vẫn đúng).`;

  const prompt = `Yêu cầu: ${input.instruction}
${input.reference ? `Đáp án tham khảo: ${input.reference}\n` : ''}Câu học viên viết: "${input.userAnswer}"`;

  const res = await ai.models.generateContent({
    model: env.geminiModel,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      maxOutputTokens: 700,
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: 0 }, // tắt "thinking" để dành token cho câu trả lời
    },
  });

  const parsed = parseJson<WritingGrade>(res.text ?? '');
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    isCorrect: !!parsed.isCorrect,
    corrected: parsed.corrected ?? '',
    explanation: parsed.explanation ?? '',
  };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  correction: string | null;
}

// Hội thoại luyện nói với "người bạn AI" (TN4).
export async function chat(input: {
  history: ChatTurn[];
  message: string;
  level: string;
}): Promise<ChatReply> {
  const ai = getClient();

  const system = `Bạn là "Sol", một người bạn thân thiện nói tiếng Anh, đang trò chuyện để giúp người dùng (trình độ ${input.level}) luyện nói tiếng Anh.
Quy tắc:
- Trả lời NGẮN GỌN, tự nhiên như người thật đang nhắn tin (1-3 câu), tiếng Anh phù hợp trình độ ${input.level}.
- Luôn hỏi lại hoặc dẫn dắt để hội thoại tiếp diễn.
- Nếu câu tiếng Anh của người dùng có lỗi ngữ pháp/dùng từ đáng kể, đưa gợi ý sửa NGẮN bằng tiếng Việt; nếu ổn thì correction=null.
Trả về DUY NHẤT một object JSON: {"reply": "<câu trả lời tiếng Anh>", "correction": <"<gợi ý sửa tiếng Việt>" | null>}`;

  // Gemini dùng role 'model' cho trợ lý.
  const contents = [
    ...input.history.map((t) => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    })),
    { role: 'user', parts: [{ text: input.message }] },
  ];

  const res = await ai.models.generateContent({
    model: env.geminiModel,
    contents,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      maxOutputTokens: 500,
      temperature: 0.8,
      thinkingConfig: { thinkingBudget: 0 }, // tắt "thinking" để phản hồi nhanh, không cụt JSON
    },
  });

  const parsed = parseJson<ChatReply>(res.text ?? '');
  return {
    reply: parsed.reply ?? '...',
    correction: parsed.correction || null,
  };
}
