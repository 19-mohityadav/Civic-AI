# Civic AI — Advanced Civic Issue Reporting Platform

Civic AI is an AI-augmented civic engagement web application that lets citizens report municipal issues, and helps municipal officers triage and resolve them faster. It combines a reactive React+Vite frontend, Firebase for auth and realtime storage, and a small Node/Express edge server that integrates Google GenAI (Gemini) to automatically analyze submissions (image + text) and suggest structured metadata (category, severity, urgency, title, description).

## Quick overview
- Purpose: Enable citizens to report local problems (potholes, broken streetlights, water leaks, illegal dumping, etc.), provide evidence, and track resolution. Officers get a management console to assign and resolve issues.
- Who uses it: Municipal teams, civic tech organizations, and community volunteers.
- Key differentiator: Multimodal AI analysis (Gemini) for automated classification + real-time Firestore syncing.

---

## Stack
- Language: TypeScript (frontend + server)
- Framework / runtime:
  - Frontend: React (v19) + Vite (App SPA)
  - Server: Node (Express) used as a dev middleware and to host an AI analysis endpoint
- Notable libraries:
  - Firebase (Auth + Firestore)
  - @google/genai (Gemini) for multimodal analysis
  - Framer Motion for animations
  - @vis.gl/react-google-maps for geospatial UI
  - Tailwind CSS for styling

---

## Repository layout
```
.
├── package.json            # scripts and dependencies
├── server.ts               # small Express server + Vite middleware + Gemini endpoint
├── index.html              # Vite entry HTML
├── vite.config.ts          # Vite config
├── tsconfig.json
├── .env.example            # example env vars
├── firestore.rules         # Firebase security rules (simple)
├── firebase-blueprint.json # Firebase project blueprint / suggested config
├── src/
│   ├── main.tsx            # front-end entry
│   ├── App.tsx             # top-level SPA component, router by hash
│   ├── types.ts            # shared domain types (Issue, enums)
│   ├── lib/
│   │   └── firebase.ts     # firebase init + helpers
│   ├── components/         # UI components (Landing, ReportIssue, Dashboard, etc.)
│   ├── data/               # seeded/mock data (mockIssues)
│   └── index.css
└── metadata.json
```

How it fits together:
- The SPA runs in the browser and uses Firebase Auth + Firestore for realtime data and persistence.
- server.ts exposes a small API (POST /api/analyze-issue) that sends uploaded media/text to Gemini and returns a structured JSON analysis.
- During development, Vite middleware (server.ts) serves the app and proxies SPA requests; in production builds the frontend artifacts are built to `dist/` and served statically by the Node server.

---

## Data model (high-level)
Issues are stored in Firestore in an `issues` collection. Representative fields:
```ts
interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'POTHOLE'|'STREETLIGHT'|'GARBAGE'|'WATER_LEAK'|'DRAINAGE'|'OTHER';
  severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
  status: 'REPORTED'|'ASSIGNED'|'IN_PROGRESS'|'VERIFIED'|'RESOLVED';
  location: { lat:number, lng:number, address:string };
  reporterId: string;
  reporterName: string;
  mediaUrl?: string;
  createdAt: number; // epoch ms
  updatedAt?: number;
  votes?: number;
  verificationCount?: number;
}
```
See `src/types.ts` and `src/data/mockIssues.ts` for concrete enums and seeded examples.

---

## API — AI analysis
POST /api/analyze-issue
- Purpose: Analyze an uploaded image (or text) and return a structured classification that the UI can use to auto-fill fields.
- Request body (JSON):
```json
{
  "file": "<base64-data-or-data-url>", 
  "mimeType": "image/jpeg",
  "textDescription": "There is a large pothole near the intersection..."
}
```
- Response (application/json) schema (example):
```json
{
  "isCivicIssue": true,
  "category": "POTHOLE",
  "severity": "HIGH",
  "title": "Large pothole on Elm St near 4th Ave",
  "description": "Deep pothole causing drainage issues and vehicle damage. Located on the curbside...",
  "isUrgent": false
}
```
- Implementation note: server.ts builds a Gemini prompt and requests a JSON response using `@google/genai` (model: `gemini-3.5-flash`).

Example curl (replace placeholders):
```bash
curl -X POST http://localhost:3000/api/analyze-issue \
  -H "Content-Type: application/json" \
  -d '{
    "textDescription":"Large pothole near corner by the bus stop",
    "file": null,
    "mimeType": null
  }'
```

---

## Environment variables
Frontend environment (Vite, use VITE_ prefix — set in your hosting or .env):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_FIRESTORE_DATABASE_ID (optional/custom DB id used in src/lib/firebase.ts)

Server-side:
- GEMINI_API_KEY (used by server.ts to call Google GenAI)
- GOOGLE_MAPS_PLATFORM_KEY (optional map features)
You can copy `.env.example` to `.env` and fill values for local development.

Security note: do not commit keys into source control. Use secret managers or host-provided env-vars in production.

---

## Development — quick start
1. Install dependencies
```bash
npm install
```
2. Start development server (runs Express + Vite middleware):
```bash
npm run dev
# this runs: tsx server.ts
# server listens on port 3000 by default
```
3. Open http://localhost:3000

Build & run production:
```bash
npm run build
npm run start
# npm run build runs: vite build && esbuild server.ts --bundle ... -> dist/
# npm run start runs: node dist/server.cjs
```

Useful scripts from package.json:
- dev — tsx server.ts (dev server)
- build — vite build + esbuild bundle of server
- start — node dist/server.cjs
- lint — tsc --noEmit

---

## Firebase setup (basic)
- Create a Firebase project, enable Authentication (Google provider), and Firestore.
- Optionally configure storage for media uploads.
- Copy Firebase config values into Vite env vars (VITE_FIREBASE_...).
- Review and adapt `firestore.rules` to match your desired access model (the repo includes a starter `firestore.rules`).

---

## Deployment recommendations
- Static frontend: build with `npm run build`. Host on any static host (Cloud Run, Vercel, Netlify) — if you use a server to host the AI endpoint, prefer Cloud Run or Cloud Run Jobs.
- Server & AI: the server requires a node runtime and the GEMINI_API_KEY. For production, run server in Cloud Run or a small Node container (set env vars via platform secrets).
- Scale considerations: the Gemini calls may be rate- or cost-sensitive; consider queueing or batching for high traffic and add caching for repeated analyzes.

---

## Security & privacy
- Authentication: Firebase Authentication (Google Sign-In).
- Firestore rules included as a starting point; validate and test rules with the Firebase emulator before production.
- Media & PII: ensure media and user data are stored and transmitted using HTTPS and encrypted storage; consider retention and GDPR/PDPA requirements for your jurisdiction.

---

## Developer notes & future roadmap
- AI: Integration is centered on `@google/genai` using `gemini-3.5-flash` for structured JSON responses. You can swap model or refine prompt in `server.ts`.
- Analytics: plan to export issue lifecycle events to BigQuery / dashboards.
- Microservices: consider moving AI and notification dispatch to independent Cloud Run services for isolation and easier scaling.
- Add tests: unit tests and integration tests for Firestore operations and the AI endpoint would increase confidence.

---

## Contributing
- Feel free to open issues or PRs. Suggested workflow:
  1. Fork and create a feature branch.
  2. Run `npm install` and `npm run dev`.
  3. Ensure TypeScript compiles (`npm run lint`).
  4. Open a PR with a clear description; add screenshots where UI changes exist.

---

## License
This repository uses the Apache-2.0 license headers in source files; include a top-level LICENSE file if you want to explicitly publish under Apache-2.0.

---

## Try asking
- "Where in the code is the Gemini analysis prompt defined?" — see `server.ts` (search for `Analyze this civic / municipal issue submission`).
- "How are Firebase environment variables read by the frontend?" — see `src/lib/firebase.ts` (uses `import.meta.env.VITE_FIREBASE_*`).
- "How do I seed mock data into Firestore locally?" — `src/App.tsx` seeds `mockIssues` when the `issues` collection is empty; adapt for emulator use.

---

If you'd like, I can:
- produce a ready-to-commit patch for this README.md and create a branch + PR,
- or generate smaller README variants (short summary vs. full engineering README).
