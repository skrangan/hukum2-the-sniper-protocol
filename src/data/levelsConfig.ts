export interface LevelConfig {
  id: number;
  titleTanglish: string;
  titleEnglish: string;
  setting: string;
  motive: string;
  setPieceDescription: string;
  storyContext: string;
  keyAntagonist: string;
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
    setting: "Mylapore Heritage Market & Rithu's School Street, Chennai",
    motive: "Eliminate all 4 of Dileep's bike scouts and wreck their bikes using street hazards without Viji seeing Tiger use violence.",
    setPieceDescription: "Ring the temple bell [Q] or wait for Viji's occluded vision cone -> Kick Pollachi coconut -> hits Bajaj auto-rickshaw handbrake -> rickshaw rolls down ramp -> smashes thug bikes -> ignites Sivakasi Diwali fireworks cart!",
    storyContext: "Three months after executing corrupt ACP Arjun and dismantling Varman's Arakkonam idol cartel, Muthuvel 'Tiger' Pandian lives quietly with Viji, Swetha, and grandson Rithvik ('Rithu'). When Varman's associate Dileep dispatches four machete-wielding bike scouts into Mylapore market to confirm if the retired Tihar Jailer is behind Varman's death, Tiger must clear the street while Viji shops for vegetables.",
    keyAntagonist: "Dileep's Arakkonam Bike Scouts",
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
    setting: "Narrow Suspension Bridge over Bhavani River Gorge, Attappadi Border",
    motive: "Stand beside panicked taxi driver Vimal on the suspension bridge; put on your pocketed aviator specs and shake them twice to trigger a hill sniper barrage blowing up all 6 SUVs into the river while Moorthy Sir believes his political aura scared them off.",
    setPieceDescription: "Vimal panics beside his Premier Padmini taxi while Moorthy runs off to make calls -> Press [SPACE] to wear aviator specs and shake them twice -> Hill snipers unleash synchronized volley piercing SUV tires & fuel caps -> Explosive shockwave hurls 6 goons into the river gorge -> Golden SUV keys bounce right into Vimal's hands!",
    storyContext: "Going undercover as the humble driver for pompous fruit-merchant and self-styled politician 'Moorthy Sir', Tiger reunites with Vimal and his black-and-yellow Premier Padmini tourist taxi. When 6 armored black SUVs from Dileep's gang blockade the narrow river suspension bridge, Moorthy retreats to make frantic phone calls—giving Tiger the exact window to pull his gold-rimmed aviators from his shirt pocket and shake them twice.",
    keyAntagonist: "Dileep's Highway Convoy Enforcers",
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
    setting: "Palakkad Dusty Highway Roadside Tea Stall",
    motive: "Disarm 12 machete goons sent by tracker Mukund in sync with the whistling brass tea kettle and escape in Vimal's Premier Padmini taxi.",
    setPieceDescription: "Boiling Kettle Rhythm Shootout: Brass tea samovar whistles every 4 seconds creating a steam cloud. Trigger Hukum sniper fire when the steam gauge peaks to disarm goons and blow out the sugarcane truck tires.",
    storyContext: "Sharp-eyed cartel tracker Mukund spots Muthuvel Pandian in the background of Blast Mohan's 'Ala Bolelo' song shoot and corners Tiger and Vimal at a dusty Palakkad roadside tea stall flanked by sugarcane haulage trucks. Calmly waiting for his glass of meter tea, Tiger synchronizes his hilltop marksmen with the whistling brass tea boiler.",
    keyAntagonist: "Tracker Mukund & 12 Machete Enforcers",
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
    setting: "Kochi Port Container Yard at Night (Monsoon Rain & Lightning)",
    motive: "With Mathew's port intel, lure Dileep's armored jeep into an open shipping container, crane-lift it onto a cargo vessel bound for Madagascar, and seize the 3 Chola bronze idol containers.",
    setPieceDescription: "Hack magnetic gantry cranes in real-time to drop heavy steel containers behind Dileep's moving jeep, trapping his convoy and hoisting his vehicle into the stormy night sky.",
    storyContext: "Discovering that three shipping containers of priceless Chola bronze idols are being routed through Kochi Port to the ruthless Kalpak Dynasty in Goa, Tiger calls his old Kerala underworld ally Mathew. Under torrential monsoon lightning, Tiger uses the port's magnetic gantry cranes to trap Dileep and cartel mole Ameer.",
    keyAntagonist: "Dileep & Port Traitor Ameer",
    parTimeMs: 65000,
    baseAuraScore: 12500,
    availableCameos: ["vimal_taxi", "mathew_mercedes"],
    enemyCount: 8,
    stealthRequired: true
  },
  {
    id: 5,
    titleTanglish: "Tea-ya, Coffee-ya? Neenga Decide Panna Mudiyathu",
    titleEnglish: "Tea or Coffee? You don't even get to decide if you'll survive the sip.",
    setting: "Kantha Kalpak's Portuguese Mansion in Assagao, Goa",
    motive: "Distract psychological boss Kantha Kalpak, spin the teak lazy-Susan 180° to swap poisoned cups with her lieutenants, and ricochet a sniper shot off the silver teapot to drop the chandelier.",
    setPieceDescription: "Use the distraction whistle / phone forwards to draw Kantha's gaze -> Spin the lazy-Susan table 180° -> Reflect a rooftop laser off the silver teapot to sever the crystal chandelier cable onto her elite guards.",
    storyContext: "In Goa, the Kalpak syndicate is run by patriarch Chakri Kalpak and his children: psychological strategist Kantha Kalpak and theatrical mastermind Bodhi Kalpak. When Kantha invites Tiger for a 'civilized' cup of poisoned Darjeeling tea at her Portuguese villa after abducting Narasimha's family, Tiger turns her own dining table into a precision sniper mirror.",
    keyAntagonist: "Kantha Kalpak (Goa Estate Mastermind)",
    parTimeMs: 60000,
    baseAuraScore: 15000,
    availableCameos: ["vimal_taxi", "mathew_mercedes"],
    enemyCount: 6,
    stealthRequired: true
  },
  {
    id: 6,
    titleTanglish: "Jailer Mattum Thaan Sniper Vaippana?",
    titleEnglish: "Does only the Jailer have a monopoly on snipers?",
    setting: "Neon-lit Panjim Goan Street Carnival & Ferris Wheel",
    motive: "Turn Bodhi Kalpak's 8 green-laser counter-snipers against his own ground squad and detonate Bodhi's golden megaphone stage.",
    setPieceDescription: "Maneuver Vimal's chrome-hooded Premier Padmini taxi and rotate carnival parade mirrors in real-time to bounce Bodhi's green counter-sniper beams into his firework float trucks.",
    storyContext: "Furious at Kantha's humiliation, eccentric syndicate operational head Bodhi Kalpak stages a neon street carnival ambush in Panjim, boasting on his golden megaphone that he has hired 8 green-laser counter-snipers of his own. Tiger uses Vimal's polished taxi hood and mirrored carnival floats to reflect Bodhi's lasers right back at his syndicate.",
    keyAntagonist: "Bodhi Kalpak & His 8 Green-Laser Counter-Snipers",
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
    setting: "Bilikere / Mysuru Fortified Safe House Compound Under Siege",
    motive: "Defend the safe house across 3 siege waves and crush all 3 of Ved & Sharva Kalpak's armored breach vans using Tiger, Narasimha, and Mathew's combined might.",
    setPieceDescription: "Command Tiger's rooftop Overwatch, summon Narasimha's iron-fist melee hurricane through brick walls, and ram Mathew's vintage W123 Mercedes sedan into the cartel breach vans.",
    storyContext: "After exchanging a GPS-tracked Chakri Kalpak to free Narasimha's wife and son, the Kalpak enforcement brothers Ved and Sharva launch an all-out midnight assault on the Mysuru safe house. Tiger stands shoulder-to-shoulder with sworn brothers Narasimha and Mathew in a three-way syndicate defense.",
    keyAntagonist: "Ved Kalpak & Sharva Kalpak (Breach Squad)",
    parTimeMs: 80000,
    baseAuraScore: 22000,
    availableCameos: ["narasimha_melee", "mathew_mercedes"],
    enemyCount: 10,
    stealthRequired: false
  },
  {
    id: 8,
    titleTanglish: "Naan Paatha Velai Vera... Paakura Velai Vera",
    titleEnglish: "The job I retired from was brutal... what I'm about to do is worse.",
    setting: "Chakri Kalpak's Luxury Casino Cruise Ship ('Bindaas' Party Deck)",
    motive: "Detonate 3 explosive-rigged idol vault doors synced to the DJ's bass drops and launch the Kalpak cartel war-chest onto Vimal's speedboat.",
    setPieceDescription: "Bass-Drop Sabotage: Trigger vault charges and sniper zip-lines on the exact Anirudh 808 bass drop to multiply Composure x10 while the cruise crowd cheers.",
    storyContext: "Disguised as antique deliveries for patriarch Chakri Kalpak's lavish offshore birthday bash aboard the 'Bindaas' casino cruise ship, Tiger and Vimal smuggle three explosive-rigged containers onto the party deck—timing every detonation to the DJ's thunderous bass drops.",
    keyAntagonist: "Chakri Kalpak's Casino Security & Vault Guards",
    parTimeMs: 75000,
    baseAuraScore: 25000,
    availableCameos: ["vimal_taxi", "mathew_mercedes"],
    enemyCount: 10,
    stealthRequired: false
  },
  {
    id: 9,
    titleTanglish: "50 Varushama Enna Azhikka Paarthanga...",
    titleEnglish: "For 50 years, legends tried to finish me... none survived.",
    setting: "Goa Dabolim Private Airstrip Runway at Sunset",
    motive: "Keep Tiger standing inside the center tarmac circle without taking a single step backward while wiping out Bodhi's mercenaries and 4 charging jeeps.",
    setPieceDescription: "360° Aura Overwatch: Ignite private jet turbine blasts, launch luggage-cart catapults, and summon reformed Tihar operative Roddy's twin-SMG Helicopter Strafe Run.",
    storyContext: "After Bodhi drugs officer Debnath to expose the truth of Arjun's death to Viji and abducts Tiger's family to the Dabolim runway, reformed Tihar high-value operative Roddy swoops in by helicopter. Refusing to retreat a single inch on the sunset tarmac, Tiger unleashes 360-degree carnage.",
    keyAntagonist: "Ved & Sharva Kalpak's Airstrip Mercenary Convoy",
    parTimeMs: 90000,
    baseAuraScore: 30000,
    availableCameos: ["roddy_helo", "narasimha_melee"],
    enemyCount: 12,
    stealthRequired: false
  },
  {
    id: 10,
    titleTanglish: "Hukum... Tiger Ka Hukum!",
    titleEnglish: "The Verdict... Is Tiger's Alone!",
    setting: "The Kalpak Cliffside Fortress Penthouse & Helipad, Cabo de Rama, Goa",
    motive: "Rescue Viji and Rithu, defeat Kantha, Bodhi, and Chakri Kalpak in a 3-stage interactive showdown, and lock the survivors inside Vimal's 'Prison Van' tourist taxi.",
    setPieceDescription: "Stage 1 (Kantha glass pillar laser deflection), Stage 2 (Bodhi megaphone drone hijack), Stage 3 (Execute QTE H-U-K-U-M 10-sniper simultaneous volley to sever the escape helicopter tether!).",
    storyContext: "At the Cabo de Rama cliffside fortress, Muthuvel Pandian storms the helipad alongside Mathew, Narasimha, Roddy, and Vimal. Even after learning the painful truth about Arjun's corruption, Viji and Rithu witness Tiger's ultimate dharma as all 10 Tihar marksmen lock onto the Kalpak dynasty for the final Hukum verdict.",
    keyAntagonist: "Chakri Kalpak, Bodhi Kalpak & Kantha Kalpak",
    parTimeMs: 120000,
    baseAuraScore: 50000,
    availableCameos: ["vimal_taxi", "narasimha_melee", "mathew_mercedes", "roddy_helo"],
    enemyCount: 12,
    stealthRequired: false
  }
];
