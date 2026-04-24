<div align="center">

# 💌 invitation-kit

**A config-driven open-source mobile wedding invitation template, optimized for Korean weddings**

Edit one config file, deploy in 5 minutes.

[Demo](https://invitation-kit.vercel.app) · [Quick Start](#-quick-start-in-5-minutes) · [Docs](./docs) · [Features](#-features)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

**English** · [한국어](./README.md)

</div>

---

## ✨ Why invitation-kit?

- 🎯 **One file to edit** — Change `invitation.config.ts` and the whole invitation updates
- 🇰🇷 **Built for Korean weddings** — KakaoTalk share cards, Kakao/Naver Map deeplinks baked in (guestbook, bank-account copy, and multi-theme are on the v1.0 roadmap)
- 💰 **Free forever** — ₩0/month on Vercel Hobby tier
- 🚫 **No ads, no watermarks** — It's your invitation
- 📱 **Mobile Safari first** — iOS 26 regressions discovered during builds are codified as permanent rules (see `CLAUDE.md` "애니메이션 사용 규칙" section)

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

Open `invitation.config.ts` and fill in your details. At minimum update `meta`, `groom`, `bride`, `date`, `venue`, and `share`. Detailed field types live at the top of the file.

### 3. Deploy + Kakao setup

1. **Vercel import**
   Push to GitHub, then import the repo on https://vercel.com/new → `Deploy`. A `your-project.vercel.app` URL is issued in 1–2 minutes.

2. **Update URLs in the config, then push again**
   In `invitation.config.ts`, replace the host of `meta.siteUrl` and `share.thumbnailUrl` with your Vercel domain. These values become the link targets of the Kakao share card.

3. **Kakao Developers console** (only if you want Kakao sharing; skip otherwise)
   Create an app at https://developers.kakao.com/console/app, then register your Vercel domain in **both** of these fields:
   - `[App] > Platform Keys > JavaScript Key > JavaScript SDK Domain` — allows `Kakao.init()`
   - `[App] > Product Link Management > Web Domain` — validates the `link.webUrl` host of share cards

   If you also enable the "Open in Map" button inside the share card, **add `https://map.kakao.com` to the Web Domain field as well**. Unregistered domains get stripped back to your default (see [`.claude/rules/kakao-sdk.md`](./.claude/rules/kakao-sdk.md) for the policy background).

   Copy your **JavaScript Key** from the `[App Keys]` page.

4. **Add the env var on Vercel, then redeploy**
   Vercel → Project Settings → Environment Variables: add `NEXT_PUBLIC_KAKAO_APP_KEY` = (your JS key) and check all three scopes (Production/Preview/Development). Save, then **Redeploy the latest deployment from the Deployments tab** — `NEXT_PUBLIC_*` vars are baked at build time, so a fresh build is required.

> ⚠️ **End-to-end Kakao share validation only works on a production Vercel domain with a real Kakao-installed device.** On localhost, LAN IPs, and Vercel previews, Kakao's policy replaces the card link host with the console default. Real verification requires the live Vercel URL + a phone.

🎉 **Your invitation is live.**

---

## 📦 Features

### Currently shipped (v0.1.0 in progress)

- 🏷 Main hero — groom & bride names
- ✉️ Greeting section
- 📍 Venue — address + Kakao/Naver Map deeplink buttons + transportation (subway/bus/car/parking)
- 💬 KakaoTalk share card — Kakao SDK v2.8.1, falls back to URL copy if SDK isn't ready

### v1.0.0 targets

- 📸 Photo gallery with lightbox
- 💰 One-tap bank-account copy
- ✍️ Guestbook (Firebase Firestore)
- ⏰ D-day countdown
- 📅 Add to Google Calendar
- 🎨 Multiple themes (Classic + 2 more)

### v1.1+ roadmap

- RSVP form
- Background music (respects silent mode)
- Web-based config editor
- Image optimization CLI

---

## 📖 Environment variables

Only **one** key is actually used today. Copy `.env.example` to `.env.local` and fill it in:

```env
# Required for Kakao share. Issue a JavaScript key from the Kakao Developers console.
# If left empty, the share button naturally falls back to URL-copy.
NEXT_PUBLIC_KAKAO_APP_KEY=
```

v1.0 will add `NEXT_PUBLIC_FIREBASE_*` keys for the guestbook / RSVP. See [Deploy + Kakao setup](#3-deploy--kakao-setup) for the key issuance flow.

---

## 🤝 Contributing

Issues, PRs, and theme submissions are all welcome.

- Report bugs: [Issues](../../issues)
- Suggest features / discussions: [Discussions](../../discussions)
- PRs: see the [PR template](./.github/PULL_REQUEST_TEMPLATE.md) checklist (mobile Safari verification, personal-data check).

A proper `CONTRIBUTING.md` and theme-authoring guide will land alongside the v1.0 release (when the multi-theme system ships).

---

## 📄 License

MIT © 2026 — Fork freely for your own or your friends' weddings 💍
