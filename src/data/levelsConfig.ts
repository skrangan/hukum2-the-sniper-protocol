export interface LevelConfig {
  id: number;
  titleTanglish: string;
  titleEnglish: string;
  setting: string;
  motive: string;
  setPieceDescription: string;
  parTimeMs: number;
  baseAuraScore: number;
  availableCameos: string[];
  enemyCount: number;
  stealthRequired: boolean;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    titleTanglish: "Amaithiya Irukkurathu Bayam Illa, Athu En Style",
    titleEnglish: "Being quiet isn't fear, it's just my style.",
    setting: "Neighborhood Market & Rithu's School Street",
    motive: "Eliminate all 4 bike thugs and wreck their bikes using street hazards without Viji seeing violence.",
    setPieceDescription: "Wait for Viji's vision cone -> Kick coconut -> rolls into auto handbrake -> rickshaw hits thug bikes -> fireworks cart explodes!",
    parTimeMs: 45000,
    baseAuraScore: 5000,
    availableCameos: ["vimal_taxi"],
    enemyCount: 4,
    stealthRequired: true
  },
  {
    id: 2,
    titleTanglish: "Moorthy Sir Udane Paakkanumam",
    titleEnglish: "Moorthy Sir demands an audience with you immediately.",
    setting: "Narrow Suspension Bridge over River",
    motive: "Tiger Muthuvel Pandian and taxi driver Vimal face 6 syndicate SUVs. Tiger puts on his aviator specs and shakes them twice, triggering a coordinated sniper attack on the SUVs followed by a massive explosive blast!",
    setPieceDescription: "Vimal panics by Tiger's side. Press SPACE to wear glasses and double shake -> sniper volley pierces tires and hoods -> 6 SUVs violently detonate -> thugs blasted into river -> keys fly into Vimal's hands!",
    parTimeMs: 50000,
    baseAuraScore: 7500,
    availableCameos: ["vimal_taxi"],
    enemyCount: 6,
    stealthRequired: false
  },
  {
    id: 3,
    titleTanglish: "Oru Sun, Oru Moon... Puriyutha?",
    titleEnglish: "There's only one Sun and one Moon... Do you get the hierarchy?",
    setting: "Dusty Highway Roadside Tea Stall",
    motive: "Disarm 12 machete goons in sync with the whistling tea kettle and escape in Vimal's taxi.",
    setPieceDescription: "Tea boiler whistles every 4 seconds. Click enemy weapons on red steam gauge to disarm with sniper fire.",
    parTimeMs: 55000,
    baseAuraScore: 10000,
    availableCameos: ["vimal_taxi"],
    enemyCount: 12,
    stealthRequired: false
  },
  {
    id: 4,
    titleTanglish: "24 Mani Nerathula... Alapara Kelapparom",
    titleEnglish: "In 24 hours... we unleash total mayhem.",
    setting: "Kochi Port Container Yard at Night (Rain & Lightning)",
    motive: "Lure Dileep's armored jeep into an open container, crane-lift it onto a cargo ship, and burn evidence.",
    setPieceDescription: "Hack magnetic cranes in real-time to drop containers behind Dileep's jeep and hoist him into the sky.",
    parTimeMs: 65000,
    baseAuraScore: 12500,
    availableCameos: ["vimal_taxi"],
    enemyCount: 8,
    stealthRequired: true
  },
  {
    id: 5,
    titleTanglish: "Tea-ya, Coffee-ya? Neenga Decide Panna Mudiyathu",
    titleEnglish: "Tea or Coffee? You don't even get to decide if you'll survive the sip.",
    setting: "Kantha Kalpak's Portuguese Mansion in Goa",
    motive: "Swap poisoned cups with Kantha's lieutenants, steal the syndicate ledger, and walk out untouched.",
    setPieceDescription: "Spam Kantha's phone with family forwards. Spin the lazy-Susan 180°, reflect laser off teapot to drop chandelier.",
    parTimeMs: 60000,
    baseAuraScore: 15000,
    availableCameos: ["vimal_taxi"],
    enemyCount: 6,
    stealthRequired: true
  },
  {
    id: 6,
    titleTanglish: "Jailer Mattum Thaan Sniper Vaippana?",
    titleEnglish: "Does only the Jailer have a monopoly on snipers?",
    setting: "Neon-lit Goan Street Carnival with Ferris Wheels",
    motive: "Turn Bodhi's 8 counter-snipers against his own ground troops and blow up Bodhi's megaphone stage.",
    setPieceDescription: "Move Vimal's chrome-hooded taxi and rotate parade mirrors to bounce Bodhi's green lasers into firework trucks.",
    parTimeMs: 70000,
    baseAuraScore: 18000,
    availableCameos: ["vimal_taxi"],
    enemyCount: 8,
    stealthRequired: false
  },
  {
    id: 7,
    titleTanglish: "Puli Padhungurathu Paayurathukku Thaan",
    titleEnglish: "The Tiger crouches only to pounce harder.",
    setting: "Fortified Safe House Compound Under Siege",
    motive: "Defend the safe house for 3 waves and crush all 3 armored breach vans using the Trio's combined abilities.",
    setPieceDescription: "Switch between Tiger (Overwatch), Narasimha (Melee Hurricane), and Mathew (Vintage Mercedes wrecking ball).",
    parTimeMs: 80000,
    baseAuraScore: 22000,
    availableCameos: ["narasimha_melee", "mathew_mercedes"],
    enemyCount: 20,
    stealthRequired: false
  },
  {
    id: 8,
    titleTanglish: "Naan Paatha Velai Vera... Paakura Velai Vera",
    titleEnglish: "The job I retired from was brutal... what I'm about to do is worse.",
    setting: "The Kalpak Luxury Casino Cruise Ship (Party Deck)",
    motive: "Blow open 3 vault doors synced to the DJ's bass drops and launch cash crates onto Vimal's speedboat.",
    setPieceDescription: "Bass-Drop Sabotage: Detonating charges and tossing guards on the exact beat multiplies the Aura score.",
    parTimeMs: 75000,
    baseAuraScore: 25000,
    availableCameos: ["vimal_taxi"],
    enemyCount: 15,
    stealthRequired: false
  },
  {
    id: 9,
    titleTanglish: "50 Varushama Enna Azhikka Paarthanga...",
    titleEnglish: "For 50 years, legends tried to finish me... none survived.",
    setting: "Goa Private Airstrip Runway at Sunset",
    motive: "Keep Tiger standing in the center circle without taking a step back while wiping out 40 mercenaries and 4 jeeps.",
    setPieceDescription: "360° Aura Overwatch: Jet turbine blasts, luggage-cart catapults, and call in Roddy's Helicopter Strafe Run.",
    parTimeMs: 90000,
    baseAuraScore: 30000,
    availableCameos: ["roddy_helo"],
    enemyCount: 40,
    stealthRequired: false
  },
  {
    id: 10,
    titleTanglish: "Hukum... Tiger Ka Hukum!",
    titleEnglish: "The Verdict... Is Tiger's Alone!",
    setting: "The Kalpak Fortress Penthouse & Helipad",
    motive: "Defeat all three Kalpak bosses in a 3-stage interactive showdown and lock them inside Vimal's taxi.",
    setPieceDescription: "Stage 1 (Kantha laser deflection), Stage 2 (Bodhi megaphone hijack), Stage 3 (QTE H-U-K-U-M 10-sniper volley!).",
    parTimeMs: 120000,
    baseAuraScore: 50000,
    availableCameos: ["vimal_taxi", "narasimha_melee", "mathew_mercedes", "roddy_helo"],
    enemyCount: 25,
    stealthRequired: false
  }
];
