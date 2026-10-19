# HUKUM 2: The Sniper Protocol
## Complete Technical Specification, Game Plot & Inventory Document
*Last Updated: October 2026 | Antigravity AI Engine*

> **Purpose:** This document contains the single source of truth for the entire *Hukum 2: The Sniper Protocol* codebase, database schema, game plot, 3D mechanics, audio engine, tactical inventory, and asset specifications. If environment tokens expire or the project needs to be recreated from scratch, this file contains everything required to reproduce the exact system.

---

## 1. System Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│              Client Layer (Vite + React 18)               │
│  - Three.js Realistic Multi-Chapter 3D WebGL Engine       │
│  - Procedural PBR Textures (Asphalt, Cobble, Brick, Silk) │
│  - Web Audio API Synthesizer (Anirudh Hukum Theme & 808s) │
│  - Tactical Inventory System (Gear, Cameos, Attire, Hazard)│
│  - Dual-Subtitle Engine (Bold Yellow Tanglish + English)  │
│  - Glassmorphic Action Deck, Aura Meter & Victory Modals  │
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
- **Status:** Fully connected, migrated, and actively recording player sessions, best aura scores, stars, clear times, and unlocks.

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
| **2** | *"Moorthy Sir Udane Paakkanumam"* | "Moorthy Sir demands an audience with you immediately." | Narrow Suspension Bridge over River Canyon | Tiger and taxi driver Vimal face 6 syndicate SUVs. Tiger puts on his aviator specs and shakes them twice, triggering a coordinated sniper attack on the SUVs followed by a massive explosive blast! Thugs launched into river gorge; golden car keys arc to Vimal while Moorthy boasts. | `vimal_taxi` |
| **3** | *"Oru Sun, Oru Moon... Puriyutha?"* | "There's only one Sun and one Moon... Do you get the hierarchy?" | Dusty Highway Tea Stall | Boiling Kettle Rhythm Shootout: Whistle every 4s; disarm 12 machete goons with sniper fire on red steam gauge while sugarcane trucks frame the road. | `vimal_taxi` |
| **4** | *"24 Mani Nerathula... Alapara Kelapparom"* | "In 24 hours... we unleash total mayhem." | Kochi Port Container Yard at Night | Hack magnetic cranes to drop shipping containers behind Dileep's armored jeep; hoist jeep onto Madagascar cargo ship. Mathew crashes through barricades in vintage Mercedes W123. | `mathew_mercedes` |
| **5** | *"Tea-ya, Coffee-ya? Neenga Decide Panna Mudiyathu"* | "Tea or Coffee? You don't even get to decide if you'll survive the sip." | Kantha Kalpak's Portuguese Mansion | Swap poisoned tea cups, spam Kantha's phone with WhatsApp forwards, spin lazy-Susan, reflect sniper laser off teapot to drop chandelier. | `vimal_taxi` |
| **6** | *"Jailer Mattum Thaan Sniper Vaippana?"* | "Does only the Jailer have a monopoly on snipers?" | Neon Goan Street Carnival & Ferris Wheel | Maneuver Vimal's chrome-hooded taxi and parade mirrors to reflect Bodhi's green laser counter-snipers into his firework trucks. | `vimal_taxi` |
| **7** | *"Puli Padhungurathu Paayurathukku Thaan"* | "The Tiger crouches only to pounce harder." | Fortified Safe House Compound | Trio defense: Switch dynamically between Tiger (Overwatch), Narasimha (Melee Hurricane), and Mathew (Vintage Mercedes wrecking ball). | `narasimha_melee`, `mathew_mercedes` |
| **8** | *"Naan Paatha Velai Vera... Paakura Velai Vera"* | "The job I retired from was brutal... what I'm about to do is worse." | Kalpak Luxury Casino Cruise Ship | Bass-Drop Sabotage: Detonate vault charges and launch loot crates onto Vimal's speedboat exactly on the DJ's bass drops. | `vimal_taxi` |
| **9** | *"50 Varushama Enna Azhikka Paarthanga..."* | "For 50 years, legends tried to finish me... none survived." | Goa Private Airstrip Runway at Sunset | 360° Overwatch: Hold center ground without stepping back; trigger jet turbines and luggage catapults; call Roddy's Helicopter Strafe. | `roddy_helo` |
| **10** | *"Hukum... Tiger Ka Hukum!"* | "The Verdict... Is Tiger's Alone!" | Kalpak Fortress Penthouse & Helipad | 3-Stage Showdown: Stage 1 (Kantha laser deflection), Stage 2 (Bodhi drone hijack), Stage 3 (QTE H-U-K-U-M 10-sniper simultaneous volley). | All Cameos |

---

## 4. Chapter 2 Complete Reconstructed Set-Piece Specification

### 4.1 Actors & Environment on the Bridge
1. **Narrow Suspension Bridge**:
   - 140m road deck with wet asphalt PBR texture (`asphaltTex`, `asphaltBumpTex`), yellow dashed centerlines, heavy cobblestone curbs, and steel safety lattice railings.
   - Twin 28m suspension pylon towers with curved main suspension cables and vertical hanger wire stays.
   - Misty river gorge below (-22m) with dark rushing water and cliff silhouette walls.
2. **Tiger Muthuvel Pandian**:
   - Starts bare-faced at position `(-16, 0, 0)` facing the roadblock (+X).
   - His 24K gold-rimmed aviator sunglasses are unhooked, resting in his white linen shirt pocket at `(0.24, 1.88, 0.28)`.
3. **Vimal the Getaway Taxi Driver**:
   - Stands right beside Tiger at `(-15.2, 0.4, 1.3)` facing the 6 SUVs.
   - Modeled with yellow tropical Hawaiian floral shirt with red/green floral specs, afro curls, mustache, alarmed wide eyes, denim jeans, sneakers, and nervous/panicked arm posture.
4. **Vimal's Premier Padmini Getaway Taxi**:
   - Parked directly behind on the bridge shoulder at `(-20.5, 0.4, 0.6)`.
   - Black body, yellow cab top, chrome grille, round yellow headlights, illuminated yellow "TAXI" sign on roof.
5. **Moorthy Sir & Luxury Car**:
   - Moorthy Sir standing at `(-11, 0.4, -2.0)` wearing an ornate cream-white silk shirt with golden border, thick 24K gold chain necklace, gold aviator sunglasses, and proud mustache.
   - White luxury executive sedan parked beside him at `(-14.5, 0.4, -2.2)`.
6. **6 Armored Black Syndicate SUVs**:
   - Positioned in a staggered roadblock: `(1.5, 0.4, -1.8)`, `(2.8, 0.4, 1.8)`, `(6.2, 0.4, -0.4)`, `(8.6, 0.4, -2.0)`, `(10.5, 0.4, 1.7)`, `(13.8, 0.4, -0.8)`.
   - Matte black armor plates, tinted bulletproof windows, front steel bull-bars, roof luggage racks, dual exhausts, all-terrain chunky wheels.
7. **6 Syndicate Goons**:
   - Holding machetes and shotguns in front of the SUVs.
8. **Golden Car Keys**:
   - Resting on the front SUV hood at `(1.5, 2.0, -1.8)`.

### 4.2 The 6-Phase Spectacle Flip Sequence
1. **Phase 1 ($t = 0\text{ ms}$): Wear Specs**
   - Tiger raises right arm (`tigerArmR.rotation.x = -1.55`).
   - Aviator glasses translate from shirt pocket to eyes position.
   - `soundManager.playSpecsClink()` plays crisp metallic clink.
   - Dialogue: `lvl2_tiger_cue` (*"Vimal, calm-ah iru. Kannadi shirt pocket-la irukku... Maattattuma?"*).
2. **Phase 2 ($t = 600\text{ ms}$): First Shake**
   - Tiger's head/torso and glasses tilt sharply to the right and snap back.
   - `soundManager.playSpecsShakeHit(1)` plays sharp metallic swish & punch.
3. **Phase 3 ($t = 1100\text{ ms}$): Second Shake & Encrypted Signal**
   - Tiger executes second definitive shake.
   - `soundManager.playSpecsShakeHit(2)` plays deep 808 sub-bass drop and metallic resonance.
   - Tiger lowers his right arm.
   - Dialogue: `lvl2_shake_specs` (*"Oru shake... Rendaavathu shake... Hilltop Snipers, target the 6 SUVs! HUKUM!"*).
4. **Phase 4 ($t = 1600\text{ ms}$): Sniper Attack on the 6 SUVs**
   - 6 red laser targeting beams snap from the cliff silhouettes to the 6 SUVs.
   - `soundManager.playSniperVolley(6)` plays 6 rapid, thunderous high-caliber sniper rifle cracks echoing across the canyon.
   - Sparks erupt on SUV hoods and tires; tire blowout meshes drop SUVs by 0.12m.
   - Vimal cowers down in comical panic covering his head.
5. **Phase 5 ($t = 2400\text{ ms}$): Massive Explosive Blast**
   - The 6 SUVs detonate violently!
   - `soundManager.playExplosion()` plays massive explosion SFX.
   - 150+ glowing fireball particles (orange, crimson, yellow, white) erupt from each SUV into the sky.
   - SUVs buck, tilt, and catch fire (burning wreckage).
   - The 6 syndicate thugs are hurled high into the air by the shockwave, flipping over the bridge suspension cables into the river gorge below.
   - The golden car keys launch from the lead SUV and arc high across the bridge in a spinning golden trail, landing directly into Vimal's hands at `(-15.2, 1.25, 1.3)`.
6. **Phase 6 ($t = 3200\text{ ms}$): Vimal's Shock, Moorthy's Boast & Jailer Victory Theme**
   - Vimal stands back up holding the car keys, staring in absolute comedic shock (`lvl2_vimal_shock`: *"Ammaadii! Kannadiya rendu thadava aatuna... 6 SUV-um blast aayi key en kayila vandhu vizhudha?!"*).
   - At 5200ms: Moorthy laughs and proudly claims all credit (`lvl2_victory`: *"Paathiya Tiger! Oru phone call, anju nimisham... Six SUVs flat-u! En power purinjatha?"*).
   - `soundManager.playJailerThemeVictory()` begins playing the glorious Anirudh E-minor Jailer brass theme with 808 bass and stadium claps.
   - `triggerVictory()` is called, recording victory and awarding 3 stars!

---

## 5. Complete Tactical Loadout & Inventory Specification

All inventory items are structured in `src/data/inventoryData.ts` and managed via `InventoryModal.tsx`:

| Item Code / ID | Name & Movie Line | Category | Rarity | Hotkey | Stats | Lore Note |
|---|---|---|---|---|---|---|
| `gold_aviators` | **Gold-Rimmed Aviator Sunglasses**<br>*"Kannadi thiruppuna... Katchi maarum."* | `GEAR` | SIGNATURE | `SPACE` | Command Authority: 100%<br>Marksman Signal: 95%<br>Composure: 98% | Kept in his breast pocket since his Tihar Jail days in Delhi. When Tiger puts them on and shakes them, marksmen know the quiet talk is over. |
| `sniper_designator` | **Long-Range Rifle Overwatch**<br>*"Etthana per irundhalum... orey kuri."* | `GEAR` | TACTICAL | `1` | Rifle Precision: 98%<br>Vantage Distance: 800m (92%)<br>Discipline: Fires on Hukum (96%) | Former convicts reformed under Tiger Pandian at Tihar who now work as his silent protectors from surrounding rooftops and hilltops. |
| `pollachi_coconut` | **Heavy Pollachi Tender Coconut**<br>*"Viji paakkama oru chinna thattu..."* | `HAZARD` | COVERT | `2` | Knock Force: 85%<br>Family Secrecy: 100%<br>Street Impact: 94% | A heavy green coconut fallen beside the vegetable cart. One measured nudge with the sandal sends it straight into the parked auto-rickshaw's loose handbrake lever. |
| `vimal_taxi` | **Vimal & Premier Padmini Taxi**<br>*"Thalaiva! Handbrake loose-ah thaan irukku!"* | `CAMEO` | SYNDICATE | `2` | Alleyway Getaway: 90%<br>Street Blockade: 84%<br>Loyalty to Tiger: 96% | Panicked yet fiercely loyal tourist taxi driver Vimal behind the wheel of his battered Premier Padmini, complete with hanging plush dice and dashboard Ganesha idol. |
| `mathew_mercedes` | **Mathew — Vintage W123 Sedan**<br>*"Ivide oru Mercedes vandhaal... Barricades thool-aakum."* | `CAMEO` | SYNDICATE | `3` | Underworld Reach: 98%<br>Convoy Ambush: 94%<br>Presence: +3,500 Composure | Charismatic Kerala kingpin Mathew in his tailored tweed blazer, gold watch, and Cuban cigar. One phone call from Muthuvel brings his classic sedan crashing through any roadblock. |
| `narasimha_melee` | **Narasimha — Rain-Slicked Leather**<br>*"Naan ulla vandhutaen... Yaarukkum vazhi illa!"* | `CAMEO` | SYNDICATE | `3` | Close-Quarters: 100%<br>Fear Factor: 98%<br>Brotherhood: 99% | Feared Karnataka underworld figure Narasimha in his rain-drenched black leather jacket and silver pendant. Single-handedly dismantles armed gangs. |
| `driver_veshti` | **Cream Linen Shirt & Gold Veshti**<br>*"Amaithiya irukkurathu bayam illa... Athu en style."* | `ATTIRE` | SIGNATURE | - | Low Profile: 92%<br>Demeanor: 100%<br>Respect: 98% | Tailored off-white linen shirt worn over a traditional handloom veshti with a thin gold chain and rudraksha wrist beads — the unassuming look of a retired grandfather. |
| `jailer_overcoat` | **Dark Field Jacket & Service Watch**<br>*"Naan paatha velai vera... paakura velai vera."* | `ATTIRE` | TACTICAL | - | Night Cover: 90%<br>Endurance: 88%<br>Fearsome Reputation: 100% | Heavy-duty dark olive jacket worn over an open-collared shirt during nocturnal port ambushes, highway tea-stall standoffs, and the Goa fortress raid. |

---

## 6. Movie Audio Engine (`src/game/audio/SoundManager.ts`)

- **Independent Toggles & Volume Sliders**:
  - `setMusicEnabled(boolean)` & `setMusicVolume(0..1)`
  - `setSfxEnabled(boolean)` & `setSfxVolume(0..1)`
  - Configurable via `AudioSettingsModal.tsx` in top navigation.
  - Persisted automatically in `localStorage`.
- **Authentic Jailer Hukum Victory Theme (`playJailerThemeVictory()`)**:
  - Composed by Anirudh Ravichander in E Minor (E3-G3-A3-B3-D4-E4-D4-B3-A3-G3-E3).
  - Multi-layered stadium brass: Fat French Horn (Sawtooth + Low-pass) + Punchy Trumpet Lead (Square wave + detuned harmonics).
  - Driving Anirudh 808 Sub-Bass Drop (160Hz sliding down to 32Hz).
  - Syncopated stadium claps and trap rhythm.
  - Plays automatically whenever a level/chapter is completed.
- **Chapter 2 Specific SFX**:
  - `playSpecsClink()`: Metallic glasses frame click & lens tap.
  - `playSpecsShakeHit(shakeNum: 1 | 2)`: Shake 1 (metallic swish & mid punch), Shake 2 (earth-shattering 808 sub-bass drop & metallic clink).
  - `playSniperVolley(shots: number)`: Synchronized rapid sniper rifle cracks across the canyon.
  - `playExplosion()`: Thunderous multi-frequency blast with sub-boom and high debris crackle.

---

## 7. How to Recreate & Run the Entire Project

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
