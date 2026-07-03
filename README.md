# Loop - Stay in the Loop 🔁

Loop is a modern, high-performance habit tracking web application designed to help users build consistency through thoughtful UX, premium minimal design, and fluid transitions. Inspired by SaaS products like Linear, Notion, and Stripe, Loop provides a distraction-free space for habit formation.

> **Note**: This repository contains the scalable architecture foundation for Loop. Core habit tracking database integrations will follow in subsequent phases.

---

## 🚀 Tech Stack

- **Core Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) (Client UI, toast, and auth states)
- **Data Fetching/Caching**: [TanStack Query v5 (React Query)](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Database / Auth SDK**: [Firebase Web SDK](https://firebase.google.com/)
- **Linting & Formatting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

---

## 📂 Folder Structure

The project is structured to scale cleanly for feature development:

```text
src/
├── app/                  # Next.js App Router Pages, layouts, and style imports
│   ├── (auth)/           # Auth layout & pages (login, signup, forgot-password, reset-password, verify-email)
│   ├── (dashboard)/      # Protected dashboard shell & widgets
│   └── (marketing)/      # Landing page, public headers, and footer
├── components/           # UI Elements
│   ├── ui/               # Lower-level shadcn/ui components (cards, buttons, input)
│   ├── common/           # Shared components (theme-toggle, custom spinner, logo, auth-listener)
│   └── layout/           # Global navigation wrappers
├── features/             # Modular feature-driven domains
│   └── auth/             # Authentication system (schemas, types, services, components)
├── hooks/                # Custom React hooks
├── lib/                  # Shared library clients (Firebase configuration, query client)
├── providers/            # Global client-side provider wrapper
├── services/             # API services and asynchronous operations
├── store/                # Zustand stores (UI toggles, toast notifications, auth states)
├── styles/               # Global styles (globals.css is in app/)
├── types/                # Shared TypeScript models and interface scopes
└── utils/                # General utility helper methods
```

---

## ⚙️ Environment Variables

A `.env.example` file is included in the project root. Copy it to `.env.local` to configure your Firebase Client credentials:

```bash
cp .env.example .env.local
```

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

*Note: The Firebase module has client verification hooks configured, meaning it logs warning parameters to the browser console and switches to safe mock modes if environment credentials are not present, avoiding application crashes.*

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 3. Lint & Format Code
```bash
# Run linting check
npm run lint

# Run prettier formatting check
npx prettier --check .
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Authentication System

Loop features a production-ready authentication system leveraging **Firebase Authentication** for session and credential management, and **Cloud Firestore** for user profile synchronization.

### Core Features
- **Sign Up**: Registers users in Firebase, sends a verification email, and commits a structured user profile to the Firestore `users` collection.
- **Login**: Enforces credentials, gates unverified email accounts, and configures persistent login.
- **Remember Me**: Dynamically assigns token session persistence based on checkbox selection: `browserLocalPersistence` (remains logged in across sessions) or `browserSessionPersistence` (clears credentials when browser is closed).
- **Google Sign-In**: Creates Firestore user records for new users and synchronizes verification/active metadata.
- **Email Verification**: Redirection gate that restricts dashboard access. A background listener polls Firebase Auth status to automatically redirect verified users to `/dashboard` once they click the action link.
- **Password Recovery**: Seamless, secure flows for requesting reset emails and confirming password overrides.
- **Client Route Guards**: Layout-level middlewares that enforce strict path accessibility rules based on the user's active session state and verification status.

### Component Map
- `src/features/auth/schemas/index.ts`: Form validation constraints using **Zod**.
- `src/features/auth/types/index.ts`: Inferred TypeScript schemas and custom interface contracts.
- `src/features/auth/services/auth-service.ts`: Service actions wrapping Firebase SDK and Firestore database operations.
- `src/features/auth/components/*`: Reusable premium visual form components (Framer Motion animations, password strength segments).
- `src/components/common/auth-listener.tsx`: Session synchronization hook that updates Zustand's state store in response to Firebase Auth events.

---

## 📈 Future Roadmap

1. **Habit Database Schema**: Define Firestore collections and rules to store, retrieve, and update user habits.
2. **Analytics Dashboard**: Integrate TanStack Query hooks to fetch monthly and yearly habit consistency heatmaps.
3. **Offline Support**: Introduce service workers and persist Zustand store variables for offline usability.
4. **Additional Identity Providers**: Extend single sign-on capabilities to support GitHub and Apple accounts.
