<div align="center">

# 💌 invitation-kit

**A config-driven open-source mobile wedding invitation template, optimized for Korean weddings**

Edit one config file, deploy in 5 minutes.

[Demo](#) · [Quick Start](#-quick-start-in-5-minutes) · [Docs](./docs) · [Features](#-features)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

**English** · [한국어](./README.md)

</div>

---

## ✨ Why invitation-kit?

- 🎯 **One file to edit** — Change `invitation.config.ts` and the whole invitation updates
- 🇰🇷 **Built for Korean weddings** — KakaoTalk sharing, Naver/Kakao Maps, Korean bank-account copy baked in
- 🎨 **Multiple themes** — modern, classic, floral, minimal, vintage
- 💰 **Free forever** — ₩0/month on Vercel + Firebase free tier
- 🚫 **No ads, no watermarks** — It's your invitation
- 📱 **Fully responsive** — Works flawlessly on mobile Safari/Chrome

---

## 🚀 Quick Start in 5 Minutes

### 1. Fork & Clone

Click **Fork** at the top-right, then:

```bash
git clone https://github.com/YOUR_USERNAME/invitation-kit.git
cd invitation-kit
npm install
```

### 2. Edit the config

Open `invitation.config.ts` and fill in your details.

### 3. Add your photos

Drop photos into `public/images/gallery/`.

### 4. Deploy

Push to GitHub, then import the repo on [Vercel](https://vercel.com/new).

🎉 **Your invitation is live.**

---

## 📦 Features

### v0.1.0 (MVP)

- 📸 Photo gallery with lightbox
- 📍 Venue map buttons (Naver / Kakao / Google)
- 💰 One-tap bank-account copy
- 💬 KakaoTalk share + URL copy

### v1.0.0

- ✍️ Guestbook (Firebase Firestore)
- ⏰ D-day countdown
- 📅 Add to Google Calendar
- 🎨 3+ themes

### Roadmap (v1.1+)

- RSVP form
- Background music (respects silent mode)
- Web-based config editor
- Image optimization CLI

---

## 📖 Configuration

See the [configuration guide](./docs/config-guide.md) for all options.

### Required environment variables

```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_js_key
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_id
NEXT_PUBLIC_SITE_URL=https://yoursite.vercel.app

# Only for guestbook
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

How to get each key: [API key guide](./docs/api-keys.md).

---

## 🤝 Contributing

Issues, PRs, and theme submissions are all welcome.

- Report bugs: [Issues](../../issues)
- Suggest features: [Discussions](../../discussions)
- Submit a new theme: [Theme guide](./docs/theme-guide.md)

---

## 📄 License

MIT © 2026 — Fork freely for your own or your friends' weddings 💍
