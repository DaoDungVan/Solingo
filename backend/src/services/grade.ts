// Chấm bài nghe-viết — thuần thuật toán, không cần AI.

// Chuẩn hoá để so khớp "mềm": bỏ hoa/thường, bỏ dấu câu, gộp khoảng trắng.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "'") // thống nhất dấu nháy
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ') // bỏ dấu câu (giữ chữ/số/nháy)
    .replace(/\s+/g, ' ')
    .trim();
}

function words(text: string): string[] {
  const n = normalize(text);
  return n.length ? n.split(' ') : [];
}

// LCS trên mảng từ → đánh dấu từng từ kỳ vọng là đúng/sai.
function lcsMatch(expected: string[], got: string[]): boolean[] {
  const m = expected.length;
  const n = got.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = expected[i] === got[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const matched = new Array(m).fill(false);
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (expected[i] === got[j]) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return matched;
}

export interface DictationFeedback {
  words: { word: string; correct: boolean }[];
  expected: string;
}

export function gradeDictation(userText: string, answer: string) {
  const expected = words(answer);
  const got = words(userText);
  const matched = expected.length ? lcsMatch(expected, got) : [];
  const correctCount = matched.filter(Boolean).length;
  const score = expected.length ? Math.round((100 * correctCount) / expected.length) : 0;
  const isCorrect = normalize(userText) === normalize(answer);

  const feedback: DictationFeedback = {
    words: expected.map((w, idx) => ({ word: w, correct: matched[idx] })),
    expected: answer,
  };
  return { score, isCorrect, feedback };
}

export interface FillBlankFeedback {
  blanks: { expected: string; given: string; correct: boolean }[];
}

export interface ChoiceFeedback {
  given: string;
  expected: string;
}

// Chấm trắc nghiệm: so khớp lựa chọn với đáp án đúng.
export function gradeChoice(given: string, answer: string) {
  const isCorrect = normalize(given) === normalize(answer);
  return {
    score: isCorrect ? 100 : 0,
    isCorrect,
    feedback: { given, expected: answer } as ChoiceFeedback,
  };
}

export function gradeFillBlank(userBlanks: string[], answers: string[]) {
  const blanks = answers.map((ans, i) => {
    const given = userBlanks[i] ?? '';
    return { expected: ans, given, correct: normalize(given) === normalize(ans) };
  });
  const correctCount = blanks.filter((b) => b.correct).length;
  const score = answers.length ? Math.round((100 * correctCount) / answers.length) : 0;
  const isCorrect = correctCount === answers.length;
  return { score, isCorrect, feedback: { blanks } as FillBlankFeedback };
}
