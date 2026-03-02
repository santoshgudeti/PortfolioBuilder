# 🚀 PRD — Phase 3: Auth Safety, Email Verification & Power Features
**Product:** Resume2Portfolio AI  
**Builds on:** PRD V2.0 (Google Auth, UI/UX Polish, AI Tones — all complete ✅)

---

## 1️⃣ Auth Provider Conflict Guards

### Current State
| Scenario | Status |
|---|---|
| Google user tries email/password login | ✅ Already handled — returns "Please use Google to sign in" |
| Email user tries Google OAuth login | ❌ **Not guarded** — silently lets them through |
| Email verification after registration | ❌ Not implemented |

### Required Changes

#### 🔹 A. Guard: Email/Password user tries Google Sign-In
- Backend detects `auth_provider == "email"` for that email
- Returns: `"This account was created with email & password. Please use the standard login."`
- Frontend shows a toast with this message

#### 🔹 B. Guard: Google user tries email/password login
**Already implemented** ✅

#### 🔹 C. Email Verification After Registration
1. Add `is_verified` column to `users` table (default `False`)
2. On email/password registration → send verification email with a unique token link
3. User clicks link → backend sets `is_verified = True`
4. Until verified, dashboard shows a **yellow banner**: "Please verify your email"
5. Google users are **auto-verified** (Google already verified their email)
6. Unverified users can browse but **cannot generate a portfolio** until verified

### 📧 Email Service Configuration

**Method:** Gmail SMTP via `fastapi-mail` (Python library, since backend is FastAPI — not nodemailer)

| Setting | Value |
|---|---|
| **Sender Account** | `santoshgudeti@gmail.com` |
| **Role** | Admin account — sends all verification & reset emails |
| **SMTP Server** | `smtp.gmail.com` |
| **Port** | `587` (TLS) |
| **Auth** | Gmail App Password (NOT your regular password) |

> [!IMPORTANT]
> **Gmail App Password Setup (Required):**
> 1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
> 2. Enable **2-Step Verification** (if not already)
> 3. Go to **App passwords** → Generate one for "Mail"
> 4. Copy the 16-character password
> 5. Add to `backend/.env`:
> ```
> MAIL_USERNAME=santoshgudeti@gmail.com
> MAIL_PASSWORD=xxxx xxxx xxxx xxxx
> MAIL_FROM=santoshgudeti@gmail.com
> ```

**Email Templates:**
- **Verification:** "Welcome to Resume2Portfolio AI! Click here to verify your email."
- **Password Reset:** "Click here to reset your password. This link expires in 30 minutes."
- **All emails** sent from: `Resume2Portfolio AI <santoshgudeti@gmail.com>`

---

## 2️⃣ Additional Enhancements

### 🔹 D. Password Reset / Forgot Password
- "Forgot Password?" link on login page
- Backend generates a reset token → sends reset link via email
- User clicks link → sets new password
- Reuses the same email service as verification

### 🔹 E. Google Profile Photo
- Save `idinfo['picture']` from Google OAuth response
- Add `avatar_url` column to `users` table
- Display avatar in navbar, dashboard greeting, and public portfolio

### 🔹 F. Portfolio Analytics Dashboard
- Track visits with a new `page_views` table: `id, portfolio_id, viewed_at, referrer, user_agent`
- New `/analytics` page showing:
  - Total views (last 7 days chart)
  - Referrer breakdown (LinkedIn, Twitter, Direct)
  - Device breakdown (mobile vs desktop)

### 🔹 G. OpenGraph Social Previews
- Add `<meta og:title>`, `<meta og:description>`, `<meta og:image>` to public portfolio
- When shared on LinkedIn/Twitter → shows name, tagline, and branded preview

### 🔹 H. Resume PDF Download
- "Download as PDF" button on public portfolio
- Uses `html2pdf.js` to convert the rendered portfolio to a styled PDF
- Useful for recruiters

---

## 3️⃣ Priority & Effort

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Auth provider conflict guard | 30 min | Prevents account confusion |
| 🔴 P0 | Email verification | 2–3 hrs | Professional trust signal |
| 🟡 P1 | Forgot password flow | 1–2 hrs | Expected by all users |
| 🟡 P1 | Google profile photo | 30 min | Visual polish |
| 🟢 P2 | Portfolio analytics page | 3–4 hrs | Value-add feature |
| 🟢 P2 | OpenGraph social previews | 1 hr | LinkedIn/Twitter sharing |
| 🟢 P3 | Resume PDF download | 1 hr | Nice-to-have |

---

## 4️⃣ Recommended Implementation Order

1. **Auth provider conflict guard** → quick fix in `auth.py`
2. **Email verification** → needs SMTP setup + new DB column + email template
3. **Forgot password** → reuses the same email service
4. **Google profile photo** → quick addition to OAuth flow
5. **Analytics dashboard** → new page + DB table
6. **OpenGraph previews** → meta tags on public portfolio
7. **PDF download** → frontend-only with `html2pdf.js`
