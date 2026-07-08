<div align="center">

# 🎧 Solingo

**A full-stack English learning app — listen, speak, read, write, and chat with AI.**

Web + iOS + Android from a single TypeScript codebase.

### 🔗 [**Live Demo →**](https://solingo-learn.vercel.app)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🎧 | **Listen & Write** | Hear a sentence, type it back or fill in the blanks — graded word-by-word with fuzzy matching |
| 🎤 | **Listen & Speak** | Shadowing practice — speak the sentence, scored via speech-to-text |
| 📚 | **Vocabulary & Grammar** | Flashcards with **spaced repetition (SM-2)**, multiple-choice, sentence reordering, and **free-writing graded by AI** |
| 💬 | **AI Voice Chat** | Chat (text + voice) with "Sol", an AI friend that replies naturally and corrects your English |
| 👥 | **Random Partner** | Get matched with another learner for real-time chat practice |
| 🎯 | **Progress** | Level onboarding (A1–B2), daily streaks, XP, 7-day activity, natural neural voice |

## 🛠️ Tech Stack

- **Mobile/Web:** Expo (React Native) · expo-router · TypeScript — one codebase for iOS, Android & Web
- **Backend:** Node.js · Express · TypeScript
- **Database:** PostgreSQL (Supabase) via `pg` + pgBouncer pooler
- **AI:** Google Gemini — conversation, free-text grading, and **neural text-to-speech**
- **Realtime:** Socket.IO (matchmaking + live chat)
- **Auth:** JWT access + rotating refresh tokens (bcrypt)

## 🏗️ Architecture

```
Solingo/
├─ backend/          Express + TypeScript API (auth, lessons, vocab SRS,
│                    AI grading & chat, TTS, socket.io matchmaking)
└─ apps/mobile/      Expo app — auth flow, 5 practice modes, progress
```

The mobile client talks to the backend over a REST API (JWT-authenticated,
axios with silent token refresh) and a Socket.IO connection for live matching.
Grading that doesn't need AI (dictation, MCQ, reordering) is pure algorithm
(LCS diff); free-writing and conversation use Gemini.

## 🚀 Run locally

**Backend**
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm install
npm run migrate           # create tables
npm run seed              # seed demo content (A1–B2)
npm run dev               # http://localhost:4000
```

**Mobile / Web**
```bash
cd apps/mobile
npm install
npm run web               # or: npx expo start  → scan QR with Expo Go
```

> Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).
> Neural voice & speech recognition work best on Chrome/Edge or a native build.

## 📸 Screenshots

_Add screenshots here (login, home, dictation, AI chat, vocab flashcards)._

---

<div align="center">
Built with TypeScript, Expo & Gemini.
</div>
