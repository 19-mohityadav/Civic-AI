# Civic AI — Advanced Civic Issue Reporting Platform

Welcome to **Civic AI**, a premium, high-fidelity, production-ready civic engagement and real-time issue reporting platform. This platform empowers citizens to report critical municipal problems (such as potholes, broken streetlights, illegal dumping, and water leakage) while enabling municipal officers and admins to review, triage, and resolve reports efficiently.

Civic AI utilizes cutting-edge web technology and Google Cloud/Firebase architecture to deliver a seamless, reactive, and secure experience.

---

## 🏗️ Architectural Overview & Core Pillars

Civic AI is built on a modern, responsive **React 18** Single Page Application architecture powered by **Vite**, **Tailwind CSS**, and **Framer Motion**, backed by a scalable **Serverless backend architecture** with **Google Firebase**.

```
                           +------------------------+
                           |  Civic AI Client (SPA) |
                           |   (React, Tailwind)    |
                           +-----------+------------+
                                       |
                                       | (Auth & Firestore SDKs)
                                       v
                     +----------------------------------+
                     |  Google Firebase Cloud Services  |
                     +----+------------------------+----+
                          |                        |
                          |                        |
                          v                        v
            +---------------------------+    +---------------------------+
            |  Firebase Authentication  |    |     Cloud Firestore       |
            |     (Google Sign-In)      |    |  (Multi-Database Instance)|
            +---------------------------+    +---------------------------+
```

### 1. Unified Authentication Engine
*   **Google Sign-In integration**: Realized natively using Firebase Client Auth via standard popup flows (`signInWithPopup` / `GoogleAuthProvider`).
*   **Role-Based Access Control (RBAC)**: Persists session states client-side and coordinates dynamic dashboard routing. Users sign in as either:
    *   **Citizen**: Can report new issues, upload evidence, track issue timelines, upvote community concerns, and view local hotspots.
    *   **Officer**: Accesses a privileged control console featuring ticket routing, department updates, resolution uploads, status changes, and priority queues.

### 2. High-Performance Geospatial Interface
*   **Google Maps React Components**: Powered by `@vis.gl/react-google-maps` to provide real-time location pinning and hotspot heatmaps.
*   **Intelligent Fallback Layer**: When API keys are absent, the platform serves a fully interactive vector map representation mapping actual issues onto dynamic canvas nodes, keeping the app interactive even during offline or sandboxed deployment states.

### 3. Serverless Cloud Databases
*   **Cloud Firestore Database**: Operating on custom, dedicated instances with optimal querying logic.
*   **Data Models & Collections**: Designed around flat, highly indexable structures for swift retrieval of issues, community comments, votes, and user badges.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 & TypeScript | Type-safe, declarative user interfaces with component modularity. |
| **Build Tooling** | Vite & TSX | Ultrafast hot-reloads and optimized tree-shaked production builds. |
| **Styling & UI** | Tailwind CSS & Lucide Icons | Responsive, high-contrast, beautiful mobile-first styling. |
| **Animations** | Framer Motion | Fluid screen transitions, modal fades, and interactive status changes. |
| **Database** | Google Cloud Firestore | High-availability, real-time, serverless NoSQL document database. |
| **Authentication** | Firebase Authentication | Secure federated login, session persistence, and token verification. |

---

## 🗄️ Firestore Database Schema

The Firestore database is structured to balance read performance and scalability, avoiding heavy subcollections where fast top-level filtering is required.

### `issues` Collection
Each reported issue is structured as follows:
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'POTHOLE' | 'GARBAGE' | 'WATER_LEAKAGE' | 'STREETLIGHT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'REPORTED' | 'ASSIGNED' | 'RESOLVED';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string; // ISO String
  upvotes: number;
  votesList: string[]; // User IDs who upvoted to prevent double voting
  comments: Comment[];
  evidenceUrl?: string; // Image/video path
  resolutionUrl?: string; // Proof of fix
  department?: string; // Assigned municipal department
}
```

### `users` Collection
Tracks user profiles, authentication metadata, and citizen gamification.
```typescript
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'CITIZEN' | 'OFFICER';
  points: number; // Gamification points for verified reports/fixes
  badges: string[]; // List of earned badges (e.g., "Pothole Patrol", "Civic Champion")
  joinedAt: string;
}
```

---

## 🔒 Enterprise-Grade Security Controls

1.  **Strict Firebase Security Rules**: Preventing unauthenticated document writing. Citizens can only write issues and comments with valid Auth state matches (`request.auth.uid != null`). Officers have edit controls over status and department variables.
2.  **API Key Safety**: Sensitive server-side keys are read exclusively through secure environment variables (`process.env` / `import.meta.env`).
3.  **Sanitization & Validation**: All user inputs (texts, uploads, titles) are filtered before persisting, preventing XSS and injection.

---

## 🚀 Deployment & Installation

### Prerequisite Environment Configuration
Create a `.env` file or export the following variables in your hosting environment:
```env
GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_key
```

### Development Execution
To start the application in development mode:
```bash
# 1. Install all required dependencies
npm install

# 2. Boot the ultra-fast Vite development server
npm run dev
```
The server will boot on port `3000` (externally proxy-routed).

### Production Build compilation
To build and optimize the application for production deployment:
```bash
# Compiles static resources to the dist/ directory
npm run build
```

---

## 🔮 Future Scalability Roadmaps
*   **Gemini AI Vertex Integration**: Automated image classification on upload (e.g., analyzing pothole pictures to predict depth/severity).
*   **BigQuery Reporting**: Pipelining issue lifecycles to BigQuery for regional hotspot heatmaps and municipal response latency tracking.
*   **Cloud Run Middlewares**: Creating microservices to dispatch SMS and email push updates automatically on status transitions.
