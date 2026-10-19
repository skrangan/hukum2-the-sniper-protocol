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
    code: 'OPT-01 // HUKUM SPEC',
    name: '24K Gold-Rimmed Aviator Shades',
    subtitleTanglish: '"Kannadi thiruppuna... Katchi maarum."',
    category: 'GEAR',
    rarity: 'SIGNATURE',
    hotkey: 'SPACE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Custom polarized ballistic aviators worn by Muthuvel Pandian. A single 360-degree flip synchronizes rooftop laser designators and triggers 50% bullet-time dilation.',
    loreNote: 'Issued during Pandian’s Tihar Jail tenure; upgraded with laser-reflective bridge prisms.',
    stats: [
      { label: 'Aura Multiplier', value: 'HUKUM x10', barPercent: 100 },
      { label: 'Time Dilation', value: '50% Slow-Mo', barPercent: 85 },
      { label: 'Composure Retention', value: '+40% Stoic', barPercent: 92 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'sniper_designator',
    code: 'TAC-02 // LASER OVERWATCH',
    name: 'Encrypted Laser Target Designator',
    subtitleTanglish: '"etthana per irundhalum... orey kuri."',
    category: 'GEAR',
    rarity: 'TACTICAL',
    hotkey: '1',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Concealed wrist-mounted micro-transponder linked to 4 elevated .338 Lapua Magnum rooftop marksmen. Paints hostile targets with high-visibility ruby laser beams.',
    loreNote: 'Operates on encrypted UHF frequencies disguised as an antique brass chronograph.',
    stats: [
      { label: 'Lock-On Precision', value: '99.8% Sub-MOA', barPercent: 98 },
      { label: 'Effective Range', value: '1,200 Meters', barPercent: 94 },
      { label: 'Stealth Rating', value: 'Zero Muzzle Flash', barPercent: 88 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'pollachi_coconut',
    code: 'ENV-03 // KINETIC TRIGGER',
    name: 'Heavy Pollachi Tender Coconut',
    subtitleTanglish: '"Viji paakkama oru chinna thattu..."',
    category: 'HAZARD',
    rarity: 'COVERT',
    hotkey: '2',
    portrait: '/assets/portraits/viji.jpg',
    description:
      'Dense 2.4 kg fibrous green coconut from the neighborhood market stall. When kicked at a 14-degree angle, impacts the parked auto-rickshaw handbrake lever with zero forensic trace.',
    loreNote: 'Plausible deniability guaranteed: looks like an accidental grocery spill if Viji turns around.',
    stats: [
      { label: 'Impact Momentum', value: '48 N·s Impulse', barPercent: 82 },
      { label: 'Domestic Stealth', value: '100% Innocent', barPercent: 100 },
      { label: 'Chain Reaction', value: 'Auto + Pyro Cart', barPercent: 95 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'vimal_taxi',
    code: 'CAM-01 // GOA TRANSPORT',
    name: "Vimal's Premier Padmini Tourist Taxi",
    subtitleTanglish: '"Thalaiva! Handbrake loose-ah thaan irukku!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '2',
    portrait: '/assets/portraits/vimal.jpg',
    description:
      'Reinforced black-and-yellow Premier taxi with plush dashboard dice, Ganesha idol, and chrome hood mirror. Can be summoned for 360-degree drift cover or environmental hazard chain reactions.',
    loreNote: 'Registered in Panaji, Goa. Survived 14 cartel ambushes and 3 suspension bridge shootouts.',
    stats: [
      { label: 'Drift Impact', value: '4.2 Ton Force', barPercent: 86 },
      { label: 'Laser Deflection', value: 'Chrome Hood 180°', barPercent: 80 },
      { label: 'Extraction Speed', value: '115 km/h Alley', barPercent: 88 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'mathew_mercedes',
    code: 'CAM-02 // KERALA KINGPIN',
    name: 'Mathew — Vintage W123 Mercedes & Cigar',
    subtitleTanglish: '"Ivide oru Mercedes vandhaal... Barricades thool-aakum."',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/mathew.jpg',
    description:
      'Summons Kerala underworld patriarch Mathew in his tailored tweed blazer. His armored vintage sedan bulldozes street barricades while his men sweep the perimeter.',
    loreNote: 'Never drops his Cuban cigar ash, even while ramming an armored enforcement convoy.',
    stats: [
      { label: 'Barricade Breach', value: 'Unstoppable', barPercent: 98 },
      { label: 'Syndicate Authority', value: '+3,500 Aura', barPercent: 92 },
      { label: 'Area Suppression', value: 'Full Street', barPercent: 90 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'narasimha_melee',
    code: 'CAM-03 // MANDYA FURY',
    name: 'Narasimha — Rain-Slicked Alley Hurricane',
    subtitleTanglish: '"Naan ulla vandhutaen... Yaarukkum vazhi illa!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/narasimha.jpg',
    description:
      'Calls in Karnataka syndicate warlord Narasimha. Walks straight through brick walls and scatters heavy machete squads in close-quarters combat.',
    loreNote: 'Owes Muthuvel Pandian a lifelong blood debt from the old Mysore prison uprising.',
    stats: [
      { label: 'Close-Quarters', value: 'Lethal Shockwave', barPercent: 100 },
      { label: 'Intimidation', value: 'Instant Disarm', barPercent: 96 },
      { label: 'Armor Penetration', value: 'Heavy Breacher', barPercent: 94 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'driver_veshti',
    code: 'ATT-01 // CHENNAI PATRIARCH',
    name: 'Handloom Silk Veshti & Linen Shirt',
    subtitleTanglish: '"Amaithiya irukkurathu bayam illa... Athu en style."',
    category: 'ATTIRE',
    rarity: 'SIGNATURE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Crisp off-white linen button-down paired with a traditional golden-zari bordered Kanchipuram veshti, rudraksha wrist beads, and vintage gold chain.',
    loreNote: 'Deceptively peaceful domestic attire that lowers enemy threat perception in market zones.',
    stats: [
      { label: 'Viji Suspicion Dampening', value: '-35% Detection', barPercent: 90 },
      { label: 'Swagger Stride', value: '100% Composure', barPercent: 100 },
      { label: 'Cultural Mass Appeal', value: 'Legendary', barPercent: 99 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'jailer_overcoat',
    code: 'ATT-02 // TIHAR COMMANDER',
    name: 'Weathered Olive Field Jacket & Dog-Tags',
    subtitleTanglish: '"Naan paatha velai vera... paakura velai vera."',
    category: 'ATTIRE',
    rarity: 'TACTICAL',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Heavy-duty field jacket with reinforced tactical belt, concealed holster, and steel dog-tags. Worn during nocturnal port raids and rooftop showdowns.',
    loreNote: 'Bears scorch marks from the Kalpak Penthouse helipad siege.',
    stats: [
      { label: 'Ballistic Weave', value: '+45% Resilience', barPercent: 88 },
      { label: 'Sniper Sync Speed', value: '+25% Faster Lock', barPercent: 85 },
      { label: 'Intimidation Aura', value: 'x2 Base Aura', barPercent: 95 }
    ],
    unlockedByDefault: true
  }
];
