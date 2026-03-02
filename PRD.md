# 🚀 Ultimate Product Requirements Document (PRD v2.0)
**Product Name:** Resume2Portfolio AI
**Tagline:** "Turn your Resume into a Stunning Website in 60 seconds."

---

## 1️⃣ Product Vision & Evolution (V2.0)
We have successfully built the core MVP: Upload a resume, parse it with AI, and generate a live portfolio. 
**Phase 2 (The "Ultimate" Polish)** focuses on removing all friction (Google Sign-In), elevating the UI to world-class standards (Linear/Framer vibes), and adding power-user features.

---

## 2️⃣ Core Enhancements

### 🔹 1. Seamless Authentication (Google Sign-In)
**Goal:** Reduce friction so users can start generating portfolios in one click.
- **Frontend Integration:** Implement `@react-oauth/google` for a sleek "Continue with Google" button on the Auth pages.
- **Backend Flow:** FastAPI endpoint to verify the Google Identity Token, map it to our internal `users` table, and issue our standard JWT.
- **Auto-Account Creation:** If a user logs in via Google and doesn't exist, instantly create an account and jump straight to the Upload screen.

### 🔹 2. Ultimate UI/UX Polish (Inspirations)
**Goal:** The application should feel like a premium SaaS product (e.g., Vercel, Linear, Framer).
- **Typography:** Switch to premium, highly legible fonts like `Inter`, `Geist`, or `Outfit`.
- **Micro-interactions:** Integrate `framer-motion` for fluid page transitions, spring-animated modals, and subtle hover lifts on project cards.
- **Glassmorphism & Glows:** Use subtle background blurs on navigation bars and glowing radial gradients (dark mode) typical of modern DevTools.
- **Editor Experience:** Move towards a "Notion-like" inline editing experience. Instead of forms, users click directly on the generated portfolio text to edit it in place.
- **Empty States & Skeletons:** Animated shimmer effects whenever AI is generating content, alongside engaging loading text ("Reading your experience...", "Designing your hero section...").

### 🔹 3. Advanced AI Enhancements
- **"Tone of Voice" Selection:** Before generating, users can pick a vibe: *Professional & Corporate*, *Creative & Bold*, or *Startup Hacker*. Groq AI will tailor the web copy accordingly.
- **AI "Rewrite this" Button:** Highlight any sentence on the generated portfolio and click an AI flair icon to make it sound more impactful or fix grammar.
- **Automated Social Links:** AI attempts to extract GitHub, LinkedIn, and Twitter links directly from the PDF and pre-fills the social footer.

### 🔹 4. Pro Features (Business Expansion)
- **Visitor Analytics:** A dashboard showing the user how many people visited their public portfolio, where they came from (Referrers), and what device they used.
- **Custom Domains:** Allow users to map their own domain (e.g., `santosh-builder.com`) instead of the `.vercel.app` subdomain.
- **Export Back to PDF:** A feature to take the beautifully AI-enhanced portfolio and export it back into a stunning, single-page PDF resume using `html2pdf`.

---

## 3️⃣ Updated Tech Stack & Libraries
- **Frontend:** React (Vite), TailwindCSS, shadcn/ui, `framer-motion` (animations), `@react-oauth/google` (Sign-in), `lucide-react` (icons).
- **Backend:** FastAPI, PostgreSQL (Neon), `authlib` or `google-auth` (for validating tokens), Groq API (llama3-70b/8b).
- **Infrastucture:** Vercel (Hosting).

---

## 4️⃣ Development Roadmap for V2

### 📍 Milestone 1: Frictionless Auth
- [ ] Register Google Cloud Console project and obtain `Client ID`.
- [ ] Add Google Auth button to React Frontend.
- [ ] Create `/auth/google` endpoint in FastAPI backend.
- [ ] Merge Google Users with existing Email/Password users safely.

### 📍 Milestone 2: UI/UX Overhaul
- [ ] Install `framer-motion` and add page-level transition animations.
- [ ] Replace standard shadows with colored, subtle glows (especially in Dark Mode).
- [ ] Implement "Inline Editing" mode in the Portfolio Editor (clicking text opens a quiet input field).
- [ ] Add smooth skeleton loaders to the Resume Upload → Generation wait screen.

### 📍 Milestone 3: AI & Value Props
- [ ] Add "Tone Selection" drop-down in the upload page (passes tone variable to Groq prompt).
- [ ] Implement the UI for "Visitor Analytics" (Requires new DB table `page_views`).
- [ ] Add social sharing metadata (OpenGraph images) so links look beautiful when shared on LinkedIn/Twitter.

---

## 🎨 Vibe & Inspiration Board
*   **Vercel.com:** Clean lines, stark contrasts, absolute minimal noise. Information hierarchy is perfect.
*   **Linear.app:** The pinnacle of dark mode. Subtle purple/blue glows, sharp borders, incredibly fast interactions.
*   **Raycast / Notion:** Keyboard accessible, commands feel instantaneous.

> **Next Step for Developer:** Begin with Milestone 1 (Google Auth) while researching the necessary UI components for the UX overhaul.