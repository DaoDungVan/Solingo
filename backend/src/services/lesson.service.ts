import { pool } from '../config/db';
import * as Q from '../queries/lesson.queries';
import { gradeChoice, gradeDictation, gradeFillBlank } from './grade';
import { recordActivity } from './progress.service';
import { gradeWriting } from './ai.service';

async function getLevel(userId: string): Promise<string> {
  const r = await pool.query('SELECT level FROM profiles WHERE user_id = $1', [userId]);
  return r.rows[0]?.level ?? 'A1';
}

const XP_CORRECT = 10;
const XP_PARTIAL = 3;

export async function listLessons(type: string, level?: string) {
  const result = await pool.query(Q.SELECT_LESSONS, [type, level ?? null]);
  return result.rows;
}

export async function getLessonWithItems(lessonId: string) {
  const lessonRes = await pool.query(Q.SELECT_LESSON, [lessonId]);
  const lesson = lessonRes.rows[0];
  if (!lesson) throw new Error('Không tìm thấy bài học');
  const itemsRes = await pool.query(Q.SELECT_ITEMS_PUBLIC, [lessonId]);
  return { lesson, items: itemsRes.rows };
}

interface SubmitInput {
  item_id?: string;
  // dictation/reorder: { text }; fill_blank: { blanks }; mcq: { choice }
  answer?: { text?: string; blanks?: string[]; choice?: string };
}

export async function submitAttempt(userId: string, input: SubmitInput) {
  const { item_id, answer } = input;
  if (!item_id) throw new Error('Thiếu item_id');

  const itemRes = await pool.query(Q.SELECT_ITEM_FOR_GRADE, [item_id]);
  const item = itemRes.rows[0];
  if (!item) throw new Error('Không tìm thấy câu hỏi');

  const answers: string[] = Array.isArray(item.answers) ? item.answers : [];

  let graded: { score: number; isCorrect: boolean; feedback: unknown };
  let userAnswerJson: unknown;

  if (item.kind === 'fill_blank') {
    const blanks = answer?.blanks ?? [];
    graded = gradeFillBlank(blanks, answers);
    userAnswerJson = { blanks };
  } else if (item.kind === 'mcq') {
    const choice = answer?.choice ?? '';
    graded = gradeChoice(choice, answers[0] ?? '');
    userAnswerJson = { choice };
  } else if (item.kind === 'write') {
    // Viết lại câu / viết tự do → Claude chấm + giải thích.
    const text = answer?.text ?? '';
    const level = await getLevel(userId);
    const g = await gradeWriting({ instruction: item.text, reference: answers[0], userAnswer: text, level });
    graded = {
      score: g.score,
      isCorrect: g.isCorrect,
      feedback: { corrected: g.corrected, explanation: g.explanation },
    };
    userAnswerJson = { text };
  } else {
    // dictation | reorder — so khớp cả câu (diff từng từ)
    const text = answer?.text ?? '';
    graded = gradeDictation(text, answers[0] ?? item.text);
    userAnswerJson = { text };
  }

  await pool.query(Q.INSERT_ATTEMPT, [
    userId,
    item_id,
    JSON.stringify(userAnswerJson),
    graded.score,
    graded.isCorrect,
    JSON.stringify(graded.feedback),
  ]);

  // Thưởng XP: đúng hoàn toàn +10, đúng một phần +3. Đồng thời cập nhật streak.
  const xpGain = graded.isCorrect ? XP_CORRECT : graded.score > 0 ? XP_PARTIAL : 0;
  const { xp, streak } = await recordActivity(userId, xpGain);

  return { ...graded, xpGain, xp, streak };
}
