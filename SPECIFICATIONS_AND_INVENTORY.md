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

### 4.1 Realistic 3D Engine Modules (`src/game/three/`)
- `ThreeGameManager.ts`: Master Three.js WebGL renderer, perspective camera, 4K shadow maps, ACESFilmic tone mapping, ambient & directional lighting, loop orchestrator.
- `TextureGenerator.ts`: Procedural PBR canvas texture generator:
  - `createAsphaltTexture()`: 1024x1024 aggregate grain, cracks, yellow double divider lines, zebra pedestrian crosswalk.
  - `createSidewalkTexture()`: 512x512 cobblestone stone pavers grid with weathered concrete noise.
  - `createShopSignboardTexture()`: High-contrast Tamil and English shop signboards ("முருகன் டீ ஸ்டால்", "அண்ணாச்சி மளிகை").
  - `createBrickBuildingTexture()`: 3-story Madras colonial brickwork with arched wooden window shutters and cornices.
  - `createRickshawDecalTexture()`: Authentic Tamil Nadu yellow license plate (`TN 01 AB 1975`) and tourist decals.
  - `createFireworkBoxTexture()`: Authentic Diwali cracker box textures ("ANIL CRACKERS 1000 WALA").
- `MarketScene3D.ts`: Realistic 3D Chennai Market street builder:
  - 4 Colonial multi-story Madras shop buildings with balconies, parapets, and Tamil typography signboards.
  - Authentic market stalls with jute tables, hanging banana bunches, wooden tomato crates, and protective charms.
  - Realistic cast-iron streetlamps casting warm volumetric point lights.
  - Detailed 3D Tiger Muthuvel Pandian model (Superstar Rajinikanth likeness, styled silver hair, silver salt-and-pepper beard, gold-rimmed aviator sunglasses with dark reflective lenses, white linen bush shirt with collar and chest pocket pen, gold luxury watch, pleated silk dhoti/veshti with gold zari border, leather chappals, and signature mass swagger walk animation).
  - Detailed 3D Bajaj RE Auto-Rickshaw (curved yellow fiberglass canopy, green chassis, chrome handlebars, instrument speedometer, headlight beam, and rolling wheels).
  - Realistic 3D Motorbikes (Royal Enfield style chassis, fuel tanks, spoke wheels, and chrome exhaust pipes).
  - 3D Coconut hazard with rolling physics.
  - 3D Diwali Fireworks Cart with multi-box particle detonation.
  - 3D Patrolling Viji model with real-time sweeping spotlight vision beam.
  - 3D Rooftop sniper lasers with glowing red beam crosshairs.
  - Atmospheric golden sun dust motes drifting through the air.

### 4.2 Movie Audio Engine (`src/game/audio/SoundManager.ts`)
- **Multi-Bus Architecture**: Independent `masterGain`, `bgmGain`, and `sfxGain` buses routed through an interactive `bulletTimeFilter` (Biquad low-pass filter).
- **Independent Toggles & Controls**:
  - `setMusicEnabled(boolean)` & `setMusicVolume(0..1)`
  - `setSfxEnabled(boolean)` & `setSfxVolume(0..1)`
  - State persisted automatically in `localStorage`.
- **Hukum Theme Synthesizer**: 124 BPM syncopated 16th-note sequencer in E minor with 4-on-the-floor kick, distorted 808 sub-bass riff, and brass horn chord stabs.
- **Bullet-Time Soundscape**: Low-pass filter sweeps down to 380Hz during the Spectacle Flip to simulate the eye of the storm.
- **Movie SFX**: High-caliber sniper crack with ricochet reverb tail, 2-stroke Bajaj auto engine rev, Diwali crackers explosive cascade with secondary pops, and hollow coconut thud.

### 4.3 UI & HUD Components (`src/components/`)
- `NavbarAuth.tsx`: Top header with player profile, Render DB sync indicator, level select button, sound mute, and **Settings** button.
- `SettingsModal.tsx`: Dedicated audio and visuals settings panel with independent BGM/SFX toggle switches, volume sliders (0-100%), test buttons, 3D graphics quality options, and subtitle mode preferences.
- `AuraMeterHUD.tsx`: Top-left composure meter, multiplier indicator (`x1`, `x2`, `x4`, `HUKUM x10`), Viji vision gauge.
- `DualSubtitleHUD.tsx`: Bottom-center glassmorphic dialogue box with movie character portraits (Rajini, Viji, Vimal, Mathew, Narasimha) and yellow Tanglish + English subtitles.
- `ActionDeckHUD.tsx`: Bottom-right Spectacle Flip button and tactical hotkeys (`[1]`, `[2]`, `[3]`).
- `VictoryModal.tsx`: Post-level summary showing stars, aura points, clear times, and PostgreSQL sync status.
- `LeaderboardModal.tsx`: Live top 25 global rankings fetched directly from Render PostgreSQL.
- `LevelSelectModal.tsx`: Interactive selector for Chapters 1 through 10.
- `IntroVideoModal.tsx`: Cinematic 2.35:1 widescreen introduction video cutscene with character art and audio buildup.

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
