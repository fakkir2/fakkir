# StudyMate AI

AI-powered academic companion for university students.
English + Arabic (RTL/LTR), dark and light themes, responsive layouts.

Three optional layers, each falling back to demo behaviour when not configured:

| Layer | Needs | Without it |
|---|---|---|
| Accounts + cloud storage | Firebase project (Auth + Firestore) | Demo mode: no login, data stays in this browser |
| Live AI assistant | `ANTHROPIC_API_KEY` | Simulated replies |
| Hosting | Firebase App Hosting | Any Node host, or `npm run dev` |

## Requirements

- Node.js 20 or newer
- npm

## Run locally (demo mode, no setup)

```bash
npm install
npm run dev          # http://localhost:3000  (redirects to /en)
npm run typecheck
npm run build
```

## Enable accounts (Firebase Auth + Firestore)

1. Create a project at https://console.firebase.google.com.
2. Add a **Web app** (the `</>` icon). Copy its config values into `.env.local`
   (see `.env.example`): API key, auth domain, project ID, app ID. These are public values.
3. **Authentication** -> Sign-in method -> enable **Email/Password**. `localhost` is an authorized domain by default;
   add your real domain under Settings -> Authorized domains before launch.
4. **Firestore Database** -> Create database (production mode, pick a region close to your users).
5. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # choose your project
   firebase deploy --only firestore:rules
   ```
6. Restart `npm run dev`. The login and sign-up pages now work and the app pages require login.

How data is stored: one Firestore document per user per feature at `users/{uid}/data/{key}`,
holding the feature's data as a JSON string. The rules in `firestore.rules` allow each user to read and write only
their own documents, only the six known keys, and cap each document at about 900 KB.

If you used demo mode first, the data in that browser is uploaded to your account the first time you sign in
(only when the account has none yet), then removed from the browser.

If loading from the cloud fails, saving is blocked until it succeeds, so stale data can never overwrite your real data.
A red notice tells the user when saving fails.

## Enable the live AI assistant

1. Get an API key from the Anthropic Console (https://console.anthropic.com). Usage is billed by Anthropic.
2. Put it in `.env.local` as `ANTHROPIC_API_KEY=...` and restart `npm run dev`.
3. Open the Study Assistant. The orange "demo replies" notice disappears when live AI is on.

Protections:

- The key is only read on the server (`src/app/api/chat/route.ts`); the browser never sees it.
- In accounts mode the route requires a valid Firebase ID token (verified with `firebase-admin`).
  In production, live AI only works in accounts mode, so an anonymous visitor can never spend your key.
- Limits: 15 requests per minute per user, 20 turns of history, 4,000 characters per message.
  The limiter is in memory per server instance. App Hosting can run several instances, so use a shared
  store (for example Redis or Firestore) before real traffic.
- Upstream error details are logged on the server and never sent to the browser.

Privacy: messages sent to the assistant go to Anthropic to generate replies. Say so in your privacy policy.

Default model is `claude-sonnet-5-5`; change it with `AI_MODEL`.

## Deploy to Firebase App Hosting

App Hosting runs the full Next.js server (needed for the AI route). It requires the **Blaze** (pay-as-you-go) plan,
which needs a billing account. There is free usage, but monitor costs and set a budget alert.

1. Push this project to a GitHub repository.
2. Fill the four `NEXT_PUBLIC_FIREBASE_*` values in `apphosting.yaml`.
3. Create the AI secret (skip if you do not use live AI, and delete that block in `apphosting.yaml`):
   ```bash
   firebase apphosting:secrets:set ANTHROPIC_API_KEY
   ```
4. In the Firebase console: App Hosting -> Get started -> connect the GitHub repo and branch.
   The backend ID must match `backendId` in `firebase.json` (`studymate-ai`) or change one of them.
5. Push to the branch to deploy. Add the deployed domain to Authentication -> Authorized domains.

## Routes

| Route | Page |
|---|---|
| `/en`, `/ar` | Landing page |
| `/{locale}/login`, `/{locale}/signup` | Accounts (only when Firebase is configured) |
| `/{locale}/dashboard` | Student dashboard |
| `/{locale}/study-assistant` | AI chat (live with a key, simulated otherwise) |
| `/{locale}/planner` | Weekly planner and tasks |
| `/{locale}/notes` | Notes with search, create, edit, delete |
| `/{locale}/flashcards` | Flip cards |
| `/{locale}/quizzes` | Multiple-choice quiz with scoring |
| `/{locale}/settings` | Account, language, theme, profile, notifications |

## Architecture

- `src/app/[locale]/` — routes; `(app)/` shares the sidebar shell, `(auth)/` the login layout.
- `src/features/` — one folder per feature (view + hooks).
- `src/components/` — `ui/` primitives, `layout/`, `navigation/`, `landing/`, `shared/`.
- `src/i18n/` — typed dictionaries. `ar.ts` must match the shape of `en.ts`, so a missing translation fails type-checking.
  Add every new string to both files.
- `src/hooks/useSyncedState.ts` — the one persistence hook used by every feature: Firestore when signed in,
  `localStorage` otherwise. Writes are debounced and flushed when the tab is hidden.
- `src/lib/firebase/` — config, browser client, and the server-side ID-token check.
- `src/services/ai/` — `AIProvider` interface, demo provider, and the remote provider that streams from `/api/chat`.
  `src/lib/ai/` holds the server-side prompt, validation and rate limit.
- `firestore.rules`, `firebase.json`, `apphosting.yaml` — database rules and hosting config.
- Styling uses logical Tailwind utilities (`ms-*`, `ps-*`, `start-*`) so layouts mirror automatically in RTL.

## Login protection, honestly

Firebase sessions cannot be verified inside Next.js middleware, so the app pages are guarded in the browser
(signed-out visitors are redirected to login). This is a convenience, not the security boundary. The real protection is:
Firestore rules (a user can only read and write their own documents) and ID-token verification on the AI route.
Do not put anything sensitive in the page code itself.

## Known limits

- Email and password only. No email verification, social login, or account deletion yet.
- Cloud sync is last-write-wins per feature: editing the same data on two devices at once can overwrite changes.
- Data is stored as one JSON value per feature per user. Fine for now; when you need queries across items
  (search, analytics, sharing), move tasks and notes into their own collections.
- Dashboard statistics, flashcards and the quiz use fixed sample data.
- Recommended before launch: Firebase App Check, a shared rate limiter, and a privacy policy.
- Not verified yet: `npm run build`, the Firebase sign-in flow, the Firestore rules (try them in the Rules Playground
  or emulator), and App Hosting deployment have not been run on this code.
