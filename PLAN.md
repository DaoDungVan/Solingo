# Solingo — Kế hoạch & kiến trúc

App học tiếng Anh (web + mobile) bằng TypeScript. Hai project độc lập trong repo này.

## Thương hiệu / Logo

- Logo nguồn: `Solingo_LogoApp.png` (icon vuông), `Solingo_LogoWeb.png` (wordmark trong suốt).
- Asset app sinh tự động (script pngjs, đã dọn): `apps/mobile/assets/images/` — `icon.png`/`favicon.png`
  (nền gradient + mark, đã bỏ watermark AI & góc đen), `adaptive-foreground.png` (mark trong suốt cho Android),
  `splash-icon.png` (mark), `logo-wordmark.png` (wordmark cắt sát — dùng ở màn đăng nhập).
- `app.json`: name **Solingo**, icon/splash/favicon/adaptiveIcon đã trỏ đúng.
- Muốn đổi logo: thay 2 file nguồn ở gốc repo rồi chạy lại script sinh asset (xem lịch sử chat).

## Cấu trúc thực tế

```
Solingo/
├─ backend/            # Express + TypeScript (API + auth JWT + socket.io)
├─ apps/mobile/        # Expo (React Native) — chạy iOS/Android/Web, expo-router
├─ package.json        # script tiện ích (dev:backend, dev:mobile, web)
└─ PLAN.md
```

> Không dùng npm workspaces (tránh Metro hoisting trên Expo SDK 57) — mỗi project có `node_modules` riêng.
> Không dùng NativeWind — dùng RN `StyleSheet` + theme sẵn có của template (`src/constants/theme.ts`).
> Kiểu API khai báo cục bộ ở mỗi bên (backend `src/types`, mobile `src/api/*`).

## Tech stack

| Lớp | Công nghệ |
|-----|-----------|
| App + Web | Expo SDK 57, React Native 0.86, React 19, expo-router |
| Backend | Express 4 + TypeScript, chạy dev bằng `tsx` |
| DB | Postgres (Supabase) qua `pg` + pgBouncer pooler (cổng 6543) |
| Auth | JWT (access token ngắn hạn) + refresh token xoay vòng lưu DB, bcryptjs |
| Realtime | socket.io (khung sẵn, dùng cho TN5 sau) |
| AI | Claude (`@anthropic-ai/sdk`) — chấm câu tự do / giải thích |
| TTS | **Gemini TTS** (`gemini-2.5-flash-preview-tts`, giọng neural tự nhiên) qua `POST /api/tts`, cache WAV ở `backend/storage/tts/`. Fallback `expo-speech` (giọng thiết bị) khi lỗi. |
| Chấm phát âm | Azure Pronunciation Assessment — thêm ở TN2 |

Pattern mượn từ repo cũ của bạn: layered `routes → controllers → services → queries` + `sanitize*()` DTO,
`authenticate/authenticateOptional/authorize`, pgBouncer rewrite (từ `backend-log-function`);
axios silent token-refresh + `useAuth()` (từ `Vivudee_Admin`).

## Data model (Postgres)

Đã có (migration 001): `users`, `profiles`, `refresh_tokens`.
Sẽ thêm: `lessons`, `items`, `attempts` (TN1) · `vocab`, `user_vocab` (TN3).

## Trạng thái

- [x] **Giai đoạn 1 — Setup**: monorepo, backend skeleton (boot OK, `/api/health`), Expo app.
- [x] **Giai đoạn 2 — Auth**: backend signup/login/refresh/me/logout (JWT); mobile axios silent-refresh,
      AuthContext, màn login/register, điều hướng bảo vệ `(auth)`/`(app)`. Đã verify trên web.
- [x] **Onboarding chọn trình độ**: profile có cờ `onboarded`; user mới bị bắt qua màn `(onboarding)` chọn
      Mất gốc/Sơ cấp/Trung cấp/Nâng cao → A1/A2/B1/B2; nội dung lọc theo `level`; đổi lại trong Hồ sơ.
      Endpoint `PATCH /api/profile/level`. Đã verify trên web.
- [x] **Giai đoạn 3 — TN1 Dictation**: schema `lessons`/`items`/`attempts`; chấm nghe-viết + fill-blank
      (fuzzy bỏ hoa/thường & dấu câu, diff từng từ), thưởng XP; TTS bằng `expo-speech` (giọng thiết bị,
      miễn phí — sau cắm OpenAI/ElevenLabs); màn danh sách bài + player (audio, nghe chậm, điền chỗ trống
      inline). Icon dùng `@expo/vector-icons` (Ionicons, solid). Seed: `npm run seed`. Đã verify trên web.
- [x] **Giai đoạn 4 — TN3 Vocab/Grammar**: từ vựng flashcard SRS (SM-2 rút gọn: Lại/Khó/Tốt/Dễ,
      `POST /vocab/review`), quiz ngữ pháp trắc nghiệm (mcq) + sắp xếp câu (reorder), lọc theo level,
      thưởng XP. Seed từ vựng + bài ngữ pháp A1–B2. Đã verify web.
      *(Phần viết lại câu tự do → Claude chấm: hoãn tới khi có `ANTHROPIC_API_KEY`.)*
- [x] **Giai đoạn 5 — TN2 Shadowing**: nghe câu mẫu → nói lại → **speech-to-text** (Web Speech API,
      hook `use-speech-recognition`) → so khớp từng từ (tái dùng bộ chấm nghe-viết ở backend), thưởng XP.
      Miễn phí, chạy trên Chrome/Edge & mobile web. Seed câu shadowing A1–B2. Đã verify web.
      *(Native Expo Go chưa có STT → hiện màn báo cần Chrome/bản build; nâng cấp Azure phoneme sau nếu cần.)*
- [x] **Giai đoạn 6 — Hoàn thiện**: streak theo ngày (atomic SQL: hôm nay giữ / hôm qua +1 / lâu hơn reset,
      cột `last_active_date`), `recordActivity()` gộp XP+streak dùng chung cho attempt & vocab review;
      endpoint `GET /api/progress` (hôm nay/tổng/7 ngày, dải ngày sinh bằng SQL `generate_series` tránh lệch
      múi giờ); Trang chủ có thẻ "Hoạt động 7 ngày" + tự refresh khi focus. Đã verify web.
- [x] **AI chấm câu tự do** (kind `write`): `ai.service.gradeWriting` → điểm + câu sửa + giải thích
      tiếng Việt. Có trong bài ngữ pháp. Đã verify thật (đúng/sai).
- [x] **TN4 — Voice chat AI**: màn "Trò chuyện với AI" (Sol), STT (nói) → AI hội thoại + gợi ý sửa →
      TTS (đọc), nhập chữ/giọng. Endpoint `POST /api/chat`. Đã verify thật trên app.
- **AI dùng Google Gemini** (`@google/genai`, model `gemini-2.5-flash`, key free ở aistudio.google.com):
  env `GEMINI_API_KEY` + `GEMINI_MODEL`. Lưu ý phải tắt "thinking" (`thinkingConfig.thinkingBudget=0`)
  kẻo model ăn hết token → JSON cụt. (2.0-flash bị free-tier limit=0 nên dùng 2.5-flash.)
- [x] **TN5 — Ghép cặp người thật**: socket.io matchmaking (`config/socket.ts`, JWT auth ở handshake) —
      xếp hàng → ghép phòng → chat realtime → skip/rời. Màn "Ghép bạn luyện nói". Đã verify (2 client Node
      + in-app searching). Voice qua WebRTC để sau.
- Cần Metro config: `apps/mobile/metro.config.js` tắt `unstable_enablePackageExports` để socket.io-client
  bundle được trên web (import nội bộ ./url.js bị chặn bởi strict exports).

## Cách chạy (local)

**Backend:**
1. Tạo Supabase project → lấy connection string (Settings → Database → URI, cổng 5432).
2. Sửa `backend/.env`: điền `DATABASE_URL` thật, `JWT_SECRET`, `ANTHROPIC_API_KEY`.
3. `cd backend && npm install && npm run migrate` (tạo bảng).
4. `npm run dev` → API chạy ở http://localhost:4000

**Mobile (web/native):**
1. `cd apps/mobile && npm run web` (hoặc `npm run start` rồi mở Expo Go).
2. Thiết bị thật: đặt `EXPO_PUBLIC_API_URL=http://<IP-LAN>:4000/api`.
   Android emulator dùng `10.0.2.2` thay `localhost` (đã xử lý sẵn trong `src/lib/config.ts`).
