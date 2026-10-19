import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager';
import { TextureGenerator } from './TextureGenerator';

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

  // Active Chapter Index (1 - 10)
  public currentChapter: number = 1;

  // Persistent & Chapter-Specific Groups
  public chapterGroup: THREE.Group = new THREE.Group();
  public tigerGroup: THREE.Group = new THREE.Group();
  public vijiGroup: THREE.Group = new THREE.Group();
  public rickshawGroup: THREE.Group = new THREE.Group();
  public coconutMesh: THREE.Mesh | null = null;
  public fireworksGroup: THREE.Group = new THREE.Group();
  public thugs: { group: THREE.Group; alive: boolean; vel: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];
  public suvs: THREE.Group[] = [];
  public sniperBeams: THREE.Line[] = [];
  public fireworkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  public dustParticles: THREE.Points | null = null;

  // Chapter 2 & 3 Specific Actors & Props
  public moorthyGroup: THREE.Group = new THREE.Group();
  public carKeyMesh: THREE.Mesh | null = null;
  public teaKettleMesh: THREE.Mesh | null = null;

  // Chapter 1 Vision Spotlight (Viji)
  private vijiSpotlight!: THREE.SpotLight;
  private vijiSpotlightTarget!: THREE.Object3D;
  private vijiAngle: number = 0;
  private vijiTurnTimer: number = 0;

  // Live Game State
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

  private startTime: number = 0;
  private walkTime: number = 0;
  private tigerGlasses!: THREE.Group;
  private tigerTorsoGroup!: THREE.Group;
  private tigerArmL!: THREE.Group;
  private tigerArmR!: THREE.Group;

  // Callbacks
  public onStateUpdate?: (state: Game3DState) => void;
  public onDialogue?: (key: string) => void;
  public onVictory?: (summary: any) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.add(this.chapterGroup);
    this.scene.add(this.tigerGroup);

    // Cinematic 3D Camera with Film Focal Length
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-16, 16, 24);
    this.camera.lookAt(0, 1.5, 0);

    this.setupRealisticLighting();
    this.buildRealisticTiger();
    this.createAtmosphericDust();

    // Default to Chapter 1 on startup
    this.loadChapter(1);
  }

  // --- 1. Realistic Cinematic Lighting Rig ---
  private setupRealisticLighting() {
    // Ambient light with warm dusk bounce
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    this.scene.add(ambientLight);

    // Warm Sun Directional Light (Golden Hour Low-Angle Cinema)
    const sunLight = new THREE.DirectionalLight(0xfdba74, 1.6);
    sunLight.position.set(-25, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Subtle Cyan Cool Sky Fill (Contrast against warm sodium streetlights)
    const skyFill = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 0.4);
    this.scene.add(skyFill);
  }

  private createStreetlamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();

    // Cast iron fluted pole
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.8, 16);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, ironMat);
    base.position.y = 0.4;
    lampGroup.add(base);

    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.5, 16);
    const pole = new THREE.Mesh(poleGeo, ironMat);
    pole.position.y = 3.65;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Ornate curved arm & lantern
    const armGeo = new THREE.TorusGeometry(0.6, 0.06, 8, 16, Math.PI);
    const arm = new THREE.Mesh(armGeo, ironMat);
    arm.position.set(0.4, 6.7, 0);
    arm.rotation.z = Math.PI / 4;
    lampGroup.add(arm);

    const lanternGeo = new THREE.ConeGeometry(0.35, 0.7, 8);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(0.7, 6.4, 0);
    lantern.rotation.x = Math.PI;
    lampGroup.add(lantern);

    // Warm Point Light
    const pl = new THREE.PointLight(0xfbbf24, 2.2, 16, 1.5);
    pl.position.set(0.7, 6.3, 0);
    pl.castShadow = true;
    lampGroup.add(pl);

    lampGroup.position.set(x, y, z);
    this.chapterGroup.add(lampGroup);
  }

  // --- Dynamic Multi-Chapter Loading System ---
  public loadChapter(chapterNumber: number) {
    this.currentChapter = chapterNumber;

    // 1. Wipe previous chapter 3D models and effects cleanly
    while (this.chapterGroup.children.length > 0) {
      const obj = this.chapterGroup.children[0];
      this.chapterGroup.remove(obj);
    }

    this.sniperBeams.forEach(b => this.scene.remove(b));
    this.sniperBeams = [];
    this.fireworkParticles.forEach(p => this.scene.remove(p.mesh));
    this.fireworkParticles = [];
    this.thugs = [];
    this.suvs = [];
    this.coconutMesh = null;
    this.carKeyMesh = null;
    this.teaKettleMesh = null;

    // 2. Reset Live Game State
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
    this.startTime = Date.now();

    // 3. Construct Chapter Scene
    if (chapterNumber === 1) {
      this.buildChapter1Market();
    } else if (chapterNumber === 2) {
      this.buildChapter2SuspensionBridge();
    } else if (chapterNumber === 3) {
      this.buildChapter3TeaStall();
    } else {
      this.buildGenericChapterArena(chapterNumber);
    }

    this.notifyState();
  }

  // =========================================================================
  // CHAPTER 1: Chennai Market & Rithu's School Street
  // =========================================================================
  private buildChapter1Market() {
    this.scene.background = new THREE.Color(0x131a29);
    this.scene.fog = new THREE.FogExp2(0x131a29, 0.016);

    this.camera.position.set(-16, 16, 24);
    this.camera.lookAt(0, 1.5, 0);

    this.tigerGroup.position.set(-8, 0, -3);
    this.tigerGroup.rotation.y = 0;

    this.buildRealisticChennaiStreet();
    this.buildRealisticViji();
    this.buildRealisticBajajRickshaw();
    this.buildRealisticCoconut();
    this.buildRealisticFireworksCart();
    this.buildRealisticThugsAndBikes();

    if (this.onDialogue) {
      this.onDialogue('lvl1_intro');
    }
  }

  private buildRealisticChennaiStreet() {
    // 1. Asphalt Road with aggregate grain & painted markings
    const roadTexture = TextureGenerator.createAsphaltTexture();
    const roadGeo = new THREE.PlaneGeometry(80, 24);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.88,
      metalness: 0.08
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 4);
    road.receiveShadow = true;
    this.chapterGroup.add(road);

    // 2. Concrete Sidewalk with stone pavers
    const sidewalkTexture = TextureGenerator.createSidewalkTexture();
    const sidewalkGeo = new THREE.BoxGeometry(80, 0.35, 12);
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: sidewalkTexture,
      roughness: 0.85,
      metalness: 0.1
    });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(0, 0.175, -8);
    sidewalk.receiveShadow = true;
    this.chapterGroup.add(sidewalk);

    // Yellow & Black Curb Stones
    const curbGeo = new THREE.BoxGeometry(80, 0.4, 0.4);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.2, -2.1);
    this.chapterGroup.add(curb);

    // 3. Multi-story Madras Buildings with Colonial Architecture
    this.createMadrasBuilding(-22, 0, -14, '#b45309', 'முருகன் டீ ஸ்டால்', 'MURUGAN TEA & TIFFIN STALL');
    this.createMadrasBuilding(-6, 0, -14, '#0f766e', 'அண்ணாச்சி மளிகை', 'ANNACHI PROVISION STORES');
    this.createMadrasBuilding(10, 0, -14, '#854d0e', 'ராயல் டெக்ஸ்டைல்ஸ்', 'ROYAL SILKS & SAREES');
    this.createMadrasBuilding(26, 0, -14, '#1e3a8a', 'சென்னை பார்மசி', 'CHENNAI CITY PHARMACY');

    // 4. Authentic Market Stalls (Vegetables & Bananas)
    this.createDetailedMarketStall(-12, 0.35, -5, [
      { name: 'bananas', x: -0.8, y: 1.8, z: 0 },
      { name: 'tomatoes', x: -0.6, y: 0.8, z: 0.4 },
      { name: 'coconuts', x: 0.6, y: 0.8, z: 0.4 }
    ]);

    this.createDetailedMarketStall(2, 0.35, -5, [
      { name: 'tomatoes', x: -0.5, y: 0.8, z: 0.3 },
      { name: 'coconuts', x: 0.5, y: 0.8, z: 0.3 }
    ]);

    // Cast Iron Victorian Streetlamps
    this.createStreetlamp(-18, 0.35, -2.5);
    this.createStreetlamp(-2, 0.35, -2.5);
    this.createStreetlamp(14, 0.35, -2.5);
  }

  private createMadrasBuilding(x: number, y: number, z: number, brickHue: string, signTamil: string, signEng: string) {
    const bGroup = new THREE.Group();

    // 3-story concrete structure
    const facadeTex = TextureGenerator.createBrickBuildingTexture(brickHue);
    const bGeo = new THREE.BoxGeometry(14, 15, 8);
    const bMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.y = 7.5;
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Commercial Shop Signboard
    const signTex = TextureGenerator.createShopSignboardTexture(signTamil, signEng, brickHue);
    const signGeo = new THREE.PlaneGeometry(8, 2.2);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 4.2, 4.02);
    bGroup.add(signMesh);

    // Warm shop window interior light
    const shopLight = new THREE.PointLight(0xfef08a, 1.8, 10);
    shopLight.position.set(0, 2.5, 3.5);
    bGroup.add(shopLight);

    bGroup.position.set(x, y, z);
    this.chapterGroup.add(bGroup);
  }

  private createDetailedMarketStall(x: number, y: number, z: number, items: { name: string; x: number; y: number; z: number }[]) {
    const stall = new THREE.Group();

    // Rustic Wood Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 1.8), tableMat);
    top.position.y = 0.8;
    top.castShadow = true;
    stall.add(top);

    const legGeo = new THREE.BoxGeometry(0.12, 0.8, 0.12);
    [-1.6, 1.6].forEach(lx => {
      [-0.7, 0.7].forEach(lz => {
        const leg = new THREE.Mesh(legGeo, tableMat);
        leg.position.set(lx, 0.4, lz);
        leg.castShadow = true;
        stall.add(leg);
      });
    });

    // Striped Canvas Awning (Sun Canopy)
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 2.4), awningMat);
    canopy.position.set(0, 2.3, 0.2);
    canopy.rotation.x = 0.15;
    canopy.castShadow = true;
    stall.add(canopy);

    // Items on Display
    items.forEach(item => {
      if (item.name === 'bananas') {
        // Hanging green/yellow plantain bunch
        const bunch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.35, 0.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 })
        );
        bunch.position.set(item.x, item.y, item.z);
        stall.add(bunch);
      } else if (item.name === 'tomatoes') {
        // Wooden crate with red tomatoes
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.25, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 })
        );
        crate.position.set(item.x, item.y, item.z);
        stall.add(crate);
      } else if (item.name === 'coconuts') {
        // Brown coconut basket
        const basket = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.3, 0.35, 12),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
        );
        basket.position.set(item.x, item.y, item.z);
        stall.add(basket);
      }
    });

    stall.position.set(x, y, z);
    this.chapterGroup.add(stall);
  }

  // --- 3. Tiger Muthuvel Pandian (Superstar Rajinikanth) 3D Model ---
  private buildRealisticTiger() {
    this.tigerGroup = new THREE.Group();
    this.tigerTorsoGroup = new THREE.Group();

    // PBR Linen Fabric Material for Shirt
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfe,
      roughness: 0.85,
      metalness: 0.05
    });

    // Anatomical Torso (Bush Shirt with collar & folds)
    const chestGeo = new THREE.BoxGeometry(1.0, 1.1, 0.55);
    const chest = new THREE.Mesh(chestGeo, shirtMat);
    chest.position.y = 1.7;
    chest.castShadow = true;
    this.tigerTorsoGroup.add(chest);

    // Shirt Collar with folded lapels
    const collarGeo = new THREE.ConeGeometry(0.5, 0.3, 4);
    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.position.set(0, 2.25, 0.1);
    collar.rotation.x = Math.PI;
    this.tigerTorsoGroup.add(collar);

    // Front Chest Pocket with Golden Pen Clip
    const pocketGeo = new THREE.BoxGeometry(0.25, 0.28, 0.02);
    const pocket = new THREE.Mesh(pocketGeo, shirtMat);
    pocket.position.set(0.3, 1.85, 0.28);
    this.tigerTorsoGroup.add(pocket);

    const penClip = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.14, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
    );
    penClip.position.set(0.3, 1.95, 0.3);
    this.tigerTorsoGroup.add(penClip);

    // Traditional Silk Dhoti/Veshti with Realistic Pleats & Golden Zari
    const veshtiMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8
    });
    const veshtiGeo = new THREE.CylinderGeometry(0.48, 0.58, 1.35, 16);
    const veshti = new THREE.Mesh(veshtiGeo, veshtiMat);
    veshti.position.y = 0.7;
    veshti.castShadow = true;
    this.tigerGroup.add(veshti);

    // Gold Zari Border on Veshti
    const zariMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3
    });
    const zari = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.59, 0.12, 16), zariMat);
    zari.position.y = 0.15;
    this.tigerGroup.add(zari);

    // Head & Rajinikanth Facial Structure
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd49b70,
      roughness: 0.75,
      metalness: 0.05
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 20), skinMat);
    head.position.y = 2.55;
    head.castShadow = true;
    this.tigerTorsoGroup.add(head);

    // Styled Silver Hair (Swept Back Mass Hairstyle)
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      roughness: 0.95
    });
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    hair.position.set(0, 2.68, -0.06);
    hair.scale.set(1.0, 1.1, 1.15);
    this.tigerTorsoGroup.add(hair);

    // Groomed Silver Salt-and-Pepper Beard & Mustache
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 });
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.25), beardMat);
    beard.position.set(0, 2.38, 0.26);
    this.tigerTorsoGroup.add(beard);

    // Iconic Ray-Ban Aviator Sunglasses (Gold Rims + Dark Reflective Lenses)
    this.tigerGlasses = new THREE.Group();
    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15
    });
    const darkLensMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.9,
      roughness: 0.1
    });

    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), darkLensMat);
    lensL.position.x = -0.14;
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.05), darkLensMat);
    lensR.position.x = 0.14;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), goldFrameMat);

    this.tigerGlasses.add(lensL);
    this.tigerGlasses.add(lensR);
    this.tigerGlasses.add(bridge);
    this.tigerGlasses.position.set(0, 2.58, 0.35);
    this.tigerTorsoGroup.add(this.tigerGlasses);

    // Luxury Gold Wristwatch on Left Hand
    const watch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 })
    );
    watch.rotation.z = Math.PI / 2;

    // Articulated Arms
    const armGeo = new THREE.BoxGeometry(0.26, 0.95, 0.26);
    this.tigerArmL = new THREE.Group();
    const meshArmL = new THREE.Mesh(armGeo, shirtMat);
    meshArmL.position.y = -0.4;
    meshArmL.castShadow = true;
    this.tigerArmL.add(meshArmL);
    watch.position.set(0, -0.7, 0);
    this.tigerArmL.add(watch);
    this.tigerArmL.position.set(-0.68, 2.1, 0);

    this.tigerArmR = new THREE.Group();
    const meshArmR = new THREE.Mesh(armGeo, shirtMat);
    meshArmR.position.y = -0.4;
    meshArmR.castShadow = true;
    this.tigerArmR.add(meshArmR);
    this.tigerArmR.position.set(0.68, 2.1, 0);

    this.tigerTorsoGroup.add(this.tigerArmL);
    this.tigerTorsoGroup.add(this.tigerArmR);
    this.tigerGroup.add(this.tigerTorsoGroup);

    // Leather Chappals (Traditional Sandals)
    const chappalMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const chappalL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.6), chappalMat);
    chappalL.position.set(-0.25, 0.04, 0.05);
    const chappalR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.6), chappalMat);
    chappalR.position.set(0.25, 0.04, 0.05);
    this.tigerGroup.add(chappalL);
    this.tigerGroup.add(chappalR);

    this.tigerGroup.position.set(-8, 0, -3);
    this.scene.add(this.tigerGroup);
  }

  // --- 4. Viji (Wife) Character & Vision Cone ---
  private buildRealisticViji() {
    this.vijiGroup = new THREE.Group();

    // Traditional Kanjeevaram Silk Saree (Maroon & Gold Zari)
    const sareeMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.75,
      metalness: 0.15
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.7, 16), sareeMat);
    body.position.y = 0.85;
    body.castShadow = true;
    this.vijiGroup.add(body);

    // Golden Zari Pallu draped over shoulder
    const zariMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.55), zariMat);
    pallu.position.set(-0.28, 1.1, 0.05);
    pallu.rotation.z = 0.15;
    this.vijiGroup.add(pallu);

    // Head & Hair Bun with Jasmine Flowers (Malli Poo)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd49b70, roughness: 0.8 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skinMat);
    head.position.y = 1.95;
    head.castShadow = true;
    this.vijiGroup.add(head);

    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hair.position.set(0, 2.05, -0.05);
    this.vijiGroup.add(hair);

    // Hair bun behind head
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), hairMat);
    bun.position.set(0, 1.9, -0.32);
    this.vijiGroup.add(bun);

    // Jasmine flower string (White garland around bun)
    const flower = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.05, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    flower.position.set(0, 1.9, -0.3);
    this.vijiGroup.add(flower);

    // Red Vermilion Bindi on forehead
    const bindi = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    bindi.position.set(0, 2.02, 0.28);
    this.vijiGroup.add(bindi);

    // Hand Shopping Bag (Grocery vegetables)
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.45, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 })
    );
    bag.position.set(0.55, 0.7, 0.1);
    this.vijiGroup.add(bag);

    this.vijiGroup.position.set(-11, 0, 1);
    this.chapterGroup.add(this.vijiGroup);

    // Vision Spotlight Cone
    this.vijiSpotlight = new THREE.SpotLight(0xfacc15, 3.5, 14, Math.PI / 4.5, 0.45, 1.2);
    this.vijiSpotlight.position.set(0, 1.9, 0.2);
    this.vijiSpotlight.castShadow = true;

    this.vijiSpotlightTarget = new THREE.Object3D();
    this.vijiSpotlightTarget.position.set(0, 0, 8);
    this.vijiGroup.add(this.vijiSpotlightTarget);
    this.vijiSpotlight.target = this.vijiSpotlightTarget;
    this.vijiGroup.add(this.vijiSpotlight);
  }

  // --- 5. Bajaj RE Auto-Rickshaw (Yellow & Black) ---
  private buildRealisticBajajRickshaw() {
    this.rickshawGroup = new THREE.Group();

    // Lower chassis in gloss black
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.3 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 1.5), blackMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    this.rickshawGroup.add(chassis);

    // Upper cabin hood in vibrant Chennai Auto Yellow
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.3,
      metalness: 0.2
    });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.95, 1.45), yellowMat);
    hood.position.set(-0.05, 1.2, 0);
    hood.castShadow = true;
    this.rickshawGroup.add(hood);

    // Authentic Decal: "TN 01 AB 1975" & "HUKUM"
    const decalTex = TextureGenerator.createRickshawDecalTexture();
    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.35), new THREE.MeshBasicMaterial({ map: decalTex }));
    decalMesh.position.set(-1.06, 0.55, 0);
    decalMesh.rotation.y = -Math.PI / 2;
    this.rickshawGroup.add(decalMesh);

    // Front windshield & chrome frame
    const windshieldMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.7 });
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.65), windshieldMat);
    windshield.position.set(0.92, 1.25, 0);
    windshield.rotation.y = Math.PI / 2;
    windshield.rotation.x = -0.2;
    this.rickshawGroup.add(windshield);

    // Single Round Chrome Headlight
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), headlightMat);
    headlight.position.set(1.08, 0.7, 0);
    this.rickshawGroup.add(headlight);

    // 3 Wheels (1 Front, 2 Rear)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const wheelFront = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16), tireMat);
    wheelFront.rotation.x = Math.PI / 2;
    wheelFront.position.set(0.85, 0.3, 0);
    wheelFront.castShadow = true;
    this.rickshawGroup.add(wheelFront);

    const wheelBackL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16), tireMat);
    wheelBackL.rotation.x = Math.PI / 2;
    wheelBackL.position.set(-0.7, 0.3, 0.75);
    wheelBackL.castShadow = true;
    this.rickshawGroup.add(wheelBackL);

    const wheelBackR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16), tireMat);
    wheelBackR.rotation.x = Math.PI / 2;
    wheelBackR.position.set(-0.7, 0.3, -0.75);
    wheelBackR.castShadow = true;
    this.rickshawGroup.add(wheelBackR);

    this.rickshawGroup.position.set(-1.5, 0, -3);
    this.rickshawGroup.rotation.y = 0.3;
    this.chapterGroup.add(this.rickshawGroup);
  }

  // --- 6. The Interactive Brown Coconut ---
  private buildRealisticCoconut() {
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.95,
      metalness: 0.05
    });
    this.coconutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), coconutMat);
    this.coconutMesh.scale.set(0.9, 1.15, 0.9);
    this.coconutMesh.position.set(-4.5, 0.4, -2.5);
    this.coconutMesh.castShadow = true;
    this.chapterGroup.add(this.coconutMesh);
  }

  // --- 7. The Diwali Fireworks Cart ---
  private buildRealisticFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    // Handcart wooden frame
    const cartWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const cartBed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 1.8), cartWood);
    cartBed.position.y = 0.7;
    cartBed.castShadow = true;
    this.fireworksGroup.add(cartBed);

    // Two big wooden spoke wheels
    [-0.9, 0.9].forEach(wz => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 20), cartWood);
      wheel.position.set(0, 0.55, wz);
      this.fireworksGroup.add(wheel);
    });

    // Boxes of "STANDARD FIREWORKS" & Rockets
    const boxTex = TextureGenerator.createFireworkBoxTexture();
    const boxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ map: boxTex });

    const b1 = new THREE.Mesh(boxGeo, boxMat);
    b1.position.set(-0.6, 1.1, 0.3);
    this.fireworksGroup.add(b1);

    const b2 = new THREE.Mesh(boxGeo, boxMat);
    b2.position.set(0.4, 1.1, -0.2);
    this.fireworksGroup.add(b2);

    const b3 = new THREE.Mesh(boxGeo, boxMat);
    b3.position.set(0.1, 1.7, 0.1);
    b3.rotation.y = 0.4;
    this.fireworksGroup.add(b3);

    this.fireworksGroup.position.set(5.5, 0, 6.5);
    this.chapterGroup.add(this.fireworksGroup);
  }

  // --- 8. Thugs & Parked Motorbikes ---
  private buildRealisticThugsAndBikes() {
    this.createMotorbike(4.0, 0, 4.5);
    this.createMotorbike(6.5, 0, 6.0);

    const thugConfigs = [
      { x: 3.8, z: 5.5, rot: 0.2 },
      { x: 5.2, z: 4.8, rot: -0.4 },
      { x: 4.2, z: 7.2, rot: 0.8 },
      { x: 6.8, z: 7.8, rot: -0.6 }
    ];

    thugConfigs.forEach((cfg) => {
      this.createThug(cfg.x, 0, cfg.z, cfg.rot, 0x1e293b);
    });
  }

  private createMotorbike(x: number, y: number, z: number) {
    const bike = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.8, roughness: 0.3 });

    // Chassis & Fuel Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.4), frameMat);
    tank.position.y = 0.95;
    bike.add(tank);

    const engineMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.35), engineMat);
    engine.position.y = 0.55;
    bike.add(engine);

    // Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 16), tireMat);
    frontWheel.rotation.x = Math.PI / 2;
    frontWheel.position.set(0.9, 0.38, 0);
    bike.add(frontWheel);

    const backWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 16), tireMat);
    backWheel.rotation.x = Math.PI / 2;
    backWheel.position.set(-0.9, 0.38, 0);
    bike.add(backWheel);

    bike.position.set(x, y, z);
    bike.rotation.y = -0.3;
    this.chapterGroup.add(bike);
  }

  // --- Atmospheric Dust & Golden Sunbeams ---
  private createAtmosphericDust() {
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = Math.random() * 8 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.08,
      transparent: true,
      opacity: 0.55
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  // =========================================================================
  // CHAPTER 2: "Moorthy Sir Udane Paakkanumam" (Suspension Bridge over River)
  // =========================================================================
  private buildChapter2SuspensionBridge() {
    this.scene.background = new THREE.Color(0x0a1628);
    this.scene.fog = new THREE.FogExp2(0x0a1628, 0.02);

    this.camera.position.set(-22, 14, 18);
    this.camera.lookAt(0, 2, 0);
    this.tigerGroup.position.set(-16, 0, 0);
    this.tigerGroup.rotation.y = Math.PI / 2;

    // 1. Steel Bridge Road Deck
    const deckGeo = new THREE.BoxGeometry(64, 0.8, 8);
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    const deckMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.85,
      metalness: 0.2
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0, 0);
    deck.receiveShadow = true;
    this.chapterGroup.add(deck);

    // Center Double Dashed Lines (Yellow)
    for (let x = -28; x <= 28; x += 3.5) {
      const line1 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      line1.rotation.x = -Math.PI / 2;
      line1.position.set(x, 0.41, 0.1);
      this.chapterGroup.add(line1);

      const line2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      line2.rotation.x = -Math.PI / 2;
      line2.position.set(x, 0.41, -0.1);
      this.chapterGroup.add(line2);
    }

    // White Edge Lines
    const edgeL = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.15), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    edgeL.rotation.x = -Math.PI / 2;
    edgeL.position.set(0, 0.41, 3.6);
    this.chapterGroup.add(edgeL);

    const edgeR = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.15), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    edgeR.rotation.x = -Math.PI / 2;
    edgeR.position.set(0, 0.41, -3.6);
    this.chapterGroup.add(edgeR);

    // 2. Concrete Abutments / Piers at ends
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const pier1 = new THREE.Mesh(new THREE.BoxGeometry(6, 14, 10), pierMat);
    pier1.position.set(-33, -6, 0);
    this.chapterGroup.add(pier1);

    const pier2 = new THREE.Mesh(new THREE.BoxGeometry(6, 14, 10), pierMat);
    pier2.position.set(33, -6, 0);
    this.chapterGroup.add(pier2);

    // 3. Steel Suspension Towers (Pylons) at x = -16 and x = 16
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    [-16, 16].forEach(px => {
      [-4.1, 4.1].forEach(pz => {
        const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 1.2), steelMat);
        pylon.position.set(px, 7, pz);
        pylon.castShadow = true;
        this.chapterGroup.add(pylon);
      });

      const brace1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 8.2), steelMat);
      brace1.position.set(px, 9, 0);
      this.chapterGroup.add(brace1);

      const brace2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 8.2), steelMat);
      brace2.position.set(px, 17, 0);
      this.chapterGroup.add(brace2);
    });

    // 4. Main Parabolic Suspension Cables
    [-4.1, 4.1].forEach(cz => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-32, 0.4, cz),
        new THREE.Vector3(-16, 17.5, cz),
        new THREE.Vector3(0, 2.8, cz),
        new THREE.Vector3(16, 17.5, cz),
        new THREE.Vector3(32, 0.4, cz)
      ]);
      const cableGeo = new THREE.TubeGeometry(curve, 48, 0.12, 8, false);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      this.chapterGroup.add(cable);

      for (let sx = -28; sx <= 28; sx += 2.5) {
        const pt = curve.getPointAt((sx + 32) / 64);
        const suspLen = Math.max(0.5, pt.y - 0.4);
        const susp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, suspLen, 6), cableMat);
        susp.position.set(sx, 0.4 + suspLen / 2, cz);
        this.chapterGroup.add(susp);
      }
    });

    // 5. Side Railings with Red Reflectors
    [-3.9, 3.9].forEach(rz => {
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(62, 0.1, 0.1), steelMat);
      railTop.position.set(0, 1.3, rz);
      this.chapterGroup.add(railTop);

      for (let rx = -30; rx <= 30; rx += 2.0) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), steelMat);
        post.position.set(rx, 0.85, rz);
        this.chapterGroup.add(post);

        const ref = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        ref.position.set(rx, 1.1, rz + (rz > 0 ? -0.06 : 0.06));
        this.chapterGroup.add(ref);
      }
    });

    // 6. Deep Blue Misty River below (y = -9.5)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x092b3d,
      roughness: 0.2,
      metalness: 0.85
    });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), waterMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -9.5, 0);
    this.chapterGroup.add(river);

    // River Canyon Cliff Silhouettes
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
    const cliff1 = new THREE.Mesh(new THREE.BoxGeometry(160, 28, 20), cliffMat);
    cliff1.position.set(0, 2, -32);
    this.chapterGroup.add(cliff1);

    const cliff2 = new THREE.Mesh(new THREE.BoxGeometry(160, 28, 20), cliffMat);
    cliff2.position.set(0, 2, 32);
    this.chapterGroup.add(cliff2);

    // 7. Moorthy Sir & Luxury Sedan
    this.createMoorthySir(-10, 0.4, -1.5);
    this.createMoorthyLuxuryCar(-13.5, 0.4, -1.8);

    // 8. 6 Armored Black Syndicate SUVs (The Roadblock)
    this.createArmoredSUV(1.5, 0.4, -1.8, 0.08);
    this.createArmoredSUV(2.8, 0.4, 1.8, -0.12);
    this.createArmoredSUV(6.2, 0.4, -0.4, 0.2);
    this.createArmoredSUV(8.6, 0.4, -2.0, -0.08);
    this.createArmoredSUV(10.5, 0.4, 1.7, 0.18);
    this.createArmoredSUV(13.8, 0.4, -0.8, -0.05);

    // 9. 6 Syndicate Goons
    this.createThug(0.5, 0.4, -0.8, -0.5, 0x1e293b);
    this.createThug(2.0, 0.4, 0.5, 0.3, 0x334155);
    this.createThug(4.5, 0.4, -1.8, -0.2, 0x475569);
    this.createThug(5.5, 0.4, 1.5, 0.6, 0x0f172a);
    this.createThug(8.0, 0.4, 0.2, -0.4, 0x1e1b4b);
    this.createThug(12.0, 0.4, 0.8, 0.2, 0x1c1917);

    // 10. Golden Car Keys
    const keyGeo = new THREE.TorusGeometry(0.14, 0.04, 8, 16);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 });
    this.carKeyMesh = new THREE.Mesh(keyGeo, keyMat);
    this.carKeyMesh.position.set(1.5, 2.0, -1.8);
    this.chapterGroup.add(this.carKeyMesh);

    if (this.onDialogue) {
      this.onDialogue('lvl2_intro');
    }
  }

  private createMoorthySir(x: number, y: number, z: number) {
    this.moorthyGroup = new THREE.Group();

    // 1. Ornate Cream-White Silk Shirt
    const silkMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.6, metalness: 0.15 });
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.5), silkMat);
    chest.position.y = 1.65;
    chest.castShadow = true;
    this.moorthyGroup.add(chest);

    // 2. Thick 24K Gold Chain Necklace
    const goldChainMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
    const goldChain = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), goldChainMat);
    goldChain.rotation.x = Math.PI / 2.3;
    goldChain.position.set(0, 2.05, 0.16);
    this.moorthyGroup.add(goldChain);

    // 3. Head & Mustache
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd49b70, roughness: 0.75 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), skinMat);
    head.position.y = 2.45;
    head.castShadow = true;
    this.moorthyGroup.add(head);

    // Styled Hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 })
    );
    hair.position.set(0, 2.58, -0.05);
    this.moorthyGroup.add(hair);

    // Mustache
    const mustache = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x27272a })
    );
    mustache.position.set(0, 2.3, 0.32);
    this.moorthyGroup.add(mustache);

    // Gold Rimmed Aviators
    const glasses = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.16, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.1 })
    );
    glasses.position.set(0, 2.5, 0.32);
    this.moorthyGroup.add(glasses);

    // Pleated Silk Trousers & Shoes
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const pants = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.1, 0.42), pantsMat);
    pants.position.y = 0.65;
    pants.castShadow = true;
    this.moorthyGroup.add(pants);

    const shoes = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.18, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 })
    );
    shoes.position.y = 0.09;
    this.moorthyGroup.add(shoes);

    // Hands on hips proud posture
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), silkMat);
    armL.position.set(-0.6, 1.6, 0);
    armL.rotation.z = Math.PI / 5;
    this.moorthyGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), silkMat);
    armR.position.set(0.6, 1.6, 0);
    armR.rotation.z = -Math.PI / 5;
    this.moorthyGroup.add(armR);

    this.moorthyGroup.position.set(x, y, z);
    this.moorthyGroup.rotation.y = 0.2;
    this.chapterGroup.add(this.moorthyGroup);
  }

  private createMoorthyLuxuryCar(x: number, y: number, z: number) {
    const carGroup = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 1.9), whiteMat);
    body.position.y = 0.7;
    body.castShadow = true;
    carGroup.add(body);

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 1.7), glassMat);
    cabin.position.set(-0.2, 1.45, 0);
    carGroup.add(cabin);

    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95 }));
    grill.position.set(2.12, 0.65, 0);
    carGroup.add(grill);

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    [-1.3, 1.3].forEach(wx => {
      [-0.98, 0.98].forEach(wz => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16), tireMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.38, wz);
        carGroup.add(w);
      });
    });

    carGroup.position.set(x, y, z);
    carGroup.rotation.y = 0.05;
    this.chapterGroup.add(carGroup);
  }

  private createArmoredSUV(x: number, y: number, z: number, rotY: number) {
    const suvGroup = new THREE.Group();

    // Armored Gloss Black Heavy Chassis
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      metalness: 0.88,
      roughness: 0.18
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.4, 2.1), bodyMat);
    body.position.y = 0.95;
    body.castShadow = true;
    suvGroup.add(body);

    // Cabin with Tinted Black Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1,
      metalness: 0.95
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.05, 1.95), glassMat);
    cabin.position.set(-0.2, 1.9, 0);
    cabin.castShadow = true;
    suvGroup.add(cabin);

    // Heavy Steel Bull-bar
    const bullbarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const bullbar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 1.8), bullbarMat);
    bullbar.position.set(2.25, 0.9, 0);
    suvGroup.add(bullbar);

    // Xenon Headlights & Red LED Tail Bar
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.35), headlightMat);
    hl1.position.set(2.22, 1.15, 0.7);
    const hl2 = hl1.clone();
    hl2.position.z = -0.7;
    suvGroup.add(hl1);
    suvGroup.add(hl2);

    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.3), taillightMat);
    tl1.position.set(-2.22, 1.15, 0.75);
    const tl2 = tl1.clone();
    tl2.position.z = -0.75;
    suvGroup.add(tl1);
    suvGroup.add(tl2);

    // Off-road Tires
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const wheelPositions = [
      { x: 1.4, z: 1.1 },
      { x: -1.4, z: 1.1 },
      { x: 1.4, z: -1.1 },
      { x: -1.4, z: -1.1 }
    ];

    wheelPositions.forEach((wp) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 16), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(wp.x, 0.48, wp.z);
      tire.castShadow = true;
      suvGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.34, 16), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(wp.x, 0.48, wp.z);
      suvGroup.add(rim);
    });

    // Roof Rack & Spare Wheel
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.6 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.6), rackMat);
    rack.position.set(-0.2, 2.5, 0);
    suvGroup.add(rack);

    const spare = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 16), tireMat);
    spare.position.set(-0.2, 2.7, 0);
    suvGroup.add(spare);

    suvGroup.position.set(x, y, z);
    suvGroup.rotation.y = rotY;
    this.chapterGroup.add(suvGroup);
    this.suvs.push(suvGroup);

    return suvGroup;
  }

  private createThug(x: number, y: number, z: number, rotY: number, shirtColor = 0x1e293b) {
    const thugGroup = new THREE.Group();

    // Realistic jacket
    const jacketMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.15, 0.45), jacketMat);
    body.position.y = 1.35;
    body.castShadow = true;
    thugGroup.add(body);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skinMat);
    head.position.y = 2.1;
    head.castShadow = true;
    thugGroup.add(head);

    const bandana = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.07, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    bandana.rotation.x = Math.PI / 2;
    bandana.position.y = 2.22;
    thugGroup.add(bandana);

    // Jeans
    const jeansMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.85 });
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.85, 0.4), jeansMat);
    legs.position.y = 0.45;
    legs.castShadow = true;
    thugGroup.add(legs);

    // Weapon
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), weaponMat);
    weapon.position.set(0.48, 1.1, 0.2);
    weapon.rotation.z = -Math.PI / 6;
    thugGroup.add(weapon);

    thugGroup.position.set(x, y, z);
    thugGroup.rotation.y = rotY;
    this.chapterGroup.add(thugGroup);

    this.thugs.push({
      group: thugGroup,
      alive: true,
      vel: new THREE.Vector3(),
      rotVel: new THREE.Vector3()
    });

    return thugGroup;
  }

  // =========================================================================
  // CHAPTER 3: "Oru Sun, Oru Moon... Puriyutha?" (Highway Roadside Tea Stall)
  // =========================================================================
  private buildChapter3TeaStall() {
    this.scene.background = new THREE.Color(0x2b1509);
    this.scene.fog = new THREE.FogExp2(0x2b1509, 0.018);

    this.camera.position.set(-18, 12, 16);
    this.camera.lookAt(0, 1.8, 0);
    this.tigerGroup.position.set(-10, 0, 0);
    this.tigerGroup.rotation.y = Math.PI / 2;

    // 1. Dusty Highway Road & Shoulder
    const roadGeo = new THREE.PlaneGeometry(80, 16);
    const roadMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createAsphaltTexture(),
      roughness: 0.9,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 4);
    this.chapterGroup.add(road);

    const shoulderGeo = new THREE.PlaneGeometry(80, 16);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x785338, roughness: 0.95 });
    const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulder.rotation.x = -Math.PI / 2;
    shoulder.position.set(0, 0, -8);
    this.chapterGroup.add(shoulder);

    // 2. Roadside Wooden Tea Stall Shack
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.85 });
    const stall = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 4), woodMat);
    stall.position.set(0, 1.6, -6);
    this.chapterGroup.add(stall);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 5), roofMat);
    roof.position.set(0, 3.3, -5.8);
    roof.rotation.x = 0.1;
    this.chapterGroup.add(roof);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 1.2), woodMat);
    counter.position.set(0, 0.55, -3.5);
    this.chapterGroup.add(counter);

    // Steaming Brass Kettle
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 });
    this.teaKettleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.5, 16), kettleMat);
    this.teaKettleMesh.position.set(1.2, 1.35, -3.5);
    this.chapterGroup.add(this.teaKettleMesh);

    // 3. 2 Sugarcane Trucks
    [-18, 18].forEach(tx => {
      const truck = new THREE.Group();
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.6, 2.2), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }));
      cabin.position.set(-2, 1.5, 0);
      truck.add(cabin);

      const bed = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.2, 2.4), new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 }));
      bed.position.set(3.2, 1.3, 0);
      truck.add(bed);

      truck.position.set(tx, 0, -8);
      truck.rotation.y = tx < 0 ? 0.15 : -0.2;
      this.chapterGroup.add(truck);
    });

    // 4. 12 Syndicate Machete Goons
    const goonPos = [
      { x: -5, z: 0 }, { x: -3, z: 2 }, { x: -1, z: 3 }, { x: 2, z: 3 },
      { x: 4, z: 2 }, { x: 6, z: 0 }, { x: 5, z: -2 }, { x: 3, z: -3 },
      { x: -2, z: -3 }, { x: -4, z: -2 }, { x: 0, z: 1.5 }, { x: 1, z: -1.5 }
    ];

    goonPos.forEach((p, idx) => {
      this.createThug(p.x, 0, p.z, Math.atan2(-p.z, -p.x), 0x1e293b + idx * 0x050505);
    });

    if (this.onDialogue) {
      this.onDialogue('lvl3_intro');
    }
  }

  // =========================================================================
  // CHAPTERS 4 - 10: Dynamic Themed Tactical Arenas
  // =========================================================================
  private buildGenericChapterArena(chapterId: number) {
    const configs: Record<number, { bg: number; fog: number; enemyCount: number }> = {
      4: { bg: 0x0a1128, fog: 0.02, enemyCount: 8 },
      5: { bg: 0x1e1208, fog: 0.016, enemyCount: 6 },
      6: { bg: 0x160a28, fog: 0.02, enemyCount: 8 },
      7: { bg: 0x14181f, fog: 0.018, enemyCount: 20 },
      8: { bg: 0x091b2c, fog: 0.015, enemyCount: 15 },
      9: { bg: 0x2b1509, fog: 0.016, enemyCount: 40 },
      10: { bg: 0x0d121d, fog: 0.02, enemyCount: 25 }
    };

    const cfg = configs[chapterId] || { bg: 0x0f172a, fog: 0.02, enemyCount: 8 };

    this.scene.background = new THREE.Color(cfg.bg);
    this.scene.fog = new THREE.FogExp2(cfg.bg, cfg.fog);

    this.camera.position.set(-20, 14, 20);
    this.camera.lookAt(0, 1.8, 0);
    this.tigerGroup.position.set(-12, 0, 0);

    // Concrete Tactical Ground
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    this.chapterGroup.add(ground);

    // Themed Obstacles / Containers
    for (let i = 0; i < 6; i++) {
      const containerColor = [0x1d4ed8, 0xb91c1c, 0x15803d, 0xca8a04, 0x475569][i % 5];
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2.8, 2.6),
        new THREE.MeshStandardMaterial({ color: containerColor, roughness: 0.6, metalness: 0.4 })
      );
      box.position.set((i - 2.5) * 8, 1.4, (i % 2 === 0 ? -12 : 12));
      this.chapterGroup.add(box);
    }

    // Spawn Encamped Enemies
    const totalEnemies = Math.min(cfg.enemyCount, 16);
    for (let e = 0; e < totalEnemies; e++) {
      const angle = (e / totalEnemies) * Math.PI * 2;
      const radius = 6 + (e % 3) * 3;
      const ex = Math.cos(angle) * radius;
      const ez = Math.sin(angle) * radius;
      this.createThug(ex, 0, ez, angle + Math.PI, 0x1e293b);
    }

    if (this.onDialogue) {
      this.onDialogue(`lvl${chapterId}_intro`);
    }
  }

  // --- Core Gameplay Interactions ---
  public kickCoconut() {
    if (this.currentChapter !== 1) {
      this.triggerSpectacleFlip();
      return;
    }

    if (this.state.coconutKicked || !this.coconutMesh) return;
    this.state.coconutKicked = true;

    soundManager.playCoconutKick();

    const target = this.rickshawGroup.position.clone().add(new THREE.Vector3(0, 0.4, 0));
    const start = this.coconutMesh.position.clone();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.08;
      if (this.coconutMesh) {
        this.coconutMesh.position.lerpVectors(start, target, progress);
        this.coconutMesh.rotation.x += 0.45;
      }

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

  // 360° Aviator Glasses Flip Animation
  private animateGlassesFlip() {
    let flipAngle = 0;
    const flipInterval = setInterval(() => {
      flipAngle += 0.55;
      if (this.tigerGlasses) {
        this.tigerGlasses.rotation.y = flipAngle;
      }
      if (flipAngle >= Math.PI * 4) {
        clearInterval(flipInterval);
        if (this.tigerGlasses) this.tigerGlasses.rotation.y = 0;
      }
    }, 16);
  }

  public triggerSpectacleFlip() {
    if (this.state.hukumMode) return;
    this.state.hukumMode = true;
    this.state.multiplier = 10; // HUKUM x10

    soundManager.playSpectacleFlipBassDrop();
    this.animateGlassesFlip();

    if (this.currentChapter === 1) {
      // Chapter 1 Sniper Lasers
      this.thugs.forEach((thug) => {
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
        const pts = [
          new THREE.Vector3(thug.group.position.x - 12, 22, thug.group.position.z - 16),
          thug.group.position.clone().add(new THREE.Vector3(0, 1.8, 0))
        ];
        const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), beamMat);
        this.scene.add(beam);
        this.sniperBeams.push(beam);
      });

      if (this.onDialogue) this.onDialogue('lvl1_spec_flip');
      this.notifyState();

      if (!this.state.fireworksExploded) {
        setTimeout(() => {
          this.triggerFireworksExplosion();
        }, 1200);
      }
    } else if (this.currentChapter === 2) {
      // Chapter 2 Suspension Bridge Sniper Protocol
      this.suvs.forEach((suv, idx) => {
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
        const pts = [
          new THREE.Vector3(suv.position.x - 25, 20, (idx % 2 === 0 ? -22 : 22)),
          suv.position.clone().add(new THREE.Vector3(0, 1.2, 0))
        ];
        const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), beamMat);
        this.scene.add(beam);
        this.sniperBeams.push(beam);
      });

      if (this.onDialogue) this.onDialogue('lvl2_spec_flip');
      this.notifyState();

      // Timed chain reaction explosion & goons blasted over bridge railing
      setTimeout(() => {
        soundManager.playExplosion();
        this.sniperBeams.forEach(b => this.scene.remove(b));
        this.sniperBeams = [];

        // Fiery explosion particles on all 6 SUVs
        this.suvs.forEach((suv) => {
          const colors = [0xff4500, 0xffa500, 0xff0000, 0xffff00, 0xffffff];
          for (let i = 0; i < 22; i++) {
            const pGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 6, 6);
            const pMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.copy(suv.position).add(new THREE.Vector3((Math.random() - 0.5) * 2, 0.8, (Math.random() - 0.5) * 1.5));
            this.scene.add(p);
            this.fireworkParticles.push({
              mesh: p,
              vel: new THREE.Vector3((Math.random() - 0.5) * 14, 8 + Math.random() * 10, (Math.random() - 0.5) * 14),
              life: 1.2 + Math.random() * 0.6
            });
          }
          suv.rotation.z = (Math.random() - 0.5) * 0.18;
          suv.position.y += 0.25;
        });

        // Launch all 6 goons flying over bridge railings into the river below!
        this.thugs.forEach((thug, i) => {
          if (thug.alive) {
            thug.alive = false;
            const sideDir = i % 2 === 0 ? 1 : -1;
            thug.vel.set(
              (Math.random() - 0.5) * 6 + 4,
              18 + Math.random() * 6,
              sideDir * (12 + Math.random() * 5)
            );
            thug.rotVel.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
          }
        });

        // Car keys fly across bridge to Tiger
        if (this.carKeyMesh) {
          const startKey = this.carKeyMesh.position.clone();
          const targetKey = new THREE.Vector3(-14, 0.8, 0);
          let keyProg = 0;
          const keyInterval = setInterval(() => {
            keyProg += 0.04;
            if (this.carKeyMesh) {
              this.carKeyMesh.position.lerpVectors(startKey, targetKey, keyProg);
              this.carKeyMesh.position.y += Math.sin(keyProg * Math.PI) * 0.3;
              this.carKeyMesh.rotation.y += 0.4;
              this.carKeyMesh.rotation.z += 0.4;
            }
            if (keyProg >= 1) clearInterval(keyInterval);
          }, 16);
        }

        setTimeout(() => {
          if (this.onDialogue) this.onDialogue('lvl2_victory');
          this.triggerVictory();
        }, 2200);
      }, 700);
    } else if (this.currentChapter === 3) {
      // Chapter 3 Tea Stall Sniper Disarm
      this.thugs.forEach((thug) => {
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
        const pts = [
          new THREE.Vector3(thug.group.position.x - 18, 16, thug.group.position.z - 14),
          thug.group.position.clone().add(new THREE.Vector3(0, 1.2, 0))
        ];
        const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), beamMat);
        this.scene.add(beam);
        this.sniperBeams.push(beam);
      });

      if (this.onDialogue) this.onDialogue('lvl3_spec_flip');
      this.notifyState();

      setTimeout(() => {
        soundManager.playSniperShot();
        this.sniperBeams.forEach(b => this.scene.remove(b));
        this.sniperBeams = [];

        this.thugs.forEach((thug) => {
          if (thug.alive) {
            thug.alive = false;
            thug.vel.set((Math.random() - 0.5) * 14, 2, (Math.random() - 0.5) * 14);
            thug.rotVel.set(0, Math.random() * 12, 0);
          }
        });

        setTimeout(() => {
          if (this.onDialogue) this.onDialogue('lvl3_victory');
          this.triggerVictory();
        }, 1800);
      }, 600);
    } else {
      // Chapter 4 - 10 Arena Salvo
      this.thugs.forEach((thug) => {
        const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
        const pts = [
          new THREE.Vector3(thug.group.position.x - 20, 24, thug.group.position.z - 20),
          thug.group.position.clone().add(new THREE.Vector3(0, 1.5, 0))
        ];
        const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), beamMat);
        this.scene.add(beam);
        this.sniperBeams.push(beam);
      });

      this.notifyState();

      setTimeout(() => {
        soundManager.playExplosion();
        this.sniperBeams.forEach(b => this.scene.remove(b));
        this.sniperBeams = [];

        this.thugs.forEach((thug) => {
          if (thug.alive) {
            thug.alive = false;
            thug.vel.set((Math.random() - 0.5) * 10, 14 + Math.random() * 6, (Math.random() - 0.5) * 10);
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        });

        setTimeout(() => {
          this.triggerVictory();
        }, 1800);
      }, 700);
    }
  }

  // --- Main 3D Animation Frame Update ---
  public update(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.state.phase === 'VICTORY' || this.state.phase === 'BUSTED') return;

    this.handleMovement(delta, keys);

    // Only update Viji patrol in Chapter 1
    if (this.currentChapter === 1) {
      this.updateVijiPatrol(delta);
    }

    // Rickshaw Incline Rolling (Chapter 1)
    if (this.currentChapter === 1 && this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.22;
      this.rickshawGroup.position.z += 0.35;
      this.rickshawGroup.rotation.y = 0.68;

      this.thugs.forEach((thug) => {
        if (thug.alive) {
          const dist = this.rickshawGroup.position.distanceTo(thug.group.position);
          if (dist < 2.8) {
            thug.alive = false;
            soundManager.playSniperShot();
            this.state.aura += 1250 * this.state.multiplier;

            thug.vel.set(
              (Math.random() - 0.5) * 8 + 5,
              14 + Math.random() * 6,
              (Math.random() - 0.5) * 8 + 6
            );
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        }
      });

      const distToCart = this.rickshawGroup.position.distanceTo(this.fireworksGroup.position);
      if (distToCart < 3.4) {
        this.triggerFireworksExplosion();
      }
    }

    // Update Thugs Ragdoll Physics
    this.thugs.forEach((thug) => {
      if (!thug.alive) {
        thug.group.position.addScaledVector(thug.vel, delta);
        thug.group.rotation.x += thug.rotVel.x * delta;
        thug.group.rotation.y += thug.rotVel.y * delta;
        thug.vel.y -= 26 * delta; // Gravity

        // In Chapter 2, goons fall over bridge cables into the river gorge below!
        const groundY = this.currentChapter === 2 ? -9.5 : 0.2;
        if (thug.group.position.y < groundY) {
          thug.group.position.y = groundY;
          thug.vel.set(0, 0, 0);
          thug.rotVel.set(0, 0, 0);
        }
      }
    });

    // Update Firework Particles
    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 14 * delta;
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fireworkParticles.splice(i, 1);
      }
    }

    // Camera follow with dramatic framing
    let targetCamX = this.state.hukumMode ? this.tigerGroup.position.x - 8 : this.tigerGroup.position.x - 14;
    let targetCamY = this.state.hukumMode ? 10 : 16;
    let targetCamZ = this.state.hukumMode ? this.tigerGroup.position.z + 12 : this.tigerGroup.position.z + 20;

    if (this.currentChapter === 2) {
      targetCamX = this.tigerGroup.position.x - 10;
      targetCamY = 12;
      targetCamZ = this.tigerGroup.position.z + 16;
    }

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.06;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.06;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.06;

    this.camera.lookAt(
      this.tigerGroup.position.x + 2,
      1.6,
      this.tigerGroup.position.z + (this.currentChapter === 2 ? 0 : 1)
    );
  }

  private handleMovement(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    const speed = this.state.hukumMode ? 3.8 : 5.8;
    const move = new THREE.Vector3();

    if (keys.left) move.x -= 1;
    if (keys.right) move.x += 1;
    if (keys.up) move.z -= 1;
    if (keys.down) move.z += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      this.tigerGroup.position.addScaledVector(move, speed * delta);
      this.tigerGroup.rotation.y = Math.atan2(move.x, move.z);

      // Mass Swagger Walking Animation
      this.walkTime += delta * 7.5;
      this.tigerArmL.rotation.x = Math.sin(this.walkTime) * 0.45;
      this.tigerArmR.rotation.x = -Math.sin(this.walkTime) * 0.45;
      this.tigerTorsoGroup.rotation.y = Math.sin(this.walkTime) * 0.08;
      this.tigerGroup.position.y = Math.abs(Math.sin(this.walkTime)) * 0.08;
    } else {
      this.tigerArmL.rotation.x = 0;
      this.tigerArmR.rotation.x = 0;
      this.tigerTorsoGroup.rotation.y = 0;
      this.tigerGroup.position.y = 0;
    }

    // Constraint limits on Bridge (Chapter 2) so Tiger doesn't fall off
    if (this.currentChapter === 2) {
      this.tigerGroup.position.x = Math.max(-28, Math.min(28, this.tigerGroup.position.x));
      this.tigerGroup.position.z = Math.max(-3.4, Math.min(3.4, this.tigerGroup.position.z));
    }
  }

  private updateVijiPatrol(delta: number) {
    if (!this.vijiSpotlight) return;

    this.vijiTurnTimer += delta;
    if (this.vijiTurnTimer > 3.6) {
      this.vijiTurnTimer = 0;
      this.vijiAngle = this.vijiAngle === 0 ? Math.PI : 0;
    }

    this.vijiGroup.rotation.y = THREE.MathUtils.lerp(this.vijiGroup.rotation.y, this.vijiAngle, 0.04);

    // Suspicion Detection
    const toTiger = this.tigerGroup.position.clone().sub(this.vijiGroup.position);
    const dist = toTiger.length();

    if (dist < 12) {
      const vijiForward = new THREE.Vector3(0, 0, 1).applyEuler(this.vijiGroup.rotation);
      const dot = toTiger.normalize().dot(vijiForward);

      if (dot > 0.48 && !this.state.hukumMode) {
        this.state.vijiSuspicion = Math.min(100, this.state.vijiSuspicion + 45 * delta);
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
    this.vijiSpotlight.color.setHex(coneColor);

    this.notifyState();
  }

  private triggerFireworksExplosion() {
    if (this.state.fireworksExploded) return;
    this.state.fireworksExploded = true;

    soundManager.playExplosion();

    this.sniperBeams.forEach(b => this.scene.remove(b));
    this.sniperBeams = [];

    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xffffff];
    for (let i = 0; i < 75; i++) {
      const pGeo = new THREE.SphereGeometry(0.14 + Math.random() * 0.1, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(this.fireworksGroup.position).add(new THREE.Vector3(0, 1.8, 0));
      this.scene.add(p);

      this.fireworkParticles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 18,
          9 + Math.random() * 14,
          (Math.random() - 0.5) * 18
        ),
        life: 1.4 + Math.random() * 0.8
      });
    }

    this.thugs.forEach((thug) => {
      if (thug.alive) {
        thug.alive = false;
        thug.vel.set((Math.random() - 0.5) * 8, 12 + Math.random() * 6, (Math.random() - 0.5) * 8);
        thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      }
    });

    setTimeout(() => {
      this.triggerVictory();
    }, 1500);
  }

  // --- VICTORY PROTOCOL (BLASTS THE JAILER THEME BY ANIRUDH) ---
  private triggerVictory() {
    this.state.phase = 'VICTORY';
    const baseAura = [0, 5000, 7500, 10000, 12500, 15000, 18000, 22000, 25000, 30000, 50000][this.currentChapter] || 5000;
    this.state.aura += baseAura * this.state.multiplier;

    // Blast the authentic, iconic Jailer Theme by Anirudh Ravichander
    soundManager.playJailerThemeVictory();

    if (this.onDialogue) {
      this.onDialogue(`lvl${this.currentChapter}_victory`);
    }

    if (this.onVictory) {
      this.onVictory({
        levelNumber: this.currentChapter,
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
    this.loadChapter(this.currentChapter);
  }

  private notifyState() {
    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }
}
