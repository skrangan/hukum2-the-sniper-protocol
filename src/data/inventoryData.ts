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
    name: 'Gold-Rimmed Aviator Sunglasses',
    subtitleTanglish: '"Kannadi thiruppuna... Katchi maarum."',
    category: 'GEAR',
    rarity: 'SIGNATURE',
    hotkey: 'SPACE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Muthuvel Pandian’s trademark dark aviator shades. When he pauses and flips them on, his rooftop marksmen know the quiet talk is over and take their shot.',
    loreNote: 'Kept in his breast pocket since his Tihar Jail days in Delhi.',
    stats: [
      { label: 'Command Authority', value: 'Hukum x10', barPercent: 100 },
      { label: 'Marksman Signal', value: 'Rooftop Volley', barPercent: 95 },
      { label: 'Composure', value: 'Unshaken', barPercent: 98 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'sniper_designator',
    code: 'Rooftop Marksmen • Old Prison Loyals',
    name: 'Long-Range Rifle Overwatch',
    subtitleTanglish: '"Etthana per irundhalum... orey kuri."',
    category: 'GEAR',
    rarity: 'TACTICAL',
    hotkey: '1',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Former convicts reformed under Tiger Pandian at Tihar who now work as his silent protectors from surrounding rooftops and hilltops.',
    loreNote: 'Positioned across Mylapore terraces, Kochi cranes, and Goan bell towers.',
    stats: [
      { label: 'Rifle Precision', value: 'Pinpoint', barPercent: 98 },
      { label: 'Vantage Distance', value: '800 Meters', barPercent: 92 },
      { label: 'Discipline', value: 'Fires on Hukum', barPercent: 96 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'pollachi_coconut',
    code: 'Mylapore Market • Street Improvisation',
    name: 'Heavy Pollachi Tender Coconut',
    subtitleTanglish: '"Viji paakkama oru chinna thattu..."',
    category: 'HAZARD',
    rarity: 'COVERT',
    hotkey: '2',
    portrait: '/assets/portraits/viji.jpg',
    description:
      'A heavy green coconut fallen beside the vegetable cart. One measured nudge with the sandal sends it straight into the parked auto-rickshaw’s loose handbrake lever.',
    loreNote: 'To Viji and the bystanders, it looks like a harmless market accident.',
    stats: [
      { label: 'Knock Force', value: 'Releases Brake', barPercent: 85 },
      { label: 'Family Secrecy', value: 'No Suspicion', barPercent: 100 },
      { label: 'Street Impact', value: 'Clears Crossing', barPercent: 94 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'vimal_taxi',
    code: 'Goa - Chennai • Getaway Driver',
    name: 'Vimal & His Black-and-Yellow Premier Padmini',
    subtitleTanglish: '"Thalaiva! Handbrake loose-ah thaan irukku!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '2',
    portrait: '/assets/portraits/vimal.jpg',
    description:
      'Panicked yet fiercely loyal tourist taxi driver Vimal behind the wheel of his battered Premier Padmini, complete with hanging plush dice and dashboard Ganesha idol.',
    loreNote: 'Always idling in the nearest side lane with the engine running for a quick extraction.',
    stats: [
      { label: 'Alleyway Getaway', value: 'Instant Pickup', barPercent: 90 },
      { label: 'Street Blockade', value: 'Broadside Skid', barPercent: 84 },
      { label: 'Loyalty to Tiger', value: '100%ride-or-die', barPercent: 96 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'mathew_mercedes',
    code: 'Kochi Underworld • Old Friend',
    name: 'Mathew — Vintage Brown Blazer & W123 Sedan',
    subtitleTanglish: '"Ivide oru Mercedes vandhaal... Barricades thool-aakum."',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/mathew.jpg',
    description:
      'Charismatic Kerala kingpin Mathew in his tailored tweed blazer, gold watch, and Cuban cigar. One phone call from Muthuvel brings his classic sedan crashing through any cartel roadblock.',
    loreNote: 'A bond forged decades ago; Mathew never turns down a request from Tiger.',
    stats: [
      { label: 'Underworld Reach', value: 'All Ports & Highways', barPercent: 98 },
      { label: 'Convoy Ambush', value: 'Heavy Ramming', barPercent: 94 },
      { label: 'Presence', value: '+3,500 Composure', barPercent: 95 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'narasimha_melee',
    code: 'Mandya & Bengaluru • Brotherhood',
    name: 'Narasimha — Rain-Slicked Leather & Iron Fist',
    subtitleTanglish: '"Naan ulla vandhutaen... Yaarukkum vazhi illa!"',
    category: 'CAMEO',
    rarity: 'SYNDICATE',
    hotkey: '3',
    portrait: '/assets/portraits/narasimha.jpg',
    description:
      'Feared Karnataka underworld figure Narasimha in his rain-drenched black leather jacket and silver pendant. Steps into the alley and single-handedly dismantles armed machete gangs.',
    loreNote: 'When Narasimha walks into the frame, rival enforcers drop their weapons.',
    stats: [
      { label: 'Close-Quarters', value: 'Unmatched', barPercent: 100 },
      { label: 'Fear Factor', value: 'Gang Scatter', barPercent: 98 },
      { label: 'Brotherhood', value: 'Sworn Ally', barPercent: 99 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'driver_veshti',
    code: 'Chennai Residence • Everyday Wear',
    name: 'Cream Linen Shirt & Gold-Bordered Veshti',
    subtitleTanglish: '"Amaithiya irukkurathu bayam illa... Athu en style."',
    category: 'ATTIRE',
    rarity: 'SIGNATURE',
    portrait: '/assets/portraits/tiger.jpg',
    description:
      'Tailored off-white linen shirt worn over a traditional handloom veshti with a thin gold chain and rudraksha wrist beads — the unassuming look of a retired grandfather.',
    loreNote: 'Keeps Viji calm during morning market errands while concealing who he truly is.',
    stats: [
      { label: 'Low Profile', value: 'Blends in Bazaar', barPercent: 92 },
      { label: 'Demeanor', value: 'Calm Patriarch', barPercent: 100 },
      { label: 'Respect', value: 'Unspoken', barPercent: 98 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'jailer_overcoat',
    code: 'Tihar Years • Night Operations',
    name: 'Dark Field Jacket & Service Watch',
    subtitleTanglish: '"Naan paatha velai vera... paakura velai vera."',
    category: 'ATTIRE',
    rarity: 'TACTICAL',
    portrait: '/assets/portraits/poster.jpg',
    description:
      'Heavy-duty dark olive jacket worn over an open-collared shirt during nocturnal port ambushes, highway tea-stall standoffs, and the Goa fortress raid.',
    loreNote: 'Reminds the syndicate that the old Jailer never truly retired.',
    stats: [
      { label: 'Night Cover', value: 'Low Visibility', barPercent: 90 },
      { label: 'Endurance', value: 'Rugged Cloth', barPercent: 88 },
      { label: 'Fearsome Reputation', value: 'Tiger Ka Hukum', barPercent: 100 }
    ],
    unlockedByDefault: true
  }
];
