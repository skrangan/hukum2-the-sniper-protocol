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

  // Hierarchical Groups & Actors
  public tigerGroup: THREE.Group = new THREE.Group();
  public vijiGroup: THREE.Group = new THREE.Group();
  public rickshawGroup: THREE.Group = new THREE.Group();
  public coconutMesh!: THREE.Mesh;
  public fireworksGroup: THREE.Group = new THREE.Group();
  public thugs: { group: THREE.Group; alive: boolean; vel: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];
  public sniperBeams: THREE.Line[] = [];
  public fireworkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  public dustParticles: THREE.Points | null = null;

  // Vision Spotlight
  private vijiSpotlight!: THREE.SpotLight;
  private vijiSpotlightTarget!: THREE.Object3D;
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

    // Cinematic Golden Hour Skybox Atmosphere
    this.scene.background = new THREE.Color(0x131a29);
    this.scene.fog = new THREE.FogExp2(0x131a29, 0.016);

    // Cinematic 3D Camera with Film Focal Length
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-16, 16, 24);
    this.camera.lookAt(0, 1.5, 0);

    this.setupRealisticLighting();
    this.buildRealisticChennaiStreet();
    this.buildRealisticTiger();
    this.buildRealisticViji();
    this.buildRealisticBajajRickshaw();
    this.buildRealisticCoconut();
    this.buildRealisticFireworksCart();
    this.buildRealisticThugsAndBikes();
    this.createAtmosphericDust();

    this.startTime = Date.now();
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
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0003;
    this.scene.add(sunLight);

    // Cool Sky Fill Light
    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.4);
    skyFill.position.set(20, 20, -20);
    this.scene.add(skyFill);

    // Streetlamp Warm Volumetric Lights
    this.createStreetlamp(2, 0, 4);
    this.createStreetlamp(-14, 0, 4);
    this.createStreetlamp(12, 0, 4);
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
    this.scene.add(lampGroup);
  }

  // --- 2. Realistic Chennai Market Street Environment ---
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
    this.scene.add(road);

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
    this.scene.add(sidewalk);

    // Yellow & Black Curb Stones
    const curbGeo = new THREE.BoxGeometry(80, 0.4, 0.4);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.2, -2.1);
    this.scene.add(curb);

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
  }

  private createMadrasBuilding(x: number, y: number, z: number, brickHue: string, signTamil: string, signEng: string) {
    const bGroup = new THREE.Group();

    // 3-story concrete structure
    const facadeTex = TextureGenerator.createBrickBuildingTexture(brickHue);
    const bGeo = new THREE.BoxGeometry(14, 15, 8);
    const bMat = new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.9 });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.y = 7.5;
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Shop Signboard
    const signTex = TextureGenerator.createShopSignboardTexture(signTamil, signEng, brickHue);
    const signGeo = new THREE.PlaneGeometry(12, 3);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4.2, 4.05);
    bGroup.add(sign);

    // Balcony Railing on 2nd Floor
    const balconyGeo = new THREE.BoxGeometry(13, 1, 1.2);
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7 });
    const balcony = new THREE.Mesh(balconyGeo, balconyMat);
    balcony.position.set(0, 6.8, 4.4);
    balcony.castShadow = true;
    bGroup.add(balcony);

    // Rooftop Terracotta Parapet
    const parapetGeo = new THREE.BoxGeometry(14.4, 0.8, 8.4);
    const parapetMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });
    const parapet = new THREE.Mesh(parapetGeo, parapetMat);
    parapet.position.y = 15.2;
    bGroup.add(parapet);

    bGroup.position.set(x, y, z);
    this.scene.add(bGroup);
  }

  private createDetailedMarketStall(x: number, y: number, z: number, items: { name: string; x: number; y: number; z: number }[]) {
    const stall = new THREE.Group();

    // Heavy weathered wooden table
    const tableGeo = new THREE.BoxGeometry(4.2, 0.9, 2.2);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x54351a, roughness: 0.9 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.45;
    table.castShadow = true;
    table.receiveShadow = true;
    stall.add(table);

    // Canvas Canopy with striped cloth
    const canopyGeo = new THREE.ConeGeometry(3.0, 1.2, 4);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 3.2, 0);
    canopy.rotation.y = Math.PI / 4;
    canopy.castShadow = true;
    stall.add(canopy);

    // Bamboo Support Poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.8 });
    [[-1.8, -0.9], [1.8, -0.9], [-1.8, 0.9], [1.8, 0.9]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2), poleMat);
      p.position.set(px, 1.6, pz);
      p.castShadow = true;
      stall.add(p);
    });

    // Fresh produce props
    items.forEach((item) => {
      if (item.name === 'bananas') {
        // Hanging Yellow Banana Bunch
        const bBunch = new THREE.Group();
        const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
        for (let b = 0; b < 8; b++) {
          const bMesh = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 8, Math.PI / 2), bananaMat);
          bMesh.rotation.z = (b * Math.PI) / 4;
          bBunch.add(bMesh);
        }
        bBunch.position.set(item.x, item.y, item.z);
        stall.add(bBunch);
      } else if (item.name === 'tomatoes') {
        // Tomato crate
        const crateGeo = new THREE.BoxGeometry(1.2, 0.35, 0.8);
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.position.set(item.x, item.y, item.z);
        stall.add(crate);

        const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        for (let t = 0; t < 6; t++) {
          const tom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), tomatoMat);
          tom.position.set(item.x - 0.3 + (t % 3) * 0.3, item.y + 0.22, item.z - 0.15 + Math.floor(t / 3) * 0.3);
          stall.add(tom);
        }
      }
    });

    stall.position.set(x, y, z);
    this.scene.add(stall);
  }

  // --- 3. Realistic 3D Tiger Muthuvel Pandian (Superstar Rajinikanth) ---
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
    this.tigerTorsoGroup.add(this.tigerArmL);

    this.tigerArmR = new THREE.Group();
    const meshArmR = new THREE.Mesh(armGeo, shirtMat);
    meshArmR.position.y = -0.4;
    meshArmR.castShadow = true;
    this.tigerArmR.add(meshArmR);
    this.tigerArmR.position.set(0.68, 2.1, 0);
    this.tigerTorsoGroup.add(this.tigerArmR);

    // Leather Chappals (Sandals)
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.55), shoeMat);
    footL.position.set(-0.25, 0.05, 0.05);
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.55), shoeMat);
    footR.position.set(0.25, 0.05, 0.05);
    this.tigerGroup.add(footL);
    this.tigerGroup.add(footR);

    this.tigerGroup.add(this.tigerTorsoGroup);
    this.tigerGroup.position.set(-8, 0, -3);
    this.scene.add(this.tigerGroup);
  }

  // --- 4. Realistic Viji (Tiger's Wife) with Kanjeevaram Saree & Vision Light ---
  private buildRealisticViji() {
    this.vijiGroup = new THREE.Group();

    // Maroon & Gold Kanjeevaram Silk Saree
    const sareeMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.65
    });
    const sareePleats = new THREE.CylinderGeometry(0.6, 0.8, 1.8, 16);
    const saree = new THREE.Mesh(sareePleats, sareeMat);
    saree.position.y = 0.9;
    saree.castShadow = true;
    this.vijiGroup.add(saree);

    // Gold Pallu Drape across shoulder
    const palluMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6 });
    const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.6), palluMat);
    pallu.position.set(-0.35, 1.4, 0);
    pallu.rotation.z = -0.2;
    this.vijiGroup.add(pallu);

    // Head & Hair Bun with Jasmine Flowers (Malli Poo)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd49b70, roughness: 0.75 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), skinMat);
    head.position.y = 2.15;
    this.vijiGroup.add(head);

    const hairBun = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b })
    );
    hairBun.position.set(0, 2.22, -0.26);
    this.vijiGroup.add(hairBun);

    const jasmineFlowers = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.06, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    jasmineFlowers.position.set(0, 2.22, -0.26);
    this.vijiGroup.add(jasmineFlowers);

    // Grocery Basket in Hand
    const basket = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.45, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    basket.position.set(0.6, 1.1, 0.1);
    this.vijiGroup.add(basket);

    // Realistic Spotlight Vision Cone (Flashlight Beam projected on street)
    this.vijiSpotlight = new THREE.SpotLight(0xfacc15, 4.0, 15, Math.PI / 4, 0.5, 1.2);
    this.vijiSpotlight.position.set(0, 1.8, 0);
    this.vijiSpotlight.castShadow = true;

    this.vijiSpotlightTarget = new THREE.Object3D();
    this.vijiSpotlightTarget.position.set(0, 0, 8);
    this.vijiGroup.add(this.vijiSpotlightTarget);
    this.vijiSpotlight.target = this.vijiSpotlightTarget;

    this.vijiGroup.add(this.vijiSpotlight);

    this.vijiGroup.position.set(-6, 0, 7);
    this.scene.add(this.vijiGroup);
  }

  // --- 5. Realistic Bajaj RE Auto-Rickshaw ---
  private buildRealisticBajajRickshaw() {
    this.rickshawGroup = new THREE.Group();

    // Authentic Yellow Fiberglass Canopy Roof
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 2.8), roofMat);
    roof.position.set(0, 2.2, -0.2);
    roof.castShadow = true;
    this.rickshawGroup.add(roof);

    // Green Lower Chassis
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      roughness: 0.5,
      metalness: 0.3
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.2, 3.6), chassisMat);
    chassis.position.set(0, 1.1, 0);
    chassis.castShadow = true;
    this.rickshawGroup.add(chassis);

    // Windshield & Chrome Pillars
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.85), glassMat);
    glass.position.set(0, 2.1, 1.25);
    this.rickshawGroup.add(glass);

    // Realistic Headlight with Glass Refraction & Yellow Beam
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 })
    );
    light.rotation.x = Math.PI / 2;
    light.position.set(0, 1.1, 1.85);
    this.rickshawGroup.add(light);

    // Authentic Number Plate (TN 01 AB 1975)
    const plateTex = TextureGenerator.createRickshawDecalTexture();
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.5),
      new THREE.MeshStandardMaterial({ map: plateTex })
    );
    plate.position.set(0, 0.6, 1.82);
    this.rickshawGroup.add(plate);

    // Authentic Bajaj Wheels with Tread & Chrome Rims
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 });

    const createWheel = (x: number, y: number, z: number) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.32, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.33, 16), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      wGroup.position.set(x, y, z);
      return wGroup;
    };

    this.rickshawGroup.add(createWheel(0, 0.45, 1.3)); // Front wheel
    this.rickshawGroup.add(createWheel(-1.15, 0.45, -0.9)); // Back Left
    this.rickshawGroup.add(createWheel(1.15, 0.45, -0.9)); // Back Right

    // Place Rickshaw on the incline slope
    this.rickshawGroup.position.set(-1.5, 0, -3);
    this.rickshawGroup.rotation.y = 0.45;
    this.scene.add(this.rickshawGroup);
  }

  // --- 6. Realistic Green Coconut ---
  private buildRealisticCoconut() {
    const coconutGeo = new THREE.SphereGeometry(0.4, 20, 20);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.75,
      metalness: 0.1
    });
    this.coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    this.coconutMesh.position.set(-4.5, 0.4, -2.5);
    this.coconutMesh.castShadow = true;
    this.scene.add(this.coconutMesh);
  }

  // --- 7. Realistic Diwali Fireworks Cart ---
  private buildRealisticFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    // Wooden Cart Carriage with spoke wheels
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const cartBed = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.85, 4.5), woodMat);
    cartBed.position.y = 0.9;
    cartBed.castShadow = true;
    this.fireworksGroup.add(cartBed);

    // Decorative Diwali Cracker Boxes
    const boxTex = TextureGenerator.createFireworkBoxTexture();
    const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.5 });
    for (let bx = 0; bx < 3; bx++) {
      for (let bz = 0; bz < 4; bz++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.9), boxMat);
        box.position.set(-0.8 + bx * 0.8, 1.6, -1.3 + bz * 0.9);
        box.castShadow = true;
        this.fireworksGroup.add(box);
      }
    }

    // Diwali Rocket Tubes
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    for (let r = 0; r < 8; r++) {
      const rocket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), rocketMat);
      rocket.position.set(-0.9 + r * 0.25, 2.4, 1.2);
      rocket.castShadow = true;
      this.fireworksGroup.add(rocket);
    }

    this.fireworksGroup.position.set(8.5, 0, 11);
    this.scene.add(this.fireworksGroup);
  }

  // --- 8. Realistic Thugs & Royal Enfield Style Motorbikes ---
  private buildRealisticThugsAndBikes() {
    // 2 Parked Royal Enfield Style Motorbikes
    this.createMotorbike(4.0, 0, 4.5);
    this.createMotorbike(6.5, 0, 6.0);

    const thugConfigs = [
      { x: 3.8, z: 5.5, rot: 0.2 },
      { x: 5.2, z: 4.8, rot: -0.4 },
      { x: 4.2, z: 7.2, rot: 0.8 },
      { x: 6.8, z: 7.8, rot: -0.6 }
    ];

    thugConfigs.forEach((cfg) => {
      const thugGroup = new THREE.Group();

      // Realistic leather jackets & jeans
      const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.15, 0.45), jacketMat);
      body.position.y = 1.35;
      body.castShadow = true;
      thugGroup.add(body);

      // Head & Red Bandana
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

      thugGroup.position.set(cfg.x, 0, cfg.z);
      thugGroup.rotation.y = cfg.rot;
      this.scene.add(thugGroup);

      this.thugs.push({
        group: thugGroup,
        alive: true,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3()
      });
    });
  }

  private createMotorbike(x: number, y: number, z: number) {
    const bike = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.4, roughness: 0.3 });

    // Fuel Tank
    const tank = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), tankMat);
    tank.scale.set(0.8, 0.7, 1.4);
    tank.position.set(0, 1.1, 0.2);
    tank.castShadow = true;
    bike.add(tank);

    // Chrome Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 12), chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.35, 0.4, -0.2);
    bike.add(exhaust);

    // Spoke Wheels
    const wFront = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.18, 16), tireMat);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0, 0.45, 1.2);
    wFront.castShadow = true;
    bike.add(wFront);

    const wRear = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.22, 16), tireMat);
    wRear.rotation.z = Math.PI / 2;
    wRear.position.set(0, 0.45, -1.0);
    wRear.castShadow = true;
    bike.add(wRear);

    bike.position.set(x, y, z);
    bike.rotation.y = -0.5;
    this.scene.add(bike);
  }

  // --- 9. Atmospheric Golden Sun Dust Motes ---
  private createAtmosphericDust() {
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = Math.random() * 12;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.12,
      transparent: true,
      opacity: 0.5
    });

    this.dustParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.dustParticles);
  }

  // --- Core Gameplay Interactions ---

  public kickCoconut() {
    if (this.state.coconutKicked) return;
    this.state.coconutKicked = true;

    soundManager.playCoconutKick();

    // Coconut rolls towards rickshaw
    const target = this.rickshawGroup.position.clone().add(new THREE.Vector3(0, 0.4, 0));
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

  public triggerSpectacleFlip() {
    if (this.state.hukumMode) return;
    this.state.hukumMode = true;
    this.state.multiplier = 10; // HUKUM x10

    soundManager.playSpectacleFlipBassDrop();

    // 360° Aviator Glasses Flip Animation
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

    // Call 3D Glowing Red Sniper Laser Beams from distant rooftops
    this.thugs.forEach((thug) => {
      const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
      const pts = [
        new THREE.Vector3(thug.group.position.x - 12, 22, thug.group.position.z - 16),
        thug.group.position.clone().add(new THREE.Vector3(0, 1.8, 0))
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const beam = new THREE.Line(beamGeo, beamMat);
      this.scene.add(beam);
      this.sniperBeams.push(beam);
    });

    if (this.onDialogue) this.onDialogue('lvl1_spec_flip');
    this.notifyState();
  }

  // Main 3D Animation Frame Update
  public update(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.state.phase === 'VICTORY' || this.state.phase === 'BUSTED') return;

    this.handleMovement(delta, keys);
    this.updateVijiPatrol(delta);

    // Rickshaw Incline Rolling
    if (this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.22;
      this.rickshawGroup.position.z += 0.35;
      this.rickshawGroup.rotation.y = 0.68;

      // Check collision with thugs
      this.thugs.forEach((thug) => {
        if (thug.alive) {
          const dist = this.rickshawGroup.position.distanceTo(thug.group.position);
          if (dist < 2.8) {
            thug.alive = false;
            soundManager.playSniperShot();
            this.state.aura += 1250 * this.state.multiplier;

            // Launch thug into air (3D Ragdoll trajectory)
            thug.vel.set(
              (Math.random() - 0.5) * 8 + 5,
              14 + Math.random() * 6,
              (Math.random() - 0.5) * 8 + 6
            );
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        }
      });

      // Check collision with fireworks cart
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
      p.vel.y -= 14 * delta;
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fireworkParticles.splice(i, 1);
      }
    }

    // Camera follow with dramatic zoom in Hukum Mode
    const targetCamX = this.state.hukumMode ? this.tigerGroup.position.x - 8 : this.tigerGroup.position.x - 14;
    const targetCamY = this.state.hukumMode ? 10 : 16;
    const targetCamZ = this.state.hukumMode ? this.tigerGroup.position.z + 12 : this.tigerGroup.position.z + 20;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.06;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.06;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.06;

    this.camera.lookAt(
      this.tigerGroup.position.x + 2,
      1.6,
      this.tigerGroup.position.z + 1
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
  }

  private updateVijiPatrol(delta: number) {
    this.vijiTurnTimer += delta;
    if (this.vijiTurnTimer > 3.6) {
      this.vijiTurnTimer = 0;
      this.vijiAngle = (this.vijiAngle + Math.PI / 2) % (Math.PI * 2);
      this.vijiGroup.rotation.y = this.vijiAngle;
    }

    // Distance and Angle to Tiger
    const toTiger = this.tigerGroup.position.clone().sub(this.vijiGroup.position);
    const dist = toTiger.length();
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vijiAngle);
    const dot = forward.dot(toTiger.normalize());

    // If Tiger is caught in Viji's spotlight
    if (dist < 10.5 && dot > 0.65) {
      if (this.state.coconutKicked && !this.state.fireworksExploded) {
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

    // Update Spotlight Color
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

    // Exploding 3D Fireworks Fountains
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

  private triggerVictory() {
    this.state.phase = 'VICTORY';
    this.state.aura += 5000 * this.state.multiplier;
    soundManager.playVictoryFanfare();

    if (this.onDialogue) this.onDialogue('lvl1_victory');

    if (this.onVictory) {
      this.onVictory({
        levelNumber: 1,
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

    this.tigerGroup.position.set(-8, 0, -3);
    this.rickshawGroup.position.set(-1.5, 0, -3);
    this.coconutMesh.position.set(-4.5, 0.4, -2.5);

    this.thugs.forEach((thug, idx) => {
      thug.alive = true;
      thug.group.rotation.set(0, 0, 0);
      const configs = [
        { x: 3.8, z: 5.5, rot: 0.2 },
        { x: 5.2, z: 4.8, rot: -0.4 },
        { x: 4.2, z: 7.2, rot: 0.8 },
        { x: 6.8, z: 7.8, rot: -0.6 }
      ];
      thug.group.position.set(configs[idx].x, 0, configs[idx].z);
      thug.group.rotation.y = configs[idx].rot;
    });

    this.sniperBeams.forEach(b => this.scene.remove(b));
    this.sniperBeams = [];

    this.startTime = Date.now();
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }
}
