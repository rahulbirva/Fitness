# 30 Day Wedding Fit

A native mobile application built with React Native, Expo, and TypeScript for a focused 30-day fat loss and muscle building transformation before your sister's wedding.

Targeted Android-first, fully iOS-compatible, single user, completely offline-first, with zero accounts and zero cloud logins required.

---

## Highlights

- **100% Offline-First Architecture**: Profile, daily workouts, set logs, meals, water counter, body metrics, and chat history are saved in local SQLite on device (`expo-sqlite`).
- **Strict Visual Design System**:
  - Warm off-white background (`#EFE9DD`) with dark ink text (`#1A1A1A`) and deep forest green accent (`#2D5016`).
  - Strict flat geometry: 0 to 2px border radius, no drop shadows, no glassmorphism, no gradients, no emojis.
  - Fonts: IBM Plex Sans for interface text and IBM Plex Mono for all numerical data.
- **Stick-Figure Form Loops**: Looping SVG animations rendered with `react-native-svg` and `react-native-reanimated` showing correct posture and mechanics for exercises (push-ups, squats, lunges, planks, crunches, bicep curls, shoulder presses, rows, glute bridges, leg raises). Missing items include direct YouTube search links.
- **Smart Rest Timer**: Integrated rest timer between sets with a vibration pattern at completion (`react-native Vibration`).
- **Indian Diet Planner**: Specific Indian food options (eggs, besan chilla, paneer bhurji, dal, roti, sabzi, curd, chana, sprouts, soya chunks, chicken, fish). Daily calorie and protein targets dynamically calculated from height, weight, age, and goal. Weekly single fast-food meal toggle.
- **AI Coach**: Real-time streaming chat powered by your choice of Anthropic Claude, Google Gemini, or xAI Grok. Automatically injects your biometrics, today's workout, last 7 days of training logs, water intake, and diet rules as context.
- **Data Export & Privacy**: Export complete database as JSON or body metrics as CSV through the native share sheet (`expo-sharing`). Photos stored in app document sandbox (`expo-file-system`).

---

## Screens (Bottom Navigation Tabs)

1. **Today**: Current day workout checklist with sets x reps and tap-to-complete sets. Rest interval timer with completion vibration. Meal checklist (breakfast, lunch, snack, dinner), water counter (target 3.5 L), steps input (target 8k-10k), and sleep hours tracker.
2. **Library**: Complete exercise directory with animated stick-figure loop, 5 how-to steps, common mistakes, target muscle tags, and YouTube tutorial search link.
3. **Plan**: 30-day progressive overload calendar grouped by week. Weeks increase in reps and resistance. Completed days are filled with forest green. Tap any day for workout inspection.
4. **Progress**: Sister's wedding countdown in days, streak counter, weight & waist logging, weekly face photo capture, SVG trend charts for weight & waist, and export buttons.
5. **Diet**: Daily calorie and protein target dashboard based on Mifflin-St Jeor formula, weekly fast-food cheat toggle, Indian meal slots with modal recipe switcher, and seeded diet rules.
6. **Coach**: Streaming AI fitness and Indian diet advice. Automatically receives your profile, today's workout, and 7-day logs.
7. **Settings**: Edit biometrics, wedding date, program start date, AI provider (Claude or Gemini), model name, API key storage, workout reminder time, and database reset.

---

## Getting Started: Run with Expo Go

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npx expo start
```

### 3. Open on your Phone
- **Android**: Install the **Expo Go** app from Google Play Store. Scan the QR code displayed in your terminal.
- **iOS**: Install the **Expo Go** app from Apple App Store. Open Camera and scan the QR code.

---

## Build and Install an APK on Android (EAS Build)

The project includes an optimized `eas.json` configured with an Android `preview` profile that produces an installable standalone `.apk` file (no Play Store submission needed).

### Step 1: Install EAS CLI and Log In
```bash
npm install -g eas-cli
eas login
```

### Step 2: Configure Project (First time only)
```bash
eas build:configure
```
Select **Android** when prompted.

### Step 3: Trigger the Standalone APK Build
Run this exact command to start building your APK on Expo's cloud build servers:
```bash
eas build -p android --profile preview
```

### Step 4: Download and Install APK on Your Phone
1. When the build finishes, EAS will display a download link and a QR code in the terminal.
2. Download the `.apk` file directly on your phone via the link, or transfer it from your computer via USB.
3. On your Android device, go to **Settings > Security (or Apps)** and enable **Install unknown apps** for your browser/file manager.
4. Tap the downloaded `.apk` file and select **Install**.
5. Launch **30 Day Wedding Fit** from your home screen. It will run completely offline.

---

## AI Coach: API Key & Security

### How It Works in Single-User Mode
- The AI Coach communicates directly with Anthropic's Messages API (`https://api.anthropic.com/v1/messages`) or Google's Gemini API (`https://generativelanguage.googleapis.com/v1beta/...`).
- Your API key is entered in the **Settings** tab and stored exclusively in your device's hardware-backed secure storage via `expo-secure-store`.
- The key is **never hardcoded**, **never committed to git**, and **never logged**.

### Recommended Models:
- **Google Gemini**: `gemini-1.5-flash` (Fast streaming, generous free tier).
  - Get a key at: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Anthropic Claude**: `claude-3-5-haiku-20241022` (High quality, short punchy responses).
  - Get a key at: [Anthropic Console](https://console.anthropic.com/settings/keys)
- **xAI Grok**: `grok-beta` or `grok-2-latest` (OpenAI-compatible streaming, witty & direct).
  - Get a key at: [xAI Console](https://console.x.ai/)

### Security Recommendation: Sharing the App via Tiny Proxy Server
If you ever share this application with friends, family, or publish it publicly, **do not distribute an app where users must enter their own keys or where you ship a shared key inside the app bundle**. Client-side keys can be extracted through reverse-engineering or network inspection.

Instead, set up a tiny, free server-side proxy (e.g. deployed on Render, Railway, or Cloudflare Workers) that securely holds your secret key in an environment variable:

```javascript
// Minimal proxy example: proxy.js
const express = require('express');
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { model, contents, system_instruction } = req.body;
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, system_instruction }),
  });

  res.setHeader('Content-Type', 'text/event-stream');
  response.body.pipe(res);
});

app.listen(3000, () => console.log('Proxy active on port 3000'));
```
Then, update `src/services/ai/gemini.ts` to call your proxy URL (`https://your-proxy-domain.com/api/chat`) without needing a key on the phone.

---

## Notifications Setup

- **Evening Training Reminder**: Scheduled daily at `17:30` (5:30 PM) by default. The exact time can be changed anytime in the Settings tab.
- **Hydration Reminders**: When enabled, schedules local daytime reminders at 10:00, 13:00, 16:00, and 19:00 to keep you drinking 3.5 Liters of water daily.
- Permission requests are handled automatically when you tap **Save Settings**.

---

## Running Unit Tests

Unit tests verify the Mifflin-St Jeor calorie & macronutrient calculation formulas (for both male and female profiles, across fat loss, maintain, and muscle gain goals) and the 30-day progressive schedule logic.

```bash
npm test
```

Expected output:
```
PASS __tests__/schedule.test.ts
PASS __tests__/calories.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        ~1s
```

---

## Project Structure

```
fitness/
├── src/
│   ├── app/                    # Expo Router route hierarchy
│   │   ├── _layout.tsx         # Root layout (fonts, db initialization)
│   │   └── (tabs)/             # 7 bottom tabs
│   │       ├── _layout.tsx     # Custom flat tab bar
│   │       ├── index.tsx       # Today: workout, sets, rest timer, meals, water
│   │       ├── library.tsx     # Exercise library with stick figure animations
│   │       ├── plan.tsx        # 30-day progressive calendar
│   │       ├── progress.tsx    # Wedding countdown, photo, trend charts, export
│   │       ├── diet.tsx        # Indian macros, meal switcher, cheat meal toggle
│   │       ├── coach.tsx       # Streaming AI fitness coach
│   │       └── settings.tsx    # Biometrics, keys, notifications, reset
│   ├── components/
│   │   ├── ui/                 # Typography, Button, Input, Checkbox
│   │   ├── workout/            # ExerciseCard, SetRow, RestTimer
│   │   ├── diet/               # WaterTracker, MealSlot
│   │   ├── coach/              # ChatBubble
│   │   └── animations/         # SVG stick figure loop components
│   ├── constants/
│   │   ├── theme.ts            # Warm off-white, forest green, IBM Plex fonts
│   │   ├── exercises.ts        # Exercise library database
│   │   ├── workoutPlan.ts      # 30-day progressive training plan
│   │   └── dietData.ts         # Indian meal options and diet rules
│   ├── db/
│   │   ├── index.ts            # SQLite database initialization & seeding
│   │   ├── schema.ts           # Table definitions
│   │   └── queries/            # Type-safe SQL query modules
│   ├── services/
│   │   ├── ai/                 # Streaming providers for Claude & Gemini
│   │   ├── notifications.ts    # Local workout and water reminders
│   │   └── export.ts           # JSON & CSV share sheet export
│   └── utils/
│       ├── calories.ts         # Mifflin-St Jeor formula & macros
│       ├── schedule.ts         # 30-day schedule progression logic
│       └── date.ts             # Date helpers and countdown calculation
├── __tests__/                  # Unit tests (Jest)
├── eas.json                    # EAS build configuration (preview APK profile)
├── app.json                    # Expo project configuration
└── package.json
```
