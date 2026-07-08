// Lịch ôn kiểu SM-2 rút gọn. quality: 0=Again, 1=Khó, 2=Tốt, 3=Dễ.

export interface SrsState {
  reps: number;
  interval_days: number;
  ease: number;
}

export interface SrsResult extends SrsState {
  due_at: Date;
}

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const clampEase = (e: number) => Math.max(MIN_EASE, Math.min(MAX_EASE, e));

export function schedule(state: SrsState, quality: 0 | 1 | 2 | 3): SrsResult {
  let { reps, interval_days, ease } = state;
  const now = Date.now();

  if (quality === 0) {
    // Quên → học lại, ôn lại sau ~10 phút.
    reps = 0;
    interval_days = 0;
    ease = clampEase(ease - 0.2);
    return { reps, interval_days, ease, due_at: new Date(now + 10 * 60 * 1000) };
  }

  if (quality === 1) {
    ease = clampEase(ease - 0.15);
    interval_days = Math.max(1, Math.round(interval_days * 1.2) || 1);
  } else if (quality === 2) {
    if (reps === 0) interval_days = 1;
    else if (reps === 1) interval_days = 3;
    else interval_days = Math.round(interval_days * ease);
  } else {
    // Dễ
    ease = clampEase(ease + 0.15);
    interval_days = Math.max(1, Math.round((interval_days || 1) * ease * 1.3));
  }

  reps += 1;
  const due_at = new Date(now + interval_days * 24 * 60 * 60 * 1000);
  return { reps, interval_days, ease, due_at };
}
