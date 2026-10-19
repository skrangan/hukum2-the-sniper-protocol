export type InventoryCategory = 'GEAR' | 'CAMEO' | 'ATTIRE' | 'HAZARD';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  subtitleTanglish: string;
  category: InventoryCategory;
  rarity: 'SIGNATURE' | 'SYNDICATE' | 'TACTICAL' | 'COVERT';
  hotkey?: string;
  portrait?: string;
  description: string;
  loreNote: string;
  stats: {
    label: string;
    value: string;
    barPercent: number;
  }[];
  unlockedByDefault: boolean;
}

export const TACTICAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'gold_aviators',
    code: 'Muthuvel Pandian • Personal Effects',
    name: '24K Gold-Rimmed Aviator Sunglasses',
    subtitleTanglish: '"Kannadi rendu vaati asanjaa... Katchi maarum."',
    category: 'GEAR',
    rarity: 'SIGNATURE',
    hotkey: 'SPACE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Muthuvel Pandian’s trademark dark aviator shades. In Chapter 2 on the river suspension bridge, he pulls them from his shirt pocket beside panicked Vimal and shakes them twice — signaling his hilltop marksmen to detonate all 6 cartel SUVs.',
    loreNote: 'Kept in his breast pocket since his Tihar Jail tenure in New Delhi; two shakes mean zero mercy.',
    stats: [
      { label: 'Command Authority', value: 'Hukum x10', barPercent: 100 },
      { label: 'Double-Shake Cue', value: '6-SUV Bridge Volley', barPercent: 98 },
      { label: 'Composure', value: 'Unshaken', barPercent: 100 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'sniper_designator',
    code: 'Narasimha’s Marksmen • Tihar Reformed Loyals',
    name: 'Long-Range Rifle Overwatch (10-Sniper Network)',
    subtitleTanglish: '"Etthana per irundhalum... orey kuri."',
    category: 'GEAR',
    rarity: 'TACTICAL',
    hotkey: '1',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Elite marksmen originally loaned by Narasimha and former Tihar convicts reformed under Tiger Pandian. They maintain strict fire-discipline — holding fire if Viji is watching the crossing until Tiger creates a distraction.',
    loreNote: 'Positioned across Mylapore terraces, Attappadi gorge cliffs, Kochi gantry cranes, and Cabo de Rama ridges.',
    stats: [
      { label: 'Rifle Precision', value: 'Sub-MOA Pinpoint', barPercent: 99 },
      { label: 'Vantage Distance', value: '850 Meters', barPercent: 94 },
      { label: 'Fire Discipline', value: 'Holds on Viji LOS', barPercent: 100 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'pollachi_coconut',
    code: 'Mylapore Market • Street Improvisation',
    name: 'Heavy Pollachi Tender Coconut & Bajaj Auto Trap',
    subtitleTanglish: '"Viji paakkama oru chinna thattu..."',
    category: 'HAZARD',
    rarity: 'COVERT',
    hotkey: '2',
    portrait: '/assets/portraits/viji.jpg',
    description:
      'A heavy green Pollachi coconut resting near the Mylapore shrine stall. One measured tap with Tiger’s leather sandal sends it knocking the parked Bajaj RE auto-rickshaw’s loose handbrake, bulldozing Dileep’s 4 bikers into the Sivakasi fireworks cart.',
    loreNote: 'To Viji and the school-street bystanders, the entire chain reaction looks like a freak bazaar accident.',
    stats: [
      { label: 'Knock Force', value: 'Releases Auto Brake', barPercent: 88 },
      { label: 'Family Secrecy', value: 'Zero Viji Suspicion', barPercent: 100 },
      { label: 'Chain Reaction', value: '4 Bikers + Pyro Cart', barPercent: 96 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'temple_bell_whistle',
    code: 'Acoustic Decoy • Covert Redirection',
    name: 'Temple Bell & Kettle Whistle Distraction',
    subtitleTanglish: '"Kovil mani adicha... பார்வை திரும்பும்."',
    category: 'HAZARD',
    rarity: 'COVERT',
    hotkey: 'Q',
    portrait: '/assets/portraits/moorthy.jpg',
    description:
      'Rings the brass Dravidian temple bell in Mylapore Market or triggers a sharp whistle decoy. Immediately turns Viji’s vision cone away from the crossing and lures patrolling syndicate scouts into the trap path.',
    loreNote: 'Essential for clearing Viji’s line-of-sight so rooftop marksmen can engage without compromising Tiger’s cover.',
    stats: [
      { label: 'LOS Redirection', value: 'Turns Viji 180°', barPercent: 95 },
      { label: 'AI Lure Radius', value: '14 Meters', barPercent: 90 },
      { label: 'Suspicion Reset', value: '-45% Attention', barPercent: 92 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'vimal_taxi',
    code: 'Goa - Attappadi - Chennai • Getaway Driver',
    name: 'Vimal & His Black-and-Yellow Premier Padmini',
    subtitleTanglish: '"Ammaadii! Kannadiya rendu thadava aatuna 6 SUV blast-a?!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '2',
    portrait: '/assets/portraits/vimal.jpg',
    description:
      'Panicked yet fiercely loyal tourist taxi driver Vimal in his floral Goan shirt beside his Premier Padmini. Catches the airborne golden SUV keys on the suspension bridge, reflects Bodhi’s green lasers off his chrome hood in Panjim, and locks the Kalpak bosses in his trunk.',
    loreNote: 'Inadvertently dragged from statue transport into the war against the Kalpak Dynasty, yet never abandons Thalaivar.',
    stats: [
      { label: 'Bridge Key Catch', value: 'Golden Arc Reflex', barPercent: 96 },
      { label: 'Chrome Hood Mirror', value: 'Deflects Lasers', barPercent: 91 },
      { label: 'Loyalty to Tiger', value: '100% Ride-or-Die', barPercent: 99 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'mathew_mercedes',
    code: 'Kochi Underworld • Sworn Brother',
    name: 'Mathew — Vintage Brown Blazer & W123 Sedan',
    subtitleTanglish: '"Ivide oru Mercedes vandhaal... Barricades thool-aakum."',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/mathew.jpg',
    description:
      'Charismatic Kerala underworld kingpin Mathew in his tailored brown blazer, gold watch, and Cuban cigar. Controls Kochi Port gantry cranes to trap Dileep’s convoy and rams his classic W123 Mercedes through Ved & Sharva Kalpak’s breach vans.',
    loreNote: 'A blood brotherhood forged decades ago; one call from Muthuvel mobilizes every port and highway in Kerala.',
    stats: [
      { label: 'Underworld Reach', value: 'Kochi to Goa Ports', barPercent: 99 },
      { label: 'Convoy Ambush', value: 'W123 Wrecking Ram', barPercent: 95 },
      { label: 'Aura Boost', value: '+3,500 Composure', barPercent: 96 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'narasimha_melee',
    code: 'Mandya & Mysuru • Blood Brotherhood',
    name: 'Narasimha — Rain-Slicked Leather & Iron Fist',
    subtitleTanglish: '"Naan ulla vandhutaen... Yaarukkum ini thappikka vazhi illa!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/narasimha.jpg',
    description:
      'Feared Karnataka syndicate kingpin Narasimha in his rain-drenched black leather jacket. Loaned Tiger the four original marksmen in Jailer (2023), and after Tiger rescues his wife and son from Bodhi Kalpak, Narasimha obliterates the Mysuru safe-house siege.',
    loreNote: 'When Narasimha steps out of the smoke chewing his cigar, heavily armed cartel squads drop their machetes.',
    stats: [
      { label: 'Close-Quarters', value: 'Unstoppable Hurricane', barPercent: 100 },
      { label: 'Fear Factor', value: 'Instant Scatter', barPercent: 99 },
      { label: 'Brotherhood', value: 'Life-Debt Ally', barPercent: 100 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'roddy_helo',
    code: 'Tihar Special Wing • Air-Support Operative',
    name: 'Roddy — Tactical Chopper & Twin-SMG Strafe',
    subtitleTanglish: '"Tihar-la neenga en வாழ்க்கையை மாத்துனீங்க Jailer Sir!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'High-value operative reformed by Muthuvel Pandian during his Tihar Jail command. Rappels from an attack helicopter over Goa’s Dabolim runway at sunset, sweeping away Ved and Sharva Kalpak’s mercenary jeeps.',
    loreNote: 'Answers only to Tiger’s Hukum code when the Kalpak cartel threatens the Pandian family.',
    stats: [
      { label: 'Aerial Overwatch', value: '360° Runway Sweep', barPercent: 98 },
      { label: 'Extraction Speed', value: 'Helipad Assault', barPercent: 96 },
      { label: 'Firepower', value: 'Twin Suppressed SMGs', barPercent: 97 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'driver_veshti',
    code: 'Mylapore & Attappadi • Undercover Attire',
    name: 'Cream Linen Bush Shirt & Gold-Bordered Veshti',
    subtitleTanglish: '"Amaithiya irukkurathu bayam illa... Athu en style."',
    category: 'ATTIRE',
    rarity: 'SIGNATURE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Tailored off-white linen bush shirt with a breast pocket for his aviator specs, worn over a handloom silk veshti with gold zari border, luxury watch, and rudraksha beads — the unassuming look of Moorthy Sir’s quiet driver and Rithu’s loving grandfather.',
    loreNote: 'Keeps Viji calm during morning market errands and fools pompous politicians like Moorthy Sir.',
    stats: [
      { label: 'Low Profile', value: 'Blends in Bazaar', barPercent: 94 },
      { label: 'Demeanor', value: 'Calm Patriarch', barPercent: 100 },
      { label: 'Respect', value: 'Unspoken Mass', barPercent: 99 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'jailer_overcoat',
    code: 'Tihar Years & Goa Raid • Combat Attire',
    name: 'Dark Olive Field Jacket & Tihar Service Watch',
    subtitleTanglish: '"Naan paatha velai vera... paakura velai vera."',
    category: 'ATTIRE',
    rarity: 'TACTICAL',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Heavy-duty dark olive field jacket worn over an open-collared shirt during the Kochi Port monsoon ambush, the "Bindaas" casino cruise sabotage, and the Cabo de Rama fortress raid against the Kalpak Dynasty.',
    loreNote: 'When the linen shirt is swapped for the Tihar field jacket, the underworld knows the old Jailer is back on duty.',
    stats: [
      { label: 'Night Cover', value: 'Monsoon Stealth', barPercent: 92 },
      { label: 'Endurance', value: 'Reinforced Weave', barPercent: 90 },
      { label: 'Fearsome Reputation', value: 'Tiger Ka Hukum', barPercent: 100 }
    ],
    unlockedByDefault: true
  }
];
