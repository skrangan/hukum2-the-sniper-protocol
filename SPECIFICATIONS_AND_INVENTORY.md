# HUKUM 2: The Sniper Protocol
## Complete Technical Specification, Game Plot & Inventory Document
*Last Updated: October 2026 | Antigravity AI Engine*

> **Purpose:** This document contains the single source of truth for the entire *Hukum 2: The Sniper Protocol* codebase, database schema, game plot, 3D mechanics, audio engine, and asset inventory. If environment tokens expire or the project needs to be recreated from scratch, this file contains everything required to reproduce the exact system.

---

## 1. System Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│              Client Layer (Vite + React 18)               │
│  - Three.js 3D Canvas (WebGL, Shadows, Dynamic Lighting)  │
│  - Web Audio API Synthesizer (Anirudh Bass Drops & SFX)   │
│  - Dual-Subtitle Engine (Bold Yellow Tanglish + English)  │
│  - Glassmorphic Action Deck, Aura Meter & Modals          │
└─────────────────────────────┬─────────────────────────────┘
                              │ REST APIs (JWT Auth)
                              ▼
┌───────────────────────────────────────────────────────────┐
│          Backend Server (Node.js / Express / TS)          │
│  - Google OAuth token verification (google-auth-library)  │
│  - Guest session generator & JWT signer (jsonwebtoken)    │
│  - Endpoints: /api/auth, /api/player, /api/leaderboard    │
│  - Render Blueprint deployment configuration (render.yaml)│
└─────────────────────────────┬─────────────────────────────┘
                              │ PostgreSQL Connection Pool (pg)
                              ▼
┌───────────────────────────────────────────────────────────┐
│            Database Layer (Render PostgreSQL 16)          │
│  - Database: hukum2 (Oregon Region)                       │
│  - Tables: profiles, level_progress, player_unlocks       │
│  - IP Allow List: 0.0.0.0/0 (Public external access)      │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure & Database Specification

### 2.1 Render Database Instance
- **Database Name:** `hukum2`
- **Database User:** `hukum2_user`
- **Version:** PostgreSQL 16
- **Region:** Oregon (`oregon-postgres.render.com`)
- **Render Service ID:** `dpg-dbalgf5g1s2s73cii0vg-a`

### 2.2 Complete SQL Migration Schema (`server/src/schema.sql`)
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id VARCHAR(64) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_subtitle_mode TEXT DEFAULT 'tanglish_with_english',
  total_aura_score BIGINT DEFAULT 0,
  highest_level_unlocked INT DEFAULT 1 CHECK (highest_level_unlocked BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-level user progress
CREATE TABLE IF NOT EXISTS public.level_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 10),
  status TEXT DEFAULT 'unlocked',
  best_aura_score INT DEFAULT 0,
  stars_earned INT DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  fastest_clear_time_ms INT,
  spectacle_flips_used INT DEFAULT 0,
  cameos_used JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_number)
);

-- Cameo and cosmetics unlock tracking
CREATE TABLE IF NOT EXISTS public.player_unlocks (
  user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  unlocked_cameos JSONB DEFAULT '["vimal_taxi"]'::jsonb,
  unlocked_outfits JSONB DEFAULT '["driver_veshti"]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_aura ON public.profiles(total_aura_score DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.level_progress(user_id);
```

---

## 3. Full Game Plot & 10-Chapter Campaign Specification

| Level | Title (Tanglish) | Title (English) | Setting | Motive & Set-Piece | Available Cameos |
|---|---|---|---|---|---|
| **1** | *"Amaithiya Irukkurathu Bayam Illa, Athu En Style"* | "Being quiet isn't fear, it's just my style." | Neighborhood Market & School Crossing | Kick coconut into auto-rickshaw handbrake -> rolls down incline -> crushes 4 bike thugs -> explodes fireworks cart while dodging wife Viji's vision cone. | `vimal_taxi` |
| **2** | *"Moorthy Sir Udane Paakkanumam"* | "Moorthy Sir demands an audience with you immediately." | Narrow Suspension Bridge over River | Call distant hill snipers to shoot SUV fuel caps; shockwave bounces car keys to Vimal while Moorthy thinks he intimidated the mob. | `vimal_taxi` |
| **3** | *"Oru Sun, Oru Moon... Puriyutha?"* | "There's only one Sun and one Moon... Do you get the hierarchy?" | Dusty Highway Tea Stall | Boiling Kettle Rhythm Shootout: Whistle every 4s; disarm 12 machete goons with sniper fire on red steam gauge. | `vimal_taxi` |
| **4** | *"24 Mani Nerathula... Alapara Kelapparom"* | "In 24 hours... we unleash total mayhem." | Kochi Port Container Yard at Night | Hack magnetic cranes to drop shipping containers behind Dileep's armored jeep; hoist jeep onto Madagascar cargo ship. | `vimal_taxi` |
| **5** | *"Tea-ya, Coffee-ya? Neenga Decide Panna Mudiyathu"* | "Tea or Coffee? You don't even get to decide if you'll survive the sip." | Kantha Kalpak's Portuguese Mansion | Swap poisoned tea cups, spam Kantha's phone with WhatsApp forwards, spin lazy-Susan, reflect sniper laser off teapot to drop chandelier. | `vimal_taxi` |
| **6** | *"Jailer Mattum Thaan Sniper Vaippana?"* | "Does only the Jailer have a monopoly on snipers?" | Neon Goan Street Carnival & Ferris Wheel | Maneuver Vimal's chrome-hooded taxi and parade mirrors to reflect Bodhi's green laser counter-snipers into his firework trucks. | `vimal_taxi` |
| **7** | *"Puli Padhungurathu Paayurathukku Thaan"* | "The Tiger crouches only to pounce harder." | Fortified Safe House Compound | Trio defense: Switch dynamically between Tiger (Overwatch), Narasimha (Melee Hurricane), and Mathew (Vintage Mercedes wrecking ball). | `narasimha_melee`, `mathew_mercedes` |
| **8** | *"Naan Paatha Velai Vera... Paakura Velai Vera"* | "The job I retired from was brutal... what I'm about to do is worse." | Kalpak Luxury Casino Cruise Ship | Bass-Drop Sabotage: Detonate vault charges and launch loot crates onto Vimal's speedboat exactly on the DJ's bass drops. | `vimal_taxi` |
| **9** | *"50 Varushama Enna Azhikka Paarthanga..."* | "For 50 years, legends tried to finish me... none survived." | Goa Private Airstrip Runway at Sunset | 360° Overwatch: Hold center ground without stepping back; trigger jet turbines and luggage catapults; call Roddy's Helicopter Strafe. | `roddy_helo` |
| **10** | *"Hukum... Tiger Ka Hukum!"* | "The Verdict... Is Tiger's Alone!" | Kalpak Fortress Penthouse & Helipad | 3-Stage Showdown: Stage 1 (Kantha laser deflection), Stage 2 (Bodhi drone hijack), Stage 3 (QTE H-U-K-U-M 10-sniper simultaneous volley). | All Cameos |

---

## 4. Asset & Module Inventory

### 4.1 3D Engine Modules (`src/game/three/`)
- `ThreeGameManager.ts`: Master Three.js WebGL renderer, perspective camera, shadow maps, ambient & directional lighting, loop orchestrator.
- `MarketScene3D.ts`: 3D environment builder:
  - Procedural 3D Asphalt Street with road markings and yellow curb stones.
  - 3D Tiger Muthuvel Pandian character model (white linen shirt, pleated veshti, silver hair & beard, dark aviator glasses).
  - 3D Auto-Rickshaw model (hierarchical mesh with yellow canopy, green body, headlights, rotating wheels).
  - 3D Coconut model with real-time sphere roll physics.
  - 3D Fireworks Cart with Diwali rocket tubes and dynamic particle explosion emitters.
  - 3D Thug characters with ragdoll impact animation.
  - 3D Patrolling Viji model with real-time projected volumetric vision cone light.
  - 3D Sniper Laser System with glowing red beam crosshairs.

### 4.2 Web Audio Synthesizer (`src/game/audio/SoundManager.ts`)
- `playSpectacleFlipBassDrop()`: Distorted 808 sub-bass pitch drop (140Hz -> 32Hz) with metallic glasses flip chime.
- `playSniperShot()`: High-frequency filtered noise crack with low-end punch.
- `playExplosion()`: Low-pass filtered noise burst with exponential decay.
- `playCoconutKick()`: Triangle-wave hollow thud.
- `playRickshawRoll()`: Modulated sawtooth engine rev.
- `playVictoryFanfare()`: Multi-oscillator brass fanfare.
- `startCinematicBgm()`: 124 BPM driving synth bass pulse.

### 4.3 UI & HUD Components (`src/components/`)
- `NavbarAuth.tsx`: Top header with player profile, Render DB sync indicator, level select button, sound toggle.
- `AuraMeterHUD.tsx`: Top-left composure meter, multiplier indicator, Viji vision gauge.
- `DualSubtitleHUD.tsx`: Bottom-center dialogue box (Tanglish yellow line + English subtitle).
- `ActionDeckHUD.tsx`: Bottom-right Spectacle Flip button and tactical hotkeys (`[1]`, `[2]`, `[3]`).
- `VictoryModal.tsx`: Post-level summary showing stars, aura points, clear times, and PostgreSQL sync status.
- `LeaderboardModal.tsx`: Live top 25 global rankings fetched directly from Render PostgreSQL.
- `LevelSelectModal.tsx`: Interactive selector for Chapters 1 through 10.
- `IntroVideoModal.tsx`: Cinematic introduction video cutscene with mass audio buildup and character introductions.

---

## 5. How to Recreate & Run the Entire Project

```bash
# 1. Clone or enter directory
cd "/Users/skrangan/Documents/Hukum 2"

# 2. Install dependencies
npm install

# 3. Verify .env file (Render PostgreSQL Connection)
cat << 'EOF' > .env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://hukum2_user:2aGsfoxmRmDy4m2ov3QBYejB9RCUyHy1@dpg-dbalgf5g1s2s73cii0vg-a.oregon-postgres.render.com:5432/hukum2?ssl=true
RENDER_INTERNAL_DATABASE_URL=postgresql://hukum2_user:2aGsfoxmRmDy4m2ov3QBYejB9RCUyHy1@dpg-dbalgf5g1s2s73cii0vg-a/hukum2
JWT_SECRET=tiger_muthuvel_pandian_hukum_secret_key_2026_mass
VITE_GOOGLE_CLIENT_ID=
EOF

# 4. Run database migrations to Render PostgreSQL
npx tsx server/src/migrate.ts

# 5. Build full-stack client and server
npm run build

# 6. Launch full-stack development environment
npm run dev
# Frontend live at: http://localhost:3000
# Backend API live at: http://localhost:5001/api/health
```
