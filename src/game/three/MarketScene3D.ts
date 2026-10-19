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
    armR: THREE.Group;
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
  private idleTime: number = 0;
  private footstepTimer: number = 0;
  private tigerGlassesGroup!: THREE.Group;
  private tigerArmL!: THREE.Group;
  private tigerArmR!: THREE.Group;
  private tigerLegL!: THREE.Group;
  private tigerLegR!: THREE.Group;
  private tigerTorsoMesh!: THREE.Mesh;

  // Procedural Realistic PBR Maps
  private asphaltTex!: THREE.CanvasTexture;
  private asphaltBumpTex!: THREE.CanvasTexture;
  private cobblestoneTex!: THREE.CanvasTexture;
  private stoneTempleTex!: THREE.CanvasTexture;
  private brickFacadeTex!: THREE.CanvasTexture;
  private colonialOchreTex!: THREE.CanvasTexture;
  private woodBarkTex!: THREE.CanvasTexture;
  private fabricSilkTex!: THREE.CanvasTexture;
  private veshtiFabricTex!: THREE.CanvasTexture;
  private neonSignTex!: THREE.CanvasTexture;
  private silkEmporiumSignTex!: THREE.CanvasTexture;
  private cinemaSignTex!: THREE.CanvasTexture;
  private skyBackdropTex!: THREE.CanvasTexture;

  // Callbacks
  public onStateUpdate?: (state: Game3DState) => void;
  public onDialogue?: (key: string) => void;
  public onVictory?: (summary: any) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x140c08);
    this.scene.fog = new THREE.FogExp2(0x180e09, 0.011);

    // Cinematic 35mm Low-Angle Action Camera
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-10.5, 9.2, 16.5);
    this.camera.lookAt(0, 1.8, 2);

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

  private generateRealisticTextures() {
    // 1. Wet Rain-Slicked Asphalt with Tire Tracks & Specular Aggregate
    const aspCanvas = document.createElement('canvas');
    aspCanvas.width = 512;
    aspCanvas.height = 512;
    const actx = aspCanvas.getContext('2d')!;
    actx.fillStyle = '#141820';
    actx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 16000; i++) {
      const v = 16 + Math.floor(Math.random() * 34);
      actx.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      actx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const grad = actx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.25)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.06)');
    actx.fillStyle = grad;
    actx.fillRect(0, 0, 512, 512);

    this.asphaltTex = new THREE.CanvasTexture(aspCanvas);
    this.asphaltTex.wrapS = THREE.RepeatWrapping;
    this.asphaltTex.wrapT = THREE.RepeatWrapping;
    this.asphaltTex.repeat.set(6, 6);
    this.asphaltBumpTex = this.asphaltTex;

    // 2. Heritage Granite Sidewalk Flagstones
    const cobCanvas = document.createElement('canvas');
    cobCanvas.width = 256;
    cobCanvas.height = 256;
    const cctx = cobCanvas.getContext('2d')!;
    cctx.fillStyle = '#2b2623';
    cctx.fillRect(0, 0, 256, 256);
    cctx.strokeStyle = '#141210';
    cctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        cctx.fillStyle = (x + y) % 64 === 0 ? '#3d352e' : '#332c26';
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
    sctx.fillStyle = '#574c3f';
    sctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      sctx.fillStyle = '#2e2820';
      sctx.fillRect(0, y, 256, 6);
      sctx.fillStyle = '#786856';
      sctx.fillRect(10, y + 8, 236, 16);
      sctx.fillStyle = '#d97706';
      sctx.fillRect(24, y + 13, 208, 4);
    }
    this.stoneTempleTex = new THREE.CanvasTexture(stCanvas);

    // 4. Weathered Terracotta Brick & Lime Plaster Facade Texture
    const brCanvas = document.createElement('canvas');
    brCanvas.width = 512;
    brCanvas.height = 512;
    const bctx = brCanvas.getContext('2d')!;
    bctx.fillStyle = '#5c2d1c';
    bctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 16) {
      for (let x = 0; x < 512; x += 32) {
        const off = (y / 16) % 2 === 0 ? 0 : 16;
        bctx.fillStyle = (x + y) % 48 === 0 ? '#6e3722' : '#4f2617';
        bctx.fillRect((x + off) % 512, y, 30, 14);
      }
    }
    this.brickFacadeTex = new THREE.CanvasTexture(brCanvas);
    this.brickFacadeTex.wrapS = THREE.RepeatWrapping;
    this.brickFacadeTex.wrapT = THREE.RepeatWrapping;
    this.brickFacadeTex.repeat.set(2, 2);

    // 5. Warm Colonial Ochre Stucco Texture
    const ocCanvas = document.createElement('canvas');
    ocCanvas.width = 256;
    ocCanvas.height = 256;
    const octx = ocCanvas.getContext('2d')!;
    octx.fillStyle = '#78472a';
    octx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      octx.fillStyle = i % 2 === 0 ? 'rgba(255,220,180,0.06)' : 'rgba(30,15,5,0.08)';
      octx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }
    this.colonialOchreTex = new THREE.CanvasTexture(ocCanvas);

    // 6. Aged Teak Wood & Crate Texture
    const wdCanvas = document.createElement('canvas');
    wdCanvas.width = 256;
    wdCanvas.height = 256;
    const wctx = wdCanvas.getContext('2d')!;
    wctx.fillStyle = '#5c3419';
    wctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 64; i++) {
      wctx.fillStyle = i % 2 === 0 ? 'rgba(40,20,5,0.32)' : 'rgba(140,85,40,0.22)';
      wctx.fillRect(0, i * 4, 256, 2);
    }
    this.woodBarkTex = new THREE.CanvasTexture(wdCanvas);

    // 7. Kanchipuram Maroon & Gold Zari Silk Texture
    const silkCanvas = document.createElement('canvas');
    silkCanvas.width = 128;
    silkCanvas.height = 128;
    const kctx = silkCanvas.getContext('2d')!;
    kctx.fillStyle = '#7f1d1d';
    kctx.fillRect(0, 0, 128, 128);
    kctx.fillStyle = '#f59e0b';
    kctx.fillRect(0, 96, 128, 24);
    for (let x = 0; x < 128; x += 16) {
      kctx.fillRect(x, 86, 8, 6);
    }
    this.fabricSilkTex = new THREE.CanvasTexture(silkCanvas);

    // 8. Handloom Cream Veshti with Gold Zari Border Texture
    const vCanvas = document.createElement('canvas');
    vCanvas.width = 128;
    vCanvas.height = 128;
    const vctx = vCanvas.getContext('2d')!;
    vctx.fillStyle = '#f1f5f9';
    vctx.fillRect(0, 0, 128, 128);
    vctx.fillStyle = '#d97706';
    vctx.fillRect(0, 104, 128, 18);
    vctx.fillRect(108, 0, 12, 128);
    this.veshtiFabricTex = new THREE.CanvasTexture(vCanvas);

    // 9. Storefront Signboards
    this.neonSignTex = this.createSignboardTexture(
      '#140c08',
      '#f59e0b',
      'SRI MUTHUVEL BAZAAR & TEA',
      'MYLAPORE HERITAGE MARKET • EST 1978'
    );
    this.silkEmporiumSignTex = this.createSignboardTexture(
      '#3b0712',
      '#fbbf24',
      'KANCHI SILK & JEWELLERY HOUSE',
      '22K HALLMARK GOLD • BRIDAL SAREE EMPORIUM'
    );
    this.cinemaSignTex = this.createSignboardTexture(
      '#091526',
      '#38bdf8',
      'PANDIAN TALKIES & CAFE',
      'FILTER COFFEE • ROADSIDE TIFFIN CENTER'
    );

    // 10. Sunset Golden-Hour Sky & City Skyline Backdrop
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const skctx = skyCanvas.getContext('2d')!;
    const skyGrad = skctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.45, '#3b1510');
    skyGrad.addColorStop(0.78, '#9a3412');
    skyGrad.addColorStop(1, '#f59e0b');
    skctx.fillStyle = skyGrad;
    skctx.fillRect(0, 0, 1024, 512);
    skctx.fillStyle = '#120907';
    for (let x = 0; x < 1024; x += 55) {
      const h = 60 + ((x * 37) % 130);
      skctx.fillRect(x, 512 - h, 48, h);
    }
    this.skyBackdropTex = new THREE.CanvasTexture(skyCanvas);
  }

  private createSignboardTexture(bgHex: string, borderHex: string, title: string, subtitle: string): THREE.CanvasTexture {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const nctx = signCanvas.getContext('2d')!;
    nctx.fillStyle = bgHex;
    nctx.fillRect(0, 0, 512, 128);
    nctx.strokeStyle = borderHex;
    nctx.lineWidth = 6;
    nctx.strokeRect(6, 6, 500, 116);
    nctx.fillStyle = '#fbbf24';
    nctx.font = 'bold 30px sans-serif';
    nctx.fillText(title, 22, 56);
    nctx.fillStyle = '#fde68a';
    nctx.font = 'bold 19px monospace';
    nctx.fillText(subtitle, 24, 96);
    return new THREE.CanvasTexture(signCanvas);
  }

  // Subtle Floating Tactical Callsign Pill (Replaces giant 2D photo slabs)
  private createTacticalFloatingBadge(text: string, accentHex: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.beginPath();
    ctx.roundRect(8, 10, 240, 44, 12);
    ctx.fill();
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = accentHex;
    ctx.beginPath();
    ctx.arc(30, 32, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(text, 46, 39);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.5, 0.38, 1);
    return sprite;
  }

  private initLights() {
    this.ambientLight = new THREE.HemisphereLight(0xffd8a8, 0x1e1b18, 1.1);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffa94d, 2.25);
    this.sunLight.position.set(-16, 24, 16);
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

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    this.rimLight.position.set(16, 14, -18);
    this.scene.add(this.rimLight);

    const lampCoords = [
      new THREE.Vector3(2.5, 6.2, 4),
      new THREE.Vector3(-4.5, 6.2, -7),
      new THREE.Vector3(8.5, 6.2, 9)
    ];
    lampCoords.forEach((pos) => {
      const pLight = new THREE.PointLight(0xffb703, 2.6, 24);
      pLight.position.copy(pos);
      pLight.castShadow = true;
      this.scene.add(pLight);
      this.streetLights.push(pLight);
    });
  }

  private buildRichMarketEnvironment() {
    while (this.environmentGroup.children.length > 0) {
      this.environmentGroup.remove(this.environmentGroup.children[0]);
    }

    // Panoramic Sunset Horizon Sky Dome
    const skyDome = new THREE.Mesh(
      new THREE.CylinderGeometry(48, 48, 36, 32, 1, true, Math.PI * 0.55, Math.PI * 1.1),
      new THREE.MeshBasicMaterial({ map: this.skyBackdropTex, side: THREE.BackSide })
    );
    skyDome.position.set(0, 14, -10);
    this.environmentGroup.add(skyDome);

    // 1. Textured Wet Asphalt Street Surface with Specular Puddles
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      bumpMap: this.asphaltBumpTex,
      bumpScale: 0.04,
      roughness: 0.38,
      metalness: 0.35
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.55
    });
    for (const [px, pz, pr] of [
      [-1.5, 2.5, 2.2],
      [4.2, 8.0, 2.6],
      [1.0, -5.5, 1.9]
    ]) {
      const puddle = new THREE.Mesh(new THREE.CircleGeometry(pr, 24), puddleMat);
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(px, 0.015, pz);
      this.environmentGroup.add(puddle);
    }

    // Road Divider & School Crossing Stripes
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    for (const offset of [-0.2, 0.2]) {
      const roadLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 48), lineMat);
      roadLine.rotation.x = -Math.PI / 2;
      roadLine.position.set(offset, 0.02, 0);
      this.environmentGroup.add(roadLine);
    }

    const whiteStripeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
    for (let i = -4; i <= 4; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.2), whiteStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 1.1 + 3.5, 0.025, 5.5);
      this.environmentGroup.add(stripe);
    }

    // 2. Heritage Stone Sidewalks & Curbs
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.cobblestoneTex,
      roughness: 0.72
    });
    const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    leftSidewalk.position.set(-9.5, 0.175, 0);
    leftSidewalk.receiveShadow = true;
    this.environmentGroup.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 52), sidewalkMat);
    rightSidewalk.position.set(13.5, 0.175, 0);
    rightSidewalk.receiveShadow = true;
    this.environmentGroup.add(rightSidewalk);

    for (let z = -20; z <= 20; z += 2) {
      const isYellow = Math.abs(z / 2) % 2 === 0;
      const curbMat = new THREE.MeshStandardMaterial({
        color: isYellow ? 0xd97706 : 0x18181b,
        roughness: 0.55
      });
      const curbBlock = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.38, 1.95), curbMat);
      curbBlock.position.set(-4.0, 0.19, z);
      curbBlock.castShadow = true;
      this.environmentGroup.add(curbBlock);
    }

    // 3. Dravidian Stone Temple Mandapam & Gopuram Tower
    this.buildTempleMandapam(-11.8, 0.35, 6.8);

    // 4. Multi-Story Detailed Colonial & Bazaar Shopfront Architecture (Pillared Verandas, Balconies, Shutters, Awnings)
    this.buildDetailedHeritageBuilding(-13.4, 0.35, -5.5, this.neonSignTex, true, 0xb91c1c);
    this.buildDetailedHeritageBuilding(15.2, 0.35, -3.5, this.silkEmporiumSignTex, false, 0xd97706);
    this.buildDetailedHeritageBuilding(15.2, 0.35, 8.8, this.cinemaSignTex, false, 0x047857);

    // 5. Authentic Indian Market Stalls with Produce Crates, Spice Sacks & Brass Tea Samovar
    this.createDetailedMarketStall(-7.8, 0.35, -6.5, 0x991b1b, 'coconut_bazaar');
    this.createDetailedMarketStall(-7.8, 0.35, 1.5, 0x92400e, 'spice_silk');
    this.createDetailedMarketStall(-7.8, 0.35, 10.5, 0x065f46, 'tea_stall');

    // 6. Lush Tropical Coconut Palms
    this.createCoconutPalm(-11.0, 0.35, -12.0, 1.15);
    this.createCoconutPalm(11.5, 0.35, -10.5, 1.0);
    this.createCoconutPalm(12.0, 0.35, 14.5, 1.2);

    // 7. Street Lamps & Overhead Festival Lights
    this.createStreetLamp(2.5, 0, 4);
    this.createStreetLamp(-4.2, 0, -7);
    this.createStreetLamp(8.2, 0, 9);
    this.createOverheadCablesAndBunting();

    // 8. Vimal's Premier Padmini Tourist Taxi with 3D Vimal Driver Figure at Extraction Point
    this.buildVimalPremierTaxi(-1.5, 0, -10.5);
  }

  private buildTempleMandapam(x: number, y: number, z: number) {
    const temple = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.stoneTempleTex,
      bumpMap: this.stoneTempleTex,
      bumpScale: 0.05,
      roughness: 0.8,
      metalness: 0.12
    });

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 6.2), stoneMat);
    plinth.position.y = 0.3;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    temple.add(plinth);

    const pillarCoords = [
      [-1.9, 2.4, -2.2],
      [1.9, 2.4, -2.2],
      [-1.9, 2.4, 2.2],
      [1.9, 2.4, 2.2]
    ];
    pillarCoords.forEach(([px, py, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 3.8, 16), stoneMat);
      col.position.set(px, py, pz);
      col.castShadow = true;
      temple.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 1.05), stoneMat);
      cap.position.set(px, py + 1.95, pz);
      temple.add(cap);
    });

    const roofBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 6.6), stoneMat);
    roofBase.position.y = 4.6;
    temple.add(roofBase);

    // Multi-tiered Carved Gopuram Pyramid Roof
    for (let tier = 0; tier < 3; tier++) {
      const tMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.4 - tier * 0.9, 0.95, 5.0 - tier * 0.9),
        stoneMat
      );
      tMesh.position.y = 5.35 + tier * 0.95;
      tMesh.castShadow = true;
      temple.add(tMesh);
    }

    const kalasamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
    for (const kz of [-1.0, 0, 1.0]) {
      const kalasam = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 14), kalasamMat);
      kalasam.position.set(0, 8.15, kz);
      temple.add(kalasam);
    }

    // Brass Kuthuvilakku Oil Lamp
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.32, 1.5, 14), brassMat);
    lampStand.position.set(2.2, 1.35, 0);
    temple.add(lampStand);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    flame.position.set(2.2, 2.15, 0);
    temple.add(flame);

    temple.position.set(x, y, z);
    this.environmentGroup.add(temple);
  }

  // Detailed Multi-Story South Indian Heritage Building (Pillared Arcade, Balcony Balustrades, Arched Windows, Storefront Awning)
  private buildDetailedHeritageBuilding(
    x: number,
    y: number,
    z: number,
    signTex: THREE.CanvasTexture,
    facingRight: boolean,
    awningHex: number
  ) {
    const bldg = new THREE.Group();
    const dir = facingRight ? 1 : -1;

    const brickMat = new THREE.MeshStandardMaterial({
      map: this.brickFacadeTex,
      bumpMap: this.brickFacadeTex,
      bumpScale: 0.04,
      roughness: 0.78
    });
    const ochreMat = new THREE.MeshStandardMaterial({
      map: this.colonialOchreTex,
      roughness: 0.72
    });
    const stoneTrimMat = new THREE.MeshStandardMaterial({
      map: this.stoneTempleTex,
      roughness: 0.65
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: this.woodBarkTex,
      roughness: 0.75
    });

    // Ground Floor Storefront Volume
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.2, 9.8), brickMat);
    groundFloor.position.y = 2.1;
    groundFloor.castShadow = true;
    groundFloor.receiveShadow = true;
    bldg.add(groundFloor);

    // Upper Floor Colonial Volume
    const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4.4, 9.6), ochreMat);
    upperFloor.position.y = 6.4;
    upperFloor.castShadow = true;
    upperFloor.receiveShadow = true;
    bldg.add(upperFloor);

    // Projecting First-Floor Veranda Balcony Slab + Carved Balustrade Railings
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 10.2), stoneTrimMat);
    balconySlab.position.set(dir * 3.1, 4.25, 0);
    balconySlab.castShadow = true;
    bldg.add(balconySlab);

    const balustradeRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 10.0), stoneTrimMat);
    balustradeRail.position.set(dir * 3.65, 4.8, 0);
    bldg.add(balustradeRail);

    // 4 Supporting Ground-Floor Veranda Columns
    for (const cz of [-4.2, -1.4, 1.4, 4.2]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.1, 14), stoneTrimMat);
      pillar.position.set(dir * 3.55, 2.05, cz);
      pillar.castShadow = true;
      bldg.add(pillar);
    }

    // Sloped Storefront Canvas Awning over Ground Floor
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.16, 9.4),
      new THREE.MeshStandardMaterial({ color: awningHex, roughness: 0.55 })
    );
    awning.position.set(dir * 3.8, 3.35, 0);
    awning.rotation.z = dir * -0.25;
    awning.castShadow = true;
    bldg.add(awning);

    // Illuminated Storefront Signboard
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.25, 7.6),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signBoard.position.set(dir * 3.82, 4.85, 0);
    bldg.add(signBoard);

    // 3D Recessed Upper Windows with Wooden Frames, Arch Tops & Open Louvered Shutters
    const warmGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      roughness: 0.2
    });
    for (const wz of [-3.0, 0, 3.0]) {
      const winGroup = new THREE.Group();

      // Wooden outer frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.85, 1.35), woodMat);
      winGroup.add(frame);

      // Glowing glass pane
      const pane = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.55, 1.05), warmGlassMat);
      winGroup.add(pane);

      // Left & Right Open Wooden Louvered Shutters
      for (const side of [-0.78, 0.78]) {
        const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.75, 0.42), woodMat);
        shutter.position.set(dir * 0.1, 0, side);
        shutter.rotation.y = side * dir * 0.35;
        winGroup.add(shutter);
      }

      // Decorative Arch Lintel above window
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 1.55), stoneTrimMat);
      lintel.position.set(0, 1.02, 0);
      winGroup.add(lintel);

      winGroup.position.set(dir * 2.72, 6.65, wz);
      bldg.add(winGroup);
    }

    // Stepped Terracotta Roof Cornice & Parapet Wall
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 10.4), stoneTrimMat);
    cornice.position.y = 8.75;
    bldg.add(cornice);

    const parapet = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.75, 10.0), brickMat);
    parapet.position.y = 9.35;
    bldg.add(parapet);

    bldg.position.set(x, y, z);
    this.environmentGroup.add(bldg);
  }

  private createDetailedMarketStall(x: number, y: number, z: number, canopyColor: number, type: string) {
    const stall = new THREE.Group();

    const tableMat = new THREE.MeshStandardMaterial({
      map: this.woodBarkTex,
      roughness: 0.75
    });
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 4.2), tableMat);
    table.position.y = 0.58;
    table.castShadow = true;
    table.receiveShadow = true;
    stall.add(table);

    // Woven Wicker Baskets & Burlap Spice Sacks in front of stall
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
    for (let s = 0; s < 3; s++) {
      const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.65, 12), sackMat);
      sack.position.set(1.85, 0.32, -1.1 + s * 1.1);
      sack.castShadow = true;
      stall.add(sack);
    }

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7, roughness: 0.35 });
    for (const [px, py, pz] of [
      [-1.4, 1.5, -1.9],
      [1.4, 1.5, -1.9],
      [-1.4, 1.5, 1.9],
      [1.4, 1.5, 1.9]
    ]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 10), poleMat);
      p.position.set(px, py + 0.55, pz);
      stall.add(p);
    }

    // Pitched Market Canopy Roof with Ridge Beam
    const awningL = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.14, 4.6),
      new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.55 })
    );
    awningL.position.set(-0.85, 3.25, 0);
    awningL.rotation.z = 0.28;
    awningL.castShadow = true;
    stall.add(awningL);

    const awningR = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.14, 4.6),
      new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.55 })
    );
    awningR.position.set(0.85, 3.25, 0);
    awningR.rotation.z = -0.28;
    awningR.castShadow = true;
    stall.add(awningR);

    // Warm Hanging Lantern inside Stall
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lantern.position.set(0, 2.85, 0);
    stall.add(lantern);

    if (type === 'coconut_bazaar') {
      const cocoMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
      for (let i = 0; i < 12; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), cocoMat);
        c.position.set(-0.65 + (i % 4) * 0.45, 1.32 + Math.floor(i / 8) * 0.35, -0.9 + Math.floor((i % 8) / 4) * 0.7);
        stall.add(c);
      }
    } else if (type === 'tea_stall') {
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.2 });
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.95, 16), brassMat);
      boiler.position.set(0.4, 1.62, -0.5);
      stall.add(boiler);

      // Tea glasses rack
      for (let g = 0; g < 4; g++) {
        const glass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.06, 0.22, 10),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.1 })
        );
        glass.position.set(-0.4 + g * 0.22, 1.28, 0.65);
        stall.add(glass);
      }
    } else {
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
    const trunkMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.88 });

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

    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 2.8), frondMat);
      frond.position.set(0.35 + Math.cos(angle) * 1.2, 8.2, Math.sin(angle) * 1.2);
      frond.rotation.y = -angle + Math.PI / 2;
      frond.rotation.x = 0.35;
      palm.add(frond);
    }

    palm.position.set(x, y, z);
    palm.scale.setScalar(scale);
    this.environmentGroup.add(palm);
  }

  private createStreetLamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.88, roughness: 0.25 });

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
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    bulb.position.set(0.9, 5.8, 0);
    lampGroup.add(bulb);

    lampGroup.position.set(x, y, z);
    this.environmentGroup.add(lampGroup);
  }

  private createOverheadCablesAndBunting() {
    for (const zPos of [-4, 4, 11]) {
      const cablePts = [
        new THREE.Vector3(-10, 6.8, zPos),
        new THREE.Vector3(0, 6.2, zPos),
        new THREE.Vector3(12, 6.8, zPos)
      ];
      const curve = new THREE.QuadraticBezierCurve3(cablePts[0], cablePts[1], cablePts[2]);
      const pts = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x27272a })
      );
      this.environmentGroup.add(line);

      for (let i = 2; i < 18; i += 3) {
        const pt = pts[i];
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0xf97316 })
        );
        bulb.position.copy(pt).add(new THREE.Vector3(0, -0.12, 0));
        this.environmentGroup.add(bulb);
      }
    }
  }

  // Vimal's Premier Padmini Black-and-Yellow Tourist Taxi with Articulated 3D Vimal Driver
  private buildVimalPremierTaxi(x: number, y: number, z: number) {
    const taxi = new THREE.Group();
    const blackBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.75,
      roughness: 0.25
    });
    const yellowRoofMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.45,
      roughness: 0.3
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

    const roofSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.24, 0.28),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    roofSign.position.set(0, 2.02, 0.2);
    taxi.add(roofSign);

    // 3D Vimal Getaway Driver standing beside the Premier Padmini Taxi in Tropical Goan Shirt
    const vimalDriver = new THREE.Group();
    const tropicalShirtMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });
    const vTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.95, 14), tropicalShirtMat);
    vTorso.position.y = 1.35;
    vimalDriver.add(vTorso);

    const vHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.65 })
    );
    vHead.position.y = 2.05;
    vimalDriver.add(vHead);

    const vHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 })
    );
    vHair.position.set(0, 2.14, -0.04);
    vimalDriver.add(vHair);

    const vLegs = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.22, 0.85, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    vLegs.position.y = 0.45;
    vimalDriver.add(vLegs);

    vimalDriver.position.set(1.65, 0, 0.5);
    taxi.add(vimalDriver);

    const vimalBadge = this.createTacticalFloatingBadge('VIMAL // TAXI', '#eab308');
    vimalBadge.position.set(0, 2.75, 0);
    taxi.add(vimalBadge);

    taxi.position.set(x, y, z);
    taxi.rotation.y = 0.35;
    this.environmentGroup.add(taxi);
  }

  private buildAtmosphericEmbers() {
    const count = 110;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });
    this.embers = new THREE.Points(geo, mat);
    this.scene.add(this.embers);
  }

  // Detailed Articulated 3D Model: "Tiger" Muthuvel Pandian (Superstar Rajinikanth in Jailer)
  private buildTigerCharacter() {
    this.tigerGroup = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.55 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.15
    });

    // Subtle Ground Tactical Ring under Tiger's Feet
    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.68, 0.82, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    auraRing.rotation.x = -Math.PI / 2;
    auraRing.position.y = 0.04;
    this.tigerGroup.add(auraRing);

    // Sculpted Linen Shirt Torso + Shoulder Yoke + Open Collar
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.36, 1.18, 18);
    this.tigerTorsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    this.tigerTorsoMesh.scale.set(1.15, 1.0, 0.72);
    this.tigerTorsoMesh.position.y = 1.65;
    this.tigerTorsoMesh.castShadow = true;
    this.tigerGroup.add(this.tigerTorsoMesh);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.25, 14), skinMat);
    neck.position.y = 2.28;
    this.tigerGroup.add(neck);

    // 24K Gold Chain Around Neck
    const neckChain = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 20), goldMat);
    neckChain.rotation.x = Math.PI / 2.2;
    neckChain.position.set(0, 2.22, 0.08);
    this.tigerGroup.add(neckChain);

    // Sculpted Head & Jawline
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), skinMat);
    head.scale.set(0.94, 1.08, 0.98);
    head.position.y = 2.6;
    head.castShadow = true;
    this.tigerGroup.add(head);

    // Salt-and-Pepper Side-Swept Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCrown.position.set(0, 2.66, -0.03);
    this.tigerGroup.add(hairCrown);

    // Groomed Silver Beard & Mustache
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const beard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.2, 0.28, 16),
      beardMat
    );
    beard.position.set(0, 2.42, 0.14);
    this.tigerGroup.add(beard);

    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.075, 0.12), beardMat);
    mustache.position.set(0, 2.51, 0.32);
    this.tigerGroup.add(mustache);

    // 24K Gold-Rimmed Aviator Sunglasses
    this.tigerGlassesGroup = new THREE.Group();
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.95,
      roughness: 0.08
    });
    for (const lx of [-0.13, 0.13]) {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.05, 16), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(lx, 0, 0);
      this.tigerGlassesGroup.add(lens);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 20), goldMat);
      rim.position.set(lx, 0, 0.01);
      this.tigerGlassesGroup.add(rim);
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), goldMat);
    bridge.position.set(0, 0.04, 0.02);
    this.tigerGlassesGroup.add(bridge);

    this.tigerGlassesGroup.position.set(0, 2.62, 0.33);
    this.tigerGroup.add(this.tigerGlassesGroup);

    // Traditional Pleated Kanchipuram Silk Veshti with Gold Zari Border
    const veshtiMat = new THREE.MeshStandardMaterial({
      map: this.veshtiFabricTex,
      roughness: 0.65
    });
    const veshti = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 1.05, 20), veshtiMat);
    veshti.position.y = 0.65;
    veshti.castShadow = true;
    this.tigerGroup.add(veshti);

    // Articulated Arms with Rolled Cuffs, Forearms, Gold Chronograph Watch & Rudraksha Wrist Beads
    this.tigerArmL = new THREE.Group();
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.48, 14), shirtMat);
    sleeveL.position.y = -0.2;
    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.45, 14), skinMat);
    forearmL.position.y = -0.58;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), skinMat);
    handL.position.y = -0.82;
    const watch = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.022, 8, 16), goldMat);
    watch.rotation.x = Math.PI / 2;
    watch.position.y = -0.72;
    this.tigerArmL.add(sleeveL, forearmL, handL, watch);
    this.tigerArmL.position.set(-0.56, 2.12, 0);
    this.tigerGroup.add(this.tigerArmL);

    this.tigerArmR = new THREE.Group();
    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.48, 14), shirtMat);
    sleeveR.position.y = -0.2;
    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.45, 14), skinMat);
    forearmR.position.y = -0.58;
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), skinMat);
    handR.position.y = -0.82;
    const rudraksha = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.022, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    rudraksha.rotation.x = Math.PI / 2;
    rudraksha.position.y = -0.72;
    this.tigerArmR.add(sleeveR, forearmR, handR, rudraksha);
    this.tigerArmR.position.set(0.56, 2.12, 0);
    this.tigerGroup.add(this.tigerArmR);

    // Articulated Legs & Leather Sandals
    const sandalMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    this.tigerLegL = new THREE.Group();
    const ankleL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), skinMat);
    ankleL.position.set(-0.18, 0.18, 0);
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.4), sandalMat);
    footL.position.set(-0.18, 0.05, 0.08);
    this.tigerLegL.add(ankleL, footL);

    this.tigerLegR = new THREE.Group();
    const ankleR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 12), skinMat);
    ankleR.position.set(0.18, 0.18, 0);
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.4), sandalMat);
    footR.position.set(0.18, 0.05, 0.08);
    this.tigerLegR.add(ankleR, footR);
    this.tigerGroup.add(this.tigerLegL, this.tigerLegR);

    // Clean Floating Tactical Callsign Pill above Tiger
    const badge = this.createTacticalFloatingBadge('TIGER PANDIAN', '#f59e0b');
    badge.position.set(0, 3.35, 0);
    this.tigerGroup.add(badge);

    this.tigerGroup.position.set(-5.2, 0, 0.5);
    this.scene.add(this.tigerGroup);
  }

  public setTigerAttire(attireId: string) {
    if (!this.tigerTorsoMesh) return;
    const mat = this.tigerTorsoMesh.material as THREE.MeshStandardMaterial;
    if (attireId === 'jailer_overcoat') {
      mat.color.setHex(0x3f4f3a);
    } else {
      mat.color.setHex(0xf8fafc);
    }
  }

  // Articulated 3D Model: Viji (Kanchipuram Maroon & Gold Silk Saree, Pallu Drape, Gold Jewelry, Jasmine Gajra)
  private buildVijiCharacter() {
    this.vijiGroup = new THREE.Group();

    const sareeMat = new THREE.MeshStandardMaterial({
      map: this.fabricSilkTex,
      roughness: 0.5
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.6 });

    const sareeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 1.38, 20), sareeMat);
    sareeSkirt.position.y = 0.69;
    sareeSkirt.castShadow = true;
    this.vijiGroup.add(sareeSkirt);

    const blouse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.33, 0.66, 16),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.55 })
    );
    blouse.position.y = 1.66;
    blouse.castShadow = true;
    this.vijiGroup.add(blouse);

    // Gold Zari Saree Pallu Sash draped diagonally across torso
    const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.95, 0.44), sareeMat);
    pallu.position.set(-0.08, 1.55, 0.02);
    pallu.rotation.z = 0.25;
    this.vijiGroup.add(pallu);

    // Arms with Gold Bangles
    for (const side of [-0.46, 0.46]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.72, 12), skinMat);
      arm.position.set(side, 1.52, 0.08);
      arm.rotation.z = side * -0.15;
      this.vijiGroup.add(arm);

      const bangle = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.02, 8, 16), goldMat);
      bangle.rotation.x = Math.PI / 2;
      bangle.position.set(side * 1.08, 1.25, 0.08);
      this.vijiGroup.add(bangle);
    }

    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.032, 8, 20), goldMat);
    necklace.rotation.x = Math.PI / 2.2;
    necklace.position.set(0, 1.96, 0.08);
    this.vijiGroup.add(necklace);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), skinMat);
    head.position.y = 2.28;
    head.castShadow = true;
    this.vijiGroup.add(head);

    const bindi = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    bindi.position.set(0, 2.34, 0.29);
    this.vijiGroup.add(bindi);

    const bun = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 })
    );
    bun.position.set(0, 2.3, -0.24);
    this.vijiGroup.add(bun);

    const jasmine = new THREE.Mesh(
      new THREE.TorusGeometry(0.21, 0.05, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.4 })
    );
    jasmine.position.set(0, 2.3, -0.23);
    this.vijiGroup.add(jasmine);

    const vijiBadge = this.createTacticalFloatingBadge('VIJI // PATROL', '#f43f5e');
    vijiBadge.position.set(0, 2.95, 0);
    this.vijiGroup.add(vijiBadge);

    // Volumetric Vision Cone on the Street
    const coneGeo = new THREE.ConeGeometry(4.8, 9.5, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.vijiVisionMesh = new THREE.Mesh(coneGeo, coneMat);
    this.vijiVisionMesh.rotation.x = -Math.PI / 2;
    this.vijiVisionMesh.position.set(0, 0.12, 4.8);
    this.vijiGroup.add(this.vijiVisionMesh);

    this.vijiGroup.position.set(-5.5, 0, 6.2);
    this.scene.add(this.vijiGroup);
  }

  private buildAutoRickshaw() {
    this.rickshawGroup = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      metalness: 0.55,
      roughness: 0.3
    });
    const hoodMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4
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

    const fender = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 0.25), chromeMat);
    fender.position.set(0, 0.65, 1.78);
    this.rickshawGroup.add(fender);

    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    light.position.set(0, 1.05, 1.75);
    this.rickshawGroup.add(light);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });

    for (const [wx, wy, wz] of [
      [0, 0.42, 1.25],
      [-1.12, 0.42, -0.85],
      [1.12, 0.42, -0.85]
    ]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      this.rickshawGroup.add(w);
    }

    this.rickshawGroup.position.set(-1.0, 0, -2.2);
    this.rickshawGroup.rotation.y = 0.4;
    this.scene.add(this.rickshawGroup);
  }

  private buildCoconutHazard() {
    const coconutGeo = new THREE.SphereGeometry(0.4, 20, 20);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.65,
      metalness: 0.1
    });
    this.coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    this.coconutMesh.scale.set(1.0, 1.18, 1.0);
    this.coconutMesh.position.set(-3.2, 0.42, -1.2);
    this.coconutMesh.castShadow = true;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.66, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.34;
    this.coconutMesh.add(ring);

    this.scene.add(this.coconutMesh);
  }

  private buildFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    const cartMat = new THREE.MeshStandardMaterial({ map: this.woodBarkTex, roughness: 0.8 });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 4.1), cartMat);
    cart.position.y = 0.85;
    cart.castShadow = true;
    this.fireworksGroup.add(cart);

    const colors = [0xdc2626, 0xd97706, 0xfacc15, 0x059669, 0x7c3aed];
    for (let i = 0; i < 10; i++) {
      const cHex = colors[i % colors.length];
      const tubeGroup = new THREE.Group();
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 1.25, 12),
        new THREE.MeshStandardMaterial({ color: cHex, roughness: 0.4 })
      );
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      nose.position.y = 0.78;
      tubeGroup.add(tube, nose);
      tubeGroup.position.set(-0.85 + (i % 5) * 0.42, 1.68, -1.1 + Math.floor(i / 5) * 1.6);
      this.fireworksGroup.add(tubeGroup);
    }

    this.fireworksGroup.position.set(6.8, 0, 9.5);
    this.scene.add(this.fireworksGroup);
  }

  // Detailed Articulated 3D Syndicate Bike Thugs + Realistic Street Motorcycles
  private buildThugs() {
    const thugConfigs = [
      { pos: new THREE.Vector3(3.2, 0, 3.8), jacketHex: 0x18181b, bikeHex: 0x991b1b, label: 'RAJA // BIKER' },
      { pos: new THREE.Vector3(5.4, 0, 4.8), jacketHex: 0x3b0764, bikeHex: 0x1e3a8a, label: 'KUMAR // ENFORCER' },
      { pos: new THREE.Vector3(2.8, 0, 6.4), jacketHex: 0x451a03, bikeHex: 0xb45309, label: 'MANI // BLADE' },
      { pos: new THREE.Vector3(5.8, 0, 7.2), jacketHex: 0x090d16, bikeHex: 0x7f1d1d, label: 'SANGU // CAPTAIN' }
    ];

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb07246, roughness: 0.65 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.14 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.88 });

    thugConfigs.forEach((cfg) => {
      const group = new THREE.Group();

      // Subtle Hostile Tactical Reticle under Feet
      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(0.58, 0.72, 24),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.04;
      group.add(baseRing);

      // Sculpted Biker Leather Jacket Torso
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.32, 1.12, 16),
        new THREE.MeshStandardMaterial({ color: cfg.jacketHex, roughness: 0.42, metalness: 0.25 })
      );
      torso.scale.set(1.12, 1.0, 0.72);
      torso.position.y = 1.55;
      torso.castShadow = true;
      group.add(torso);

      // Sculpted Head, Beard Stubble, Dark Shades & Crimson Bandana
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 18), skinMat);
      head.position.y = 2.35;
      head.castShadow = true;
      group.add(head);

      const bandana = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.055, 8, 18),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
      );
      bandana.rotation.x = Math.PI / 2;
      bandana.position.y = 2.48;
      group.add(bandana);

      const shades = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.11, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.1 })
      );
      shades.position.set(0, 2.36, 0.26);
      group.add(shades);

      // Left & Right Articulated Arms + Curved Steel Aruval Machete
      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.75, 12), skinMat);
      armL.position.set(-0.48, 1.62, 0);
      armL.rotation.z = 0.18;
      group.add(armL);

      const armRGroup = new THREE.Group();
      const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.75, 12), skinMat);
      armR.position.y = -0.32;
      armRGroup.add(armR);

      // Curved Steel Aruval Machete in Right Hand
      const macheteBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.15), chromeMat);
      macheteBlade.position.set(0, -0.68, 0.35);
      macheteBlade.rotation.x = 0.75;
      armRGroup.add(macheteBlade);

      armRGroup.position.set(0.48, 1.95, 0);
      group.add(armRGroup);

      // Legs & Combat Boots
      for (const lx of [-0.17, 0.17]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.11, 0.88, 12),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
        );
        leg.position.set(lx, 0.52, 0);
        leg.castShadow = true;
        group.add(leg);
      }

      // Detailed 3D Royal Enfield-style Street Motorcycle parked beside Enforcer
      const bike = new THREE.Group();
      const wheelF = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 12, 20), tireMat);
      wheelF.rotation.y = Math.PI / 2;
      wheelF.position.set(0, 0.42, 0.75);
      bike.add(wheelF);

      const wheelB = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 12, 20), tireMat);
      wheelB.rotation.y = Math.PI / 2;
      wheelB.position.set(0, 0.42, -0.75);
      bike.add(wheelB);

      const fuelTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.22, 0.78, 14),
        new THREE.MeshStandardMaterial({ color: cfg.bikeHex, metalness: 0.75, roughness: 0.22 })
      );
      fuelTank.rotation.x = Math.PI / 2;
      fuelTank.position.set(0, 0.92, 0.18);
      bike.add(fuelTank);

      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.16, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 })
      );
      seat.position.set(0, 0.82, -0.45);
      bike.add(seat);

      const forks = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 10), chromeMat);
      forks.position.set(0, 0.85, 0.62);
      forks.rotation.x = -0.32;
      bike.add(forks);

      const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 10), chromeMat);
      handlebar.rotation.z = Math.PI / 2;
      handlebar.position.set(0, 1.24, 0.48);
      bike.add(handlebar);

      const headlamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      headlamp.position.set(0, 1.08, 0.76);
      bike.add(headlamp);

      bike.position.set(-0.95, 0, -0.15);
      bike.rotation.y = 0.25;
      group.add(bike);

      // Clean Floating Tactical Badge
      const thugBadge = this.createTacticalFloatingBadge(cfg.label, '#ef4444');
      thugBadge.position.set(0, 2.95, 0);
      group.add(thugBadge);

      group.position.copy(cfg.pos);
      this.scene.add(group);

      this.thugs.push({
        group,
        alive: true,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        initialPos: cfg.pos.clone(),
        armR: armRGroup
      });
    });
  }

  public setChapterAtmosphere(levelId: number) {
    this.currentLevelId = levelId;
    if (!this.sunLight || !this.ambientLight) return;

    switch (levelId) {
      case 1:
      case 3:
        this.scene.background = new THREE.Color(0x140c08);
        this.scene.fog = new THREE.FogExp2(0x180e09, 0.011);
        this.sunLight.color.setHex(0xffa94d);
        this.sunLight.intensity = 2.25;
        soundManager.setTheme('stealth');
        break;
      case 4:
      case 7:
        this.scene.background = new THREE.Color(0x050b16);
        this.scene.fog = new THREE.FogExp2(0x050b16, 0.016);
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 1.5;
        soundManager.setTheme('port_rain');
        break;
      case 6:
      case 8:
        this.scene.background = new THREE.Color(0x160724);
        this.scene.fog = new THREE.FogExp2(0x160724, 0.014);
        this.sunLight.color.setHex(0xe879f9);
        this.sunLight.intensity = 1.75;
        soundManager.setTheme('carnival');
        break;
      case 9:
      case 10:
        this.scene.background = new THREE.Color(0x1c0a08);
        this.scene.fog = new THREE.FogExp2(0x1c0a08, 0.012);
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 2.3;
        soundManager.setTheme('hukum');
        break;
      default:
        this.scene.background = new THREE.Color(0x140d09);
        this.scene.fog = new THREE.FogExp2(0x140d09, 0.012);
        this.sunLight.color.setHex(0xfbbf24);
        this.sunLight.intensity = 2.0;
        soundManager.setTheme('stealth');
        break;
    }
  }

  public pingSniperTargets() {
    soundManager.playSniperPing();

    this.sniperBeams.forEach((b) => this.scene.remove(b));
    this.sniperBeams = [];
    this.sniperReticles.forEach((r) => this.scene.remove(r));
    this.sniperReticles = [];

    this.thugs.forEach((thug) => {
      if (!thug.alive) return;
      const beamMat = new THREE.LineBasicMaterial({ color: 0xff1e1e, linewidth: 2 });
      const pts = [
        new THREE.Vector3(thug.group.position.x - 11, 20, thug.group.position.z - 14),
        thug.group.position.clone().add(new THREE.Vector3(0, 2.2, 0))
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const beam = new THREE.Line(beamGeo, beamMat);
      this.scene.add(beam);
      this.sniperBeams.push(beam);

      const ret = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.85, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
      );
      ret.rotation.x = -Math.PI / 2;
      ret.position.copy(thug.group.position).add(new THREE.Vector3(0, 0.09, 0));
      this.scene.add(ret);
      this.sniperReticles.push(ret);
    });
  }

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

  public triggerSpectacleFlip() {
    if (this.state.hukumMode) return;
    this.state.hukumMode = true;
    this.state.phase = 'HUKUM';
    this.state.multiplier = 10;

    soundManager.playSpectacleFlipBassDrop();

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

    this.pingSniperTargets();

    if (this.onDialogue) this.onDialogue('lvl1_spec_flip');
    this.notifyState();
  }

  public update(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.state.phase === 'VICTORY' || this.state.phase === 'BUSTED') return;

    this.idleTime += delta;
    this.handleMovement(delta, keys);
    this.updateVijiPatrol(delta);

    // Subtle idle machete sway on live thugs
    this.thugs.forEach((thug, idx) => {
      if (thug.alive) {
        thug.armR.rotation.x = Math.sin(this.idleTime * 2.5 + idx) * 0.18;
      }
    });

    if (this.embers) {
      this.embers.rotation.y += delta * 0.06;
    }

    if (this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.18;
      this.rickshawGroup.position.z += 0.32;
      this.rickshawGroup.rotation.y = 0.65;

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

    // Smooth Low-Angle Cinema Camera Follow
    const targetCamX = this.tigerGroup.position.x - 5.5;
    const targetCamZ = this.tigerGroup.position.z + 15.5;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(
      this.tigerGroup.position.x + 3.5,
      2.2,
      this.tigerGroup.position.z + 1.0
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

    this.tigerGroup.position.set(-5.2, 0, 0.5);
    this.rickshawGroup.position.set(-1.0, 0, -2.2);
    this.rickshawGroup.rotation.y = 0.4;
    this.coconutMesh.position.set(-3.2, 0.42, -1.2);

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
