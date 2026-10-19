import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager';

export interface Game3DState {
  aura: number;
  multiplier: number;
  composure: number;
  vijiSuspicion: number;
  hukumMode: boolean;
  phase: 'STEALTH' | 'HUKUM' | 'VICTORY' | 'BUSTED';
  coconutKicked: boolean;
  rickshawRolling: boolean;
  fireworksExploded: boolean;
}

export class MarketScene3D {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Characters & Entities
  public tigerGroup: THREE.Group = new THREE.Group();
  public vijiGroup: THREE.Group = new THREE.Group();
  public rickshawGroup: THREE.Group = new THREE.Group();
  public coconutMesh!: THREE.Mesh;
  public fireworksGroup: THREE.Group = new THREE.Group();
  public cameoVehicleGroup: THREE.Group = new THREE.Group();
  public environmentGroup: THREE.Group = new THREE.Group();

  public thugs: {
    group: THREE.Group;
    alive: boolean;
    vel: THREE.Vector3;
    rotVel: THREE.Vector3;
    initialPos: THREE.Vector3;
  }[] = [];
  public sniperBeams: THREE.Line[] = [];
  public sniperReticles: THREE.Mesh[] = [];
  public fireworkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  public embers: THREE.Points | null = null;

  // Lighting refs for dynamic chapter atmospheres
  private ambientLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private streetLights: THREE.PointLight[] = [];

  // Vision Cone
  private vijiVisionMesh!: THREE.Mesh;
  private vijiAngle: number = 0;
  private vijiTurnTimer: number = 0;

  // State
  public state: Game3DState = {
    aura: 0,
    multiplier: 1,
    composure: 100,
    vijiSuspicion: 0,
    hukumMode: false,
    phase: 'STEALTH',
    coconutKicked: false,
    rickshawRolling: false,
    fireworksExploded: false
  };

  private currentLevelId: number = 1;
  private startTime: number = 0;
  private walkTime: number = 0;
  private footstepTimer: number = 0;
  private tigerGlassesGroup!: THREE.Group;
  private tigerArmL!: THREE.Group;
  private tigerArmR!: THREE.Group;
  private tigerLegL!: THREE.Group;
  private tigerLegR!: THREE.Group;
  private tigerTorsoMesh!: THREE.Mesh;

  // Procedural Realistic PBR Textures
  private asphaltTex!: THREE.CanvasTexture;
  private cobblestoneTex!: THREE.CanvasTexture;
  private stoneTempleTex!: THREE.CanvasTexture;
  private woodBarkTex!: THREE.CanvasTexture;
  private fabricSilkTex!: THREE.CanvasTexture;
  private neonSignTex!: THREE.CanvasTexture;

  // Callbacks
  public onStateUpdate?: (state: Game3DState) => void;
  public onDialogue?: (key: string) => void;
  public onVictory?: (summary: any) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1322);
    this.scene.fog = new THREE.FogExp2(0x0c1322, 0.016);

    // Cinematic 3D Perspective Camera (35mm Anamorphic feel)
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-13, 15.5, 21);
    this.camera.lookAt(0, 1.5, 0);

    this.generateRealisticTextures();
    this.initLights();
    this.scene.add(this.environmentGroup);
    this.buildRichMarketEnvironment();
    this.buildTigerCharacter();
    this.buildVijiCharacter();
    this.buildAutoRickshaw();
    this.buildCoconutHazard();
    this.buildFireworksCart();
    this.buildThugs();
    this.buildAtmosphericEmbers();

    this.startTime = Date.now();
  }

  // Generate high-detail procedural CanvasTextures for asphalt, carved temple stone, silk zari, and neon signs
  private generateRealisticTextures() {
    // 1. Wet Weathered Asphalt Texture with Road Grime & Lane Markings
    const aspCanvas = document.createElement('canvas');
    aspCanvas.width = 512;
    aspCanvas.height = 512;
    const actx = aspCanvas.getContext('2d')!;
    actx.fillStyle = '#18202c';
    actx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const v = 20 + Math.floor(Math.random() * 28);
      actx.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
      actx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    // Subtle wet tire tracks
    actx.fillStyle = 'rgba(10, 15, 25, 0.35)';
    actx.fillRect(190, 0, 35, 512);
    actx.fillRect(290, 0, 35, 512);
    this.asphaltTex = new THREE.CanvasTexture(aspCanvas);
    this.asphaltTex.wrapS = THREE.RepeatWrapping;
    this.asphaltTex.wrapT = THREE.RepeatWrapping;
    this.asphaltTex.repeat.set(6, 6);

    // 2. Sidewalk Heritage Stone Flagstones
    const cobCanvas = document.createElement('canvas');
    cobCanvas.width = 256;
    cobCanvas.height = 256;
    const cctx = cobCanvas.getContext('2d')!;
    cctx.fillStyle = '#2d3748';
    cctx.fillRect(0, 0, 256, 256);
    cctx.strokeStyle = '#1a202c';
    cctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        cctx.fillStyle = (x + y) % 64 === 0 ? '#384252' : '#2c3545';
        cctx.fillRect((x + offset) % 256, y, 62, 30);
        cctx.strokeRect((x + offset) % 256, y, 62, 30);
      }
    }
    this.cobblestoneTex = new THREE.CanvasTexture(cobCanvas);
    this.cobblestoneTex.wrapS = THREE.RepeatWrapping;
    this.cobblestoneTex.wrapT = THREE.RepeatWrapping;
    this.cobblestoneTex.repeat.set(3, 12);

    // 3. Carved Dravidian Temple Granite Pillar Texture
    const stCanvas = document.createElement('canvas');
    stCanvas.width = 256;
    stCanvas.height = 256;
    const sctx = stCanvas.getContext('2d')!;
    sctx.fillStyle = '#4a453e';
    sctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      sctx.fillStyle = '#36322d';
      sctx.fillRect(0, y, 256, 6);
      sctx.fillStyle = '#635c52';
      sctx.fillRect(12, y + 10, 232, 14);
    }
    this.stoneTempleTex = new THREE.CanvasTexture(stCanvas);

    // 4. Aged Teak Wood & Crate Texture
    const wdCanvas = document.createElement('canvas');
    wdCanvas.width = 256;
    wdCanvas.height = 256;
    const wctx = wdCanvas.getContext('2d')!;
    wctx.fillStyle = '#5c3419';
    wctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 64; i++) {
      wctx.fillStyle = i % 2 === 0 ? 'rgba(40,20,5,0.28)' : 'rgba(120,75,35,0.2)';
      wctx.fillRect(0, i * 4, 256, 2);
    }
    this.woodBarkTex = new THREE.CanvasTexture(wdCanvas);

    // 5. Kanchipuram Maroon & Gold Zari Silk Texture
    const silkCanvas = document.createElement('canvas');
    silkCanvas.width = 128;
    silkCanvas.height = 128;
    const kctx = silkCanvas.getContext('2d')!;
    kctx.fillStyle = '#7f1d1d';
    kctx.fillRect(0, 0, 128, 128);
    kctx.fillStyle = '#f59e0b';
    kctx.fillRect(0, 102, 128, 20);
    for (let x = 0; x < 128; x += 16) {
      kctx.fillRect(x, 94, 8, 6);
    }
    this.fabricSilkTex = new THREE.CanvasTexture(silkCanvas);

    // 6. South Indian Bazaar Storefront Signboard Texture
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const nctx = signCanvas.getContext('2d')!;
    nctx.fillStyle = '#0f172a';
    nctx.fillRect(0, 0, 512, 128);
    nctx.strokeStyle = '#f59e0b';
    nctx.lineWidth = 6;
    nctx.strokeRect(6, 6, 500, 116);
    nctx.fillStyle = '#facc15';
    nctx.font = 'bold 34px sans-serif';
    nctx.fillText('MUTHUVEL BAZAAR & TEA STALL', 24, 58);
    nctx.fillStyle = '#38bdf8';
    nctx.font = 'bold 22px monospace';
    nctx.fillText('CHENNAI - GOA SYNDICATE CORRIDOR', 28, 98);
    this.neonSignTex = new THREE.CanvasTexture(signCanvas);
  }

  private initLights() {
    // Realistic Warm-vs-Cool Cinema Hemisphere Light (Teal & Orange Film Grade)
    this.ambientLight = new THREE.HemisphereLight(0xffedd5, 0x1e293b, 0.85);
    this.scene.add(this.ambientLight);

    // Golden Hour Key Sun Directional Light with High-Res Soft Shadows
    this.sunLight = new THREE.DirectionalLight(0xffb46b, 1.85);
    this.sunLight.position.set(-18, 28, 18);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 75;
    this.sunLight.shadow.camera.left = -28;
    this.sunLight.shadow.camera.right = 28;
    this.sunLight.shadow.camera.top = 28;
    this.sunLight.shadow.camera.bottom = -28;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Cool Teal Cinema Rim Backlight
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    this.rimLight.position.set(16, 14, -18);
    this.scene.add(this.rimLight);

    // Warm Sodium Vapor Bazaar Streetlights
    const lampCoords = [
      new THREE.Vector3(2.5, 6.2, 4),
      new THREE.Vector3(-4.5, 6.2, -7),
      new THREE.Vector3(8.5, 6.2, 9)
    ];
    lampCoords.forEach((pos) => {
      const pLight = new THREE.PointLight(0xf59e0b, 2.2, 22);
      pLight.position.copy(pos);
      pLight.castShadow = true;
      this.scene.add(pLight);
      this.streetLights.push(pLight);
    });
  }

  private buildRichMarketEnvironment() {
    // Clear previous environment meshes if rebuilding
    while (this.environmentGroup.children.length > 0) {
      this.environmentGroup.remove(this.environmentGroup.children[0]);
    }

    // 1. Textured Wet Asphalt Street Surface
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      roughness: 0.58,
      metalness: 0.22
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    // Double Yellow Center Divider + Pedestrian School Crossing Zebra Stripes
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    for (const offset of [-0.22, 0.22]) {
      const roadLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 48), lineMat);
      roadLine.rotation.x = -Math.PI / 2;
      roadLine.position.set(offset, 0.02, 0);
      roadLine.receiveShadow = true;
      this.environmentGroup.add(roadLine);
    }

    const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    for (let i = -4; i <= 4; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.4), whiteStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 1.1 + 3.5, 0.025, 5.5);
      stripe.receiveShadow = true;
      this.environmentGroup.add(stripe);
    }

    // 2. Left & Right Raised Stone Sidewalks with Black-and-Yellow Indian Curbs
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.cobblestoneTex,
      roughness: 0.78
    });
    const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    leftSidewalk.position.set(-9.5, 0.175, 0);
    leftSidewalk.receiveShadow = true;
    this.environmentGroup.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    rightSidewalk.position.set(13.5, 0.175, 0);
    rightSidewalk.receiveShadow = true;
    this.environmentGroup.add(rightSidewalk);

    // Iconic Black & Yellow Painted Curb Stones along the road edge
    for (let z = -20; z <= 20; z += 2) {
      const isYellow = Math.abs(z / 2) % 2 === 0;
      const curbMat = new THREE.MeshStandardMaterial({
        color: isYellow ? 0xfacc15 : 0x111827,
        roughness: 0.6
      });
      const curbBlock = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.38, 1.95), curbMat);
      curbBlock.position.set(-4.0, 0.19, z);
      curbBlock.castShadow = true;
      curbBlock.receiveShadow = true;
      this.environmentGroup.add(curbBlock);
    }

    // 3. Dravidian Stone Temple Mandapam & Brass Deepam Pillar (Authentic South Indian Architecture)
    this.buildTempleMandapam(-11.5, 0.35, 6.5);

    // 4. Detailed Colonial & Bazaar Shopfront Buildings with Arched Verandas & Glowing Signs
    this.buildColonialShopfront(-13.2, 0.35, -5.5, 0x7c2d12, true);
    this.buildColonialShopfront(15.5, 0.35, -3.0, 0x1e3a8a, false);
    this.buildColonialShopfront(15.5, 0.35, 9.0, 0x14532d, false);

    // 5. Authentic Indian Market Stalls with Produce Crates, Spice Sacks, Brass Tea Boiler & Banana Trees
    this.createDetailedMarketStall(-7.8, 0.35, -6.5, 0xb91c1c, 'coconut_bazaar');
    this.createDetailedMarketStall(-7.8, 0.35, 1.5, 0x0369a1, 'spice_silk');
    this.createDetailedMarketStall(-7.8, 0.35, 10.5, 0x047857, 'tea_stall');

    // 6. Lush Tropical Coconut Palms & Banana Foliage
    this.createCoconutPalm(-11.0, 0.35, -12.0, 1.1);
    this.createCoconutPalm(11.5, 0.35, -10.5, 0.95);
    this.createCoconutPalm(12.0, 0.35, 14.5, 1.15);

    // 7. Cast-Iron Street Lamps & Overhead Festival Bunting / Electric Wires
    this.createStreetLamp(2.5, 0, 4);
    this.createStreetLamp(-4.2, 0, -7);
    this.createStreetLamp(8.2, 0, 9);
    this.createOverheadCablesAndBunting();

    // 8. Vimal's Iconic Black-and-Yellow Premier Padmini Tourist Taxi parked at alley extraction point
    this.buildVimalPremierTaxi(-1.5, 0, -12.5);
  }

  private buildTempleMandapam(x: number, y: number, z: number) {
    const temple = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.stoneTempleTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // Stepped Stone Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 6.2), stoneMat);
    plinth.position.y = 0.3;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    temple.add(plinth);

    // 4 Carved Dravidian Stone Pillars
    const pillarCoords = [
      [-1.9, 2.4, -2.2],
      [1.9, 2.4, -2.2],
      [-1.9, 2.4, 2.2],
      [1.9, 2.4, 2.2]
    ];
    pillarCoords.forEach(([px, py, pz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.8, 0.65), stoneMat);
      col.position.set(px, py, pz);
      col.castShadow = true;
      col.receiveShadow = true;
      temple.add(col);

      // Ornate capital bracket
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 1.05), stoneMat);
      cap.position.set(px, py + 1.95, pz);
      temple.add(cap);
    });

    // Stepped Gopuram Roof Tier
    const roofBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 6.6), stoneMat);
    roofBase.position.y = 4.6;
    roofBase.castShadow = true;
    temple.add(roofBase);

    const gopuramTier1 = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.1, 4.8),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 })
    );
    gopuramTier1.position.y = 5.45;
    temple.add(gopuramTier1);

    const kalasamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    for (const kz of [-1.2, 0, 1.2]) {
      const kalasam = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 12), kalasamMat);
      kalasam.position.set(0, 6.3, kz);
      temple.add(kalasam);
    }

    // Traditional Brass Oil Lamp (Kuthuvilakku Deepam) with warm glowing flame
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.32, 1.45, 12), brassMat);
    lampStand.position.set(2.1, 1.3, 0);
    temple.add(lampStand);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    flame.position.set(2.1, 2.1, 0);
    temple.add(flame);

    temple.position.set(x, y, z);
    this.environmentGroup.add(temple);
  }

  private buildColonialShopfront(x: number, y: number, z: number, wallHex: number, hasSignboard: boolean) {
    const bldg = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.82 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });

    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(5.5, 8.5, 9.5), wallMat);
    mainBlock.position.y = 4.25;
    mainBlock.castShadow = true;
    mainBlock.receiveShadow = true;
    bldg.add(mainBlock);

    // Cornice Molding
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.45, 9.9), trimMat);
    cornice.position.y = 8.55;
    bldg.add(cornice);

    // Warm Illuminated Upper Windows with Wooden Louvered Shutters
    const winMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
    const faceX = x < 0 ? 2.78 : -2.78;
    for (const wz of [-2.6, 0, 2.6]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.9), winMat);
      win.position.set(faceX, 5.8, wz);
      win.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      bldg.add(win);
    }

    if (hasSignboard) {
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1.35, 6.8),
        new THREE.MeshBasicMaterial({ map: this.neonSignTex })
      );
      sign.position.set(faceX + (x < 0 ? 0.15 : -0.15), 3.6, 0);
      bldg.add(sign);
    }

    bldg.position.set(x, y, z);
    this.environmentGroup.add(bldg);
  }

  private createDetailedMarketStall(x: number, y: number, z: number, canopyColor: number, type: string) {
    const stall = new THREE.Group();

    // Textured Teak Wood Counter
    const tableGeo = new THREE.BoxGeometry(3.2, 1.15, 4.2);
    const tableMat = new THREE.MeshStandardMaterial({
      map: this.woodBarkTex,
      roughness: 0.78
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.58;
    table.castShadow = true;
    table.receiveShadow = true;
    stall.add(table);

    // Four Bamboo/Iron Canopy Poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.6, roughness: 0.4 });
    const polePositions = [
      [-1.4, 1.5, -1.9],
      [1.4, 1.5, -1.9],
      [-1.4, 1.5, 1.9],
      [1.4, 1.5, 1.9]
    ];
    polePositions.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 10), poleMat);
      p.position.set(px, py + 0.55, pz);
      p.castShadow = true;
      stall.add(p);
    });

    // Sloped Market Tarpaulin Awning with Scalloped Valance
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.18, 4.6),
      new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.55 })
    );
    awning.position.y = 3.15;
    awning.rotation.z = -0.12;
    awning.castShadow = true;
    stall.add(awning);

    // Authentic Props on Counter
    if (type === 'coconut_bazaar') {
      const cocoMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.75 });
      for (let i = 0; i < 9; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), cocoMat);
        c.position.set(-0.6 + (i % 3) * 0.52, 1.32 + Math.floor(i / 6) * 0.35, -0.8 + Math.floor(i / 3) * 0.55);
        c.castShadow = true;
        stall.add(c);
      }
    } else if (type === 'tea_stall') {
      // Brass Kumbakonam Degree Coffee / Tea Boiler Samovar
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.95, 16), brassMat);
      boiler.position.set(0.4, 1.62, -0.5);
      boiler.castShadow = true;
      stall.add(boiler);

      // Hanging Glass Jars & Banana Bunches
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
      const bunch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.65, 10), bananaMat);
      bunch.position.set(1.2, 2.55, 1.4);
      stall.add(bunch);
    } else {
      // Folded Silk Sarees & Spice Burlap Sacks
      const silkStack = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.45, 1.6),
        new THREE.MeshStandardMaterial({ map: this.fabricSilkTex, roughness: 0.5 })
      );
      silkStack.position.set(0, 1.38, 0);
      stall.add(silkStack);
    }

    stall.position.set(x, y, z);
    this.environmentGroup.add(stall);
  }

  private createCoconutPalm(x: number, y: number, z: number, scale: number) {
    const palm = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.9 });

    // Segmented Curved Palm Trunk
    for (let i = 0; i < 7; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 - i * 0.02, 0.32 - i * 0.02, 1.25, 10),
        trunkMat
      );
      seg.position.set(Math.sin(i * 0.18) * 0.35, 0.6 + i * 1.15, 0);
      seg.rotation.z = -i * 0.04;
      seg.castShadow = true;
      palm.add(seg);
    }

    // Lush Tropical Fronds Crown
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 2.8), frondMat);
      frond.position.set(0.35 + Math.cos(angle) * 1.2, 8.2, Math.sin(angle) * 1.2);
      frond.rotation.y = -angle + Math.PI / 2;
      frond.rotation.x = 0.35;
      frond.castShadow = true;
      palm.add(frond);
    }

    palm.position.set(x, y, z);
    palm.scale.setScalar(scale);
    this.environmentGroup.add(palm);
  }

  private createStreetLamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.3 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.8, 12), ironMat);
    base.position.y = 0.4;
    lampGroup.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 5.8, 12), ironMat);
    pole.position.y = 3.1;
    pole.castShadow = true;
    lampGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.1), ironMat);
    arm.position.set(0.45, 5.95, 0);
    lampGroup.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    bulb.position.set(0.9, 5.8, 0);
    lampGroup.add(bulb);

    lampGroup.position.set(x, y, z);
    this.environmentGroup.add(lampGroup);
  }

  private createOverheadCablesAndBunting() {
    const flagColors = [0xef4444, 0xfacc15, 0x3b82f6, 0x10b981, 0xf97316];
    for (const zPos of [-4, 4, 11]) {
      const cablePts = [
        new THREE.Vector3(-10, 6.8, zPos),
        new THREE.Vector3(0, 6.1, zPos),
        new THREE.Vector3(12, 6.8, zPos)
      ];
      const curve = new THREE.QuadraticBezierCurve3(cablePts[0], cablePts[1], cablePts[2]);
      const pts = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x334155 })
      );
      this.environmentGroup.add(line);

      // Festive Marigold & Pennant Bunting along the wire
      for (let i = 2; i < 18; i += 2) {
        const pt = pts[i];
        const flag = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.42, 4),
          new THREE.MeshBasicMaterial({ color: flagColors[i % flagColors.length] })
        );
        flag.position.copy(pt).add(new THREE.Vector3(0, -0.2, 0));
        flag.rotation.x = Math.PI;
        this.environmentGroup.add(flag);
      }
    }
  }

  // Vimal's Premier Padmini Black-and-Yellow Tourist Taxi
  private buildVimalPremierTaxi(x: number, y: number, z: number) {
    const taxi = new THREE.Group();
    const blackBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.65,
      roughness: 0.3
    });
    const yellowRoofMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.4,
      roughness: 0.35
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.85, 4.4), blackBodyMat);
    lowerBody.position.y = 0.75;
    lowerBody.castShadow = true;
    taxi.add(lowerBody);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.78, 2.3), yellowRoofMat);
    cabin.position.set(0, 1.52, -0.15);
    cabin.castShadow = true;
    taxi.add(cabin);

    // Chrome Grille & Round Classic Headlights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.12), chromeMat);
    grille.position.set(0, 0.75, 2.22);
    taxi.add(grille);

    for (const hx of [-0.75, 0.75]) {
      const hLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      hLight.position.set(hx, 0.85, 2.22);
      taxi.add(hLight);
    }

    // Illuminated "TAXI" Roof Sign
    const roofSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.24, 0.28),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    roofSign.position.set(0, 2.02, 0.2);
    taxi.add(roofSign);

    taxi.position.set(x, y, z);
    taxi.rotation.y = 0.35;
    this.environmentGroup.add(taxi);
  }

  private buildAtmosphericEmbers() {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.14,
      transparent: true,
      opacity: 0.65
    });
    this.embers = new THREE.Points(geo, mat);
    this.scene.add(this.embers);
  }

  // Detailed 3D Portrayal: "Tiger" Muthuvel Pandian (Superstar Rajinikanth in Jailer)
  private buildTigerCharacter() {
    this.tigerGroup = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.18
    });

    // Tailored Linen Shirt Torso + Rolled Sleeves + Open Collar
    const torsoGeo = new THREE.BoxGeometry(0.92, 1.22, 0.48);
    this.tigerTorsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    this.tigerTorsoMesh.position.y = 1.65;
    this.tigerTorsoMesh.castShadow = true;
    this.tigerGroup.add(this.tigerTorsoMesh);

    // Subtle Dark Undershirt V-Neck + Gold Chain Around Neck
    const neckChain = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 20), goldMat);
    neckChain.rotation.x = Math.PI / 2.3;
    neckChain.position.set(0, 2.22, 0.12);
    this.tigerGroup.add(neckChain);

    // Sculpted Head & Jawline
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), skinMat);
    head.scale.set(0.95, 1.08, 0.98);
    head.position.y = 2.58;
    head.castShadow = true;
    this.tigerGroup.add(head);

    // Salt-and-Pepper Side-Swept Hair & Receding Temples
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCrown.position.set(0, 2.64, -0.04);
    this.tigerGroup.add(hairCrown);

    // Groomed White/Silver Full Beard & Iconic Mustache
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
    const beard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.28, 16),
      beardMat
    );
    beard.position.set(0, 2.4, 0.16);
    this.tigerGroup.add(beard);

    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.12), beardMat);
    mustache.position.set(0, 2.49, 0.34);
    this.tigerGroup.add(mustache);

    // 24K Gold-Rimmed Aviator Sunglasses (Dual Lenses + Gold Nose Bridge)
    this.tigerGlassesGroup = new THREE.Group();
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.95,
      roughness: 0.08
    });
    for (const lx of [-0.14, 0.14]) {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.05, 16), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(lx, 0, 0);
      this.tigerGlassesGroup.add(lens);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 20), goldMat);
      rim.position.set(lx, 0, 0.01);
      this.tigerGlassesGroup.add(rim);
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), goldMat);
    bridge.position.set(0, 0.04, 0.02);
    this.tigerGlassesGroup.add(bridge);

    this.tigerGlassesGroup.position.set(0, 2.6, 0.35);
    this.tigerGroup.add(this.tigerGlassesGroup);

    // Traditional Pleated Kanchipuram Silk Veshti with Gold Zari Border
    const veshtiMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    const veshti = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.54, 1.15, 20), veshtiMat);
    veshti.position.y = 0.65;
    veshti.castShadow = true;
    this.tigerGroup.add(veshti);

    const zariBorder = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.55, 0.12, 20), goldMat);
    zariBorder.position.y = 0.18;
    this.tigerGroup.add(zariBorder);

    // Articulated Arms with Rolled Cuffs, Forearms, Gold Watch & Rudraksha Wrist Beads
    this.tigerArmL = new THREE.Group();
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.48, 12), shirtMat);
    sleeveL.position.y = -0.2;
    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 12), skinMat);
    forearmL.position.y = -0.58;
    const watch = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 16), goldMat);
    watch.rotation.x = Math.PI / 2;
    watch.position.y = -0.72;
    this.tigerArmL.add(sleeveL, forearmL, watch);
    this.tigerArmL.position.set(-0.58, 2.1, 0);
    this.tigerGroup.add(this.tigerArmL);

    this.tigerArmR = new THREE.Group();
    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.48, 12), shirtMat);
    sleeveR.position.y = -0.2;
    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 12), skinMat);
    forearmR.position.y = -0.58;
    const rudraksha = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.022, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    rudraksha.rotation.x = Math.PI / 2;
    rudraksha.position.y = -0.72;
    this.tigerArmR.add(sleeveR, forearmR, rudraksha);
    this.tigerArmR.position.set(0.58, 2.1, 0);
    this.tigerGroup.add(this.tigerArmR);

    // Leather Sandals / Footwear Legs
    this.tigerLegL = new THREE.Group();
    this.tigerLegR = new THREE.Group();
    const sandalMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.42), sandalMat);
    footL.position.set(-0.22, 0.06, 0.08);
    this.tigerLegL.add(footL);
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.42), sandalMat);
    footR.position.set(0.22, 0.06, 0.08);
    this.tigerLegR.add(footR);
    this.tigerGroup.add(this.tigerLegL, this.tigerLegR);

    // Position Tiger in alley
    this.tigerGroup.position.set(-6, 0, -2);
    this.scene.add(this.tigerGroup);
  }

  public setTigerAttire(attireId: string) {
    if (!this.tigerTorsoMesh) return;
    const mat = this.tigerTorsoMesh.material as THREE.MeshStandardMaterial;
    if (attireId === 'jailer_overcoat') {
      mat.color.setHex(0x3f4f3a); // Weathered Tihar Olive Field Jacket
    } else {
      mat.color.setHex(0xf8fafc); // Crisp White Linen Shirt
    }
  }

  // Detailed 3D Model: Viji (Kanchipuram Maroon & Gold Silk Saree, Gold Jewelry, Jasmine Gajra)
  private buildVijiCharacter() {
    this.vijiGroup = new THREE.Group();

    const sareeMat = new THREE.MeshStandardMaterial({
      map: this.fabricSilkTex,
      roughness: 0.55
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.65 });

    // Draped Kanchipuram Saree Skirt & Pallu
    const sareeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 1.45, 20), sareeMat);
    sareeSkirt.position.y = 0.72;
    sareeSkirt.castShadow = true;
    this.vijiGroup.add(sareeSkirt);

    const blouse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.36, 0.68, 16),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 })
    );
    blouse.position.y = 1.68;
    blouse.castShadow = true;
    this.vijiGroup.add(blouse);

    // Traditional Gold Kasu Mala Necklace
    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 20), goldMat);
    necklace.rotation.x = Math.PI / 2.2;
    necklace.position.set(0, 1.96, 0.08);
    this.vijiGroup.add(necklace);

    // Head + Red Kungumam Bindi
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), skinMat);
    head.position.y = 2.28;
    head.castShadow = true;
    this.vijiGroup.add(head);

    const bindi = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    bindi.position.set(0, 2.34, 0.31);
    this.vijiGroup.add(bindi);

    // Kondai Hair Bun Adorned with Fresh White Jasmine Gajra Garland
    const bun = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 })
    );
    bun.position.set(0, 2.3, -0.26);
    this.vijiGroup.add(bun);

    const jasmine = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.055, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.4 })
    );
    jasmine.position.set(0, 2.3, -0.25);
    this.vijiGroup.add(jasmine);

    // Volumetric Vision Cone on the Street
    const coneGeo = new THREE.ConeGeometry(5, 10, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    this.vijiVisionMesh = new THREE.Mesh(coneGeo, coneMat);
    this.vijiVisionMesh.rotation.x = -Math.PI / 2;
    this.vijiVisionMesh.position.set(0, 0.12, 5);
    this.vijiGroup.add(this.vijiVisionMesh);

    this.vijiGroup.position.set(-6, 0, 6);
    this.scene.add(this.vijiGroup);
  }

  // Detailed 3D Model: Chennai/Goa Green-and-Yellow Auto-Rickshaw
  private buildAutoRickshaw() {
    this.rickshawGroup = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      metalness: 0.45,
      roughness: 0.35
    });
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.45
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15
    });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.15, 3.4), chassisMat);
    chassis.position.y = 0.95;
    chassis.castShadow = true;
    this.rickshawGroup.add(chassis);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.92, 2.65), hoodMat);
    hood.position.set(0, 1.98, -0.2);
    hood.castShadow = true;
    this.rickshawGroup.add(hood);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.82),
      new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.72
      })
    );
    glass.position.set(0, 1.96, 1.15);
    this.rickshawGroup.add(glass);

    // Chrome Front Fender & Twin Headlights
    const fender = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 0.25), chromeMat);
    fender.position.set(0, 0.65, 1.78);
    this.rickshawGroup.add(fender);

    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    light.position.set(0, 1.05, 1.75);
    this.rickshawGroup.add(light);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });

    const wheelCoords = [
      [0, 0.42, 1.25],
      [-1.12, 0.42, -0.85],
      [1.12, 0.42, -0.85]
    ];
    wheelCoords.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      this.rickshawGroup.add(w);
    });

    this.rickshawGroup.position.set(-1, 0, -3);
    this.rickshawGroup.rotation.y = 0.4;
    this.scene.add(this.rickshawGroup);
  }

  // 3D Model: Coconut Hazard with Golden Highlight Ring
  private buildCoconutHazard() {
    const coconutGeo = new THREE.SphereGeometry(0.38, 20, 20);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d,
      roughness: 0.65,
      metalness: 0.1
    });
    this.coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    this.coconutMesh.scale.set(1.0, 1.18, 1.0);
    this.coconutMesh.position.set(-3.5, 0.4, -2);
    this.coconutMesh.castShadow = true;

    // Subtle tactical target ring under coconut
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.62, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.32;
    this.coconutMesh.add(ring);

    this.scene.add(this.coconutMesh);
  }

  // 3D Model: Diwali Fireworks Cart
  private buildFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    const cartMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.85 });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 4.1), cartMat);
    cart.position.y = 0.85;
    cart.castShadow = true;
    this.fireworksGroup.add(cart);

    // Colorful Sivakasi Diwali Firework Rocket Tubes & Cones
    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7];
    for (let i = 0; i < 10; i++) {
      const cHex = colors[i % colors.length];
      const tubeGroup = new THREE.Group();
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 1.25, 12),
        new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.4 })
      );
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      nose.position.y = 0.78;
      tubeGroup.add(tube, nose);
      tubeGroup.position.set(-0.85 + (i % 5) * 0.42, 1.68, -1.1 + Math.floor(i / 5) * 1.6);
      this.fireworksGroup.add(tubeGroup);
    }

    this.fireworksGroup.position.set(7, 0, 10);
    this.scene.add(this.fireworksGroup);
  }

  // 3D Models: 4 Bike Thugs with Street Motorcycles & Machetes
  private buildThugs() {
    const thugPositions = [
      new THREE.Vector3(3.5, 0, 4),
      new THREE.Vector3(5.0, 0, 5),
      new THREE.Vector3(3.0, 0, 6.5),
      new THREE.Vector3(6.0, 0, 7.5)
    ];

    thugPositions.forEach((pos) => {
      const group = new THREE.Group();

      // Leather Jacket Torso
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 1.15, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.45, metalness: 0.3 })
      );
      body.position.y = 1.32;
      body.castShadow = true;
      group.add(body);

      // Head & Syndicate Crimson Bandana
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.29, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
      );
      head.position.y = 2.04;
      group.add(head);

      const bandana = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.065, 8, 18),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
      );
      bandana.rotation.x = Math.PI / 2;
      bandana.position.y = 2.16;
      group.add(bandana);

      // Steel Machete / Aruval in Right Hand
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.85, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
      );
      blade.position.set(0.48, 1.45, 0.35);
      blade.rotation.x = 0.45;
      group.add(blade);

      // Denim Jeans
      const legs = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.82, 0.36),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 })
      );
      legs.position.y = 0.41;
      legs.castShadow = true;
      group.add(legs);

      // Street Bike next to lead thugs
      const bikeFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.75, 1.65),
        new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.7, roughness: 0.25 })
      );
      bikeFrame.position.set(-0.65, 0.55, 0);
      bikeFrame.castShadow = true;
      group.add(bikeFrame);

      group.position.copy(pos);
      this.scene.add(group);

      this.thugs.push({
        group,
        alive: true,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        initialPos: pos.clone()
      });
    });
  }

  // Apply Chapter-Specific Atmospheric Lighting & Environment Mood (Chapters 1 - 10)
  public setChapterAtmosphere(levelId: number) {
    this.currentLevelId = levelId;
    if (!this.sunLight || !this.ambientLight) return;

    switch (levelId) {
      case 1: // Golden Hour Chennai Market
      case 3: // Highway Tea Stall
        this.scene.background = new THREE.Color(0x0c1322);
        this.scene.fog = new THREE.FogExp2(0x0c1322, 0.015);
        this.sunLight.color.setHex(0xffb46b);
        this.sunLight.intensity = 1.85;
        soundManager.setTheme('stealth');
        break;
      case 4: // Kochi Port Night Rain & Lightning
      case 7: // Safe House Siege
        this.scene.background = new THREE.Color(0x050b16);
        this.scene.fog = new THREE.FogExp2(0x050b16, 0.022);
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 1.3;
        soundManager.setTheme('port_rain');
        break;
      case 6: // Neon Goan Street Carnival
      case 8: // Casino Cruise Ship
        this.scene.background = new THREE.Color(0x160724);
        this.scene.fog = new THREE.FogExp2(0x160724, 0.018);
        this.sunLight.color.setHex(0xe879f9);
        this.sunLight.intensity = 1.6;
        soundManager.setTheme('carnival');
        break;
      case 9: // Sunset Goa Airstrip
      case 10: // Kalpak Penthouse Showdown
        this.scene.background = new THREE.Color(0x1c0a08);
        this.scene.fog = new THREE.FogExp2(0x1c0a08, 0.016);
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 2.1;
        soundManager.setTheme('hukum');
        break;
      default:
        this.scene.background = new THREE.Color(0x0f172a);
        this.scene.fog = new THREE.FogExp2(0x0f172a, 0.016);
        this.sunLight.color.setHex(0xfbbf24);
        this.sunLight.intensity = 1.75;
        soundManager.setTheme('stealth');
        break;
    }
  }

  // Highlight Sniper Laser Crosshairs on All Active Targets ([1] Ping)
  public pingSniperTargets() {
    soundManager.playSniperPing();

    // Clear existing beams first
    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    this.thugs.forEach((thug) => {
      if (!thug.alive) return;
      const beamMat = new THREE.LineBasicMaterial({ color: 0xff1e1e, linewidth: 2 });
      const pts = [
        new THREE.Vector3(thug.group.position.x - 11, 22, thug.group.position.z - 14),
        thug.group.position.clone().add(new THREE.Vector3(0, 1.85, 0))
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const beam = new THREE.Line(beamGeo, beamMat);
      this.scene.add(beam);
      this.sniperBeams.push(beam);

      const ret = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
      );
      ret.rotation.x = -Math.PI / 2;
      ret.position.copy(thug.group.position).add(new THREE.Vector3(0, 0.08, 0));
      this.scene.add(ret);
      this.sniperReticles.push(ret);
    });
  }

  // Summon Cameo Syndicate Ally ([3] Cameo)
  public summonCameo(cameoId: string = 'mathew_mercedes') {
    soundManager.playCameoSummon();
    this.state.aura += 2500 * this.state.multiplier;

    if (this.onDialogue) {
      if (cameoId === 'narasimha_melee') {
        this.onDialogue('lvl7_cameo_narasimha');
      } else {
        this.onDialogue('lvl7_cameo_mathew');
      }
    }

    if (!this.state.coconutKicked) {
      this.kickCoconut();
    } else if (!this.state.hukumMode) {
      this.triggerSpectacleFlip();
    }
    this.notifyState();
  }

  // Kick Coconut Logic
  public kickCoconut() {
    if (this.state.coconutKicked) return;
    this.state.coconutKicked = true;

    soundManager.playCoconutKick();

    const target = this.rickshawGroup.position.clone().add(new THREE.Vector3(0, 0.35, 0));
    const start = this.coconutMesh.position.clone();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.08;
      this.coconutMesh.position.lerpVectors(start, target, progress);
      this.coconutMesh.rotation.x += 0.45;

      if (progress >= 1) {
        clearInterval(interval);
        this.releaseRickshawHandbrake();
      }
    }, 16);

    if (this.onDialogue) this.onDialogue('lvl1_rickshaw_ready');
  }

  private releaseRickshawHandbrake() {
    if (this.state.rickshawRolling) return;
    this.state.rickshawRolling = true;

    if (!this.state.hukumMode) {
      this.triggerSpectacleFlip();
    }

    soundManager.playRickshawRoll();
  }

  // The 3D Spectacle Flip (Bullet-Time)
  public triggerSpectacleFlip() {
    if (this.state.hukumMode) return;
    this.state.hukumMode = true;
    this.state.phase = 'HUKUM';
    this.state.multiplier = 10; // HUKUM x10

    soundManager.playSpectacleFlipBassDrop();

    // 360° Glasses Flip Animation
    let flipAngle = 0;
    const flipInterval = setInterval(() => {
      flipAngle += 0.6;
      if (this.tigerGlassesGroup) {
        this.tigerGlassesGroup.rotation.x = flipAngle;
      }
      if (flipAngle >= Math.PI * 4) {
        clearInterval(flipInterval);
        if (this.tigerGlassesGroup) this.tigerGlassesGroup.rotation.x = 0;
      }
    }, 16);

    // Engage Sniper Overwatch Beams
    this.pingSniperTargets();

    if (this.onDialogue) this.onDialogue('lvl1_spec_flip');
    this.notifyState();
  }

  // Main 3D Animation Frame Update
  public update(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.state.phase === 'VICTORY' || this.state.phase === 'BUSTED') return;

    this.handleMovement(delta, keys);
    this.updateVijiPatrol(delta);

    // Subtle floating embers animation
    if (this.embers) {
      this.embers.rotation.y += delta * 0.06;
    }

    // Rickshaw Incline Rolling
    if (this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.18;
      this.rickshawGroup.position.z += 0.32;
      this.rickshawGroup.rotation.y = 0.65;

      // Check collision with thugs
      this.thugs.forEach((thug) => {
        if (thug.alive) {
          const dist = this.rickshawGroup.position.distanceTo(thug.group.position);
          if (dist < 2.6) {
            thug.alive = false;
            soundManager.playSniperShot();
            this.state.aura += 1250 * this.state.multiplier;

            thug.vel.set(
              (Math.random() - 0.5) * 8 + 4,
              12 + Math.random() * 5,
              (Math.random() - 0.5) * 8 + 6
            );
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        }
      });

      const distToCart = this.rickshawGroup.position.distanceTo(this.fireworksGroup.position);
      if (distToCart < 3.2) {
        this.triggerFireworksExplosion();
      }
    }

    // Update Thugs Ragdoll Physics
    this.thugs.forEach((thug) => {
      if (!thug.alive) {
        thug.group.position.addScaledVector(thug.vel, delta);
        thug.group.rotation.x += thug.rotVel.x * delta;
        thug.group.rotation.y += thug.rotVel.y * delta;
        thug.vel.y -= 25 * delta;

        if (thug.group.position.y < 0.2) {
          thug.group.position.y = 0.2;
          thug.vel.set(0, 0, 0);
          thug.rotVel.set(0, 0, 0);
        }
      }
    });

    // Update Firework Particles
    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 12 * delta;
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fireworkParticles.splice(i, 1);
      }
    }

    // Smooth Cinematic Camera Follow
    const targetCamX = this.tigerGroup.position.x - 11.5;
    const targetCamZ = this.tigerGroup.position.z + 18.5;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(
      this.tigerGroup.position.x + 3.2,
      1.6,
      this.tigerGroup.position.z + 2.2
    );
  }

  private handleMovement(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    const speed = this.state.hukumMode ? 3.5 : 5.5;
    const move = new THREE.Vector3();

    if (keys.left) move.x -= 1;
    if (keys.right) move.x += 1;
    if (keys.up) move.z -= 1;
    if (keys.down) move.z += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      this.tigerGroup.position.addScaledVector(move, speed * delta);
      this.tigerGroup.rotation.y = Math.atan2(move.x, move.z);

      this.walkTime += delta * 8;
      this.tigerArmL.rotation.x = Math.sin(this.walkTime) * 0.42;
      this.tigerArmR.rotation.x = -Math.sin(this.walkTime) * 0.42;
      this.tigerGroup.position.y = Math.abs(Math.sin(this.walkTime)) * 0.09;

      this.footstepTimer += delta;
      if (this.footstepTimer > 0.38) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
      }
    } else {
      this.tigerArmL.rotation.x = 0;
      this.tigerArmR.rotation.x = 0;
      this.tigerGroup.position.y = 0;
    }
  }

  private updateVijiPatrol(delta: number) {
    this.vijiTurnTimer += delta;
    if (this.vijiTurnTimer > 3.5) {
      this.vijiTurnTimer = 0;
      this.vijiAngle = (this.vijiAngle + Math.PI / 2) % (Math.PI * 2);
      this.vijiGroup.rotation.y = this.vijiAngle;
    }

    const toTiger = this.tigerGroup.position.clone().sub(this.vijiGroup.position);
    const dist = toTiger.length();

    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vijiAngle);
    const dot = forward.dot(toTiger.normalize());

    if (dist < 9 && dot > 0.707) {
      if (this.state.coconutKicked && !this.state.fireworksExploded) {
        this.state.vijiSuspicion = Math.min(100, this.state.vijiSuspicion + 40 * delta);
      } else {
        this.state.vijiSuspicion = Math.max(0, this.state.vijiSuspicion - 10 * delta);
      }

      if (this.state.vijiSuspicion >= 100) {
        this.triggerBusted();
      }
    } else {
      this.state.vijiSuspicion = Math.max(0, this.state.vijiSuspicion - 8 * delta);
    }

    const coneColor = this.state.vijiSuspicion > 50 ? 0xef4444 : 0xfacc15;
    (this.vijiVisionMesh.material as THREE.MeshBasicMaterial).color.setHex(coneColor);

    this.notifyState();
  }

  private triggerFireworksExplosion() {
    if (this.state.fireworksExploded) return;
    this.state.fireworksExploded = true;

    soundManager.playExplosion();

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xffffff];
    for (let i = 0; i < 75; i++) {
      const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.12, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(this.fireworksGroup.position).add(new THREE.Vector3(0, 1.5, 0));
      this.scene.add(p);

      this.fireworkParticles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 18,
          9 + Math.random() * 14,
          (Math.random() - 0.5) * 18
        ),
        life: 1.3 + Math.random() * 0.9
      });
    }

    this.thugs.forEach((thug) => {
      if (thug.alive) {
        thug.alive = false;
        thug.vel.set((Math.random() - 0.5) * 8, 10 + Math.random() * 6, (Math.random() - 0.5) * 8);
        thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      }
    });

    setTimeout(() => {
      this.triggerVictory();
    }, 1500);
  }

  private triggerVictory() {
    this.state.phase = 'VICTORY';
    this.state.aura += 5000 * this.state.multiplier;
    soundManager.playVictoryFanfare();

    if (this.onDialogue) this.onDialogue('lvl1_victory');

    if (this.onVictory) {
      this.onVictory({
        levelNumber: this.currentLevelId,
        auraScore: this.state.aura,
        starsEarned: 3,
        clearTimeMs: Date.now() - this.startTime,
        spectacleFlipsUsed: 1,
        cameosUsed: ['vimal_taxi']
      });
    }

    this.notifyState();
  }

  private triggerBusted() {
    this.state.phase = 'BUSTED';
    soundManager.playAlert();
    if (this.onDialogue) this.onDialogue('lvl1_viji_warning');
    this.notifyState();
  }

  public retry() {
    this.state = {
      aura: 0,
      multiplier: 1,
      composure: 100,
      vijiSuspicion: 0,
      hukumMode: false,
      phase: 'STEALTH',
      coconutKicked: false,
      rickshawRolling: false,
      fireworksExploded: false
    };

    this.tigerGroup.position.set(-6, 0, -2);
    this.rickshawGroup.position.set(-1, 0, -3);
    this.rickshawGroup.rotation.y = 0.4;
    this.coconutMesh.position.set(-3.5, 0.4, -2);

    this.thugs.forEach((thug) => {
      thug.alive = true;
      thug.group.rotation.set(0, 0, 0);
      thug.group.position.copy(thug.initialPos);
    });

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    this.startTime = Date.now();
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }
}
