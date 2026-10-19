# HUKUM 2: The Sniper Protocol 🕶️🔥
*A 3D Tactical Action-Puzzle & Explosive Set-Piece Comedy*

[![Antigravity AI Engine](https://img.shields.io/badge/Antigravity-WebGL_3D_Engine-blue.svg)](https://github.com/skrangan/hukum2-the-sniper-protocol)
[![Render PostgreSQL](https://img.shields.io/badge/Render-PostgreSQL_16-emerald.svg)](https://render.com)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Graphics-orange.svg)](https://threejs.org)
[![Vite + React](https://img.shields.io/badge/Vite-React_18-cyan.svg)](https://vitejs.dev)

---

## 🎬 Overview

**HUKUM 2: The Sniper Protocol** is a 3D tactical action game inspired by the mass cinema blockbuster *Jailer*. Players take the role of **"Tiger" Muthuvel Pandian** (Superstar Rajinikanth), who refuses to run—he only power-walks with maximum composure. When situations spiral out of control, hitting `[SPACE]` triggers **The Spectacle Flip (Hukum Mode)**: time dilates into bullet-time, Anirudh-inspired synth bass drops, and rooftop red sniper lasers lock onto the opposition in explosive chain-reaction physics set-pieces.

---

## 🌟 The Cast

* 🕶️ **"Tiger" Muthuvel Pandian (Superstar Rajinikanth)**: Retired lawman patriarch with silver hair, groomed beard, and aviator shades.
* 👩‍🍳 **Viji (Tiger's Wife)**: Traditional matriarch in maroon silk saree; patrols the market with a dynamic vision cone.
* 🚕 **Vimal**: Quirky Goan getaway driver in a vibrant tropical shirt behind the wheel of his tourist taxi.
* 🚬 **Mathew (Mohanlal)**: Charismatic Kerala underworld ally in tailored vintage brown blazer and cigar.
* 🐅 **Narasimha (Shiva Rajkumar)**: Intense Karnataka syndicate kingpin in rain-slicked leather jacket.

---

## 🕹️ Core Gameplay Mechanics

1. **Phase A: Stealth Swagger Walk**:
   - Navigate the 3D market using `[WASD]` or Arrow keys.
   - Dodge wife Viji's dynamic vision cone light—if she catches you committing street violence, your suspicion gauge maxes out!
   - Interact with environmental hazards: kick stray coconuts (`[E]` or Click).

2. **Phase B: The Spectacle Flip (Hukum Mode)**:
   - Hit **`[SPACE]`** or click the gold **FLIP SPECS** button.
   - Triggers a 360° glasses flip spin, 50% bullet-time time dilation, and a heavy Anirudh 808 sub-bass drop.
   - Full chain reaction: *Coconut $\rightarrow$ Auto-Rickshaw handbrake release $\rightarrow$ Rickshaw rolls down incline $\rightarrow$ Smashes bike thugs $\rightarrow$ Ignites Diwali fireworks cart in a 3D particle fountain explosion!*
   - Multiplies score up to **HUKUM x10**!

3. **Dual-Subtitle Engine**:
   - **Primary Line (Bold Yellow)**: Romanized Tamil / Tanglish punchline.
   - **Secondary Line (Crisp White/Cyan)**: Witty English localization.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 18, Vite, Tailwind CSS (Glassmorphic HUD, Action Deck, Aura Meter).
* **3D Engine**: Three.js WebGL with soft shadows, dynamic lighting, and real-time physics.
* **Audio**: Procedural Web Audio API Synthesizer (bass drops, sniper rifle cracks, explosions, engine revs).
* **Backend**: Express.js (Node 20, TypeScript), Google OAuth 2.0 verification, JWT session management.
* **Database**: Render Managed PostgreSQL 16 (`profiles`, `level_progress`, `player_unlocks`).

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/skrangan/hukum2-the-sniper-protocol.git
cd hukum2-the-sniper-protocol

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Run database migrations to Render PostgreSQL
npx tsx server/src/migrate.ts

# 5. Launch full-stack environment
npm run dev
```

* **3D Game UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📜 Complete Specifications

For an exhaustive plot breakdown of all 10 chapters, database DDL, and complete asset inventories, refer to:
* [`SPECIFICATIONS_AND_INVENTORY.md`](./SPECIFICATIONS_AND_INVENTORY.md)
