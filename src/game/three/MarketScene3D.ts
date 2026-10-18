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
  public thugs: { group: THREE.Group; alive: boolean; vel: THREE.Vector3; rotVel: THREE.Vector3 }[] = [];
  public sniperBeams: THREE.Line[] = [];
  public fireworkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

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

  private startTime: number = 0;
  private walkTime: number = 0;
  private tigerGlasses!: THREE.Mesh;
  private tigerArmL!: THREE.Group;
  private tigerArmR!: THREE.Group;

  // Callbacks
  public onStateUpdate?: (state: Game3DState) => void;
  public onDialogue?: (key: string) => void;
  public onVictory?: (summary: any) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    // Cinematic 3D Perspective Camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-14, 18, 22);
    this.camera.lookAt(0, 0, 0);

    this.initLights();
    this.buildMarketEnvironment();
    this.buildTigerCharacter();
    this.buildVijiCharacter();
    this.buildAutoRickshaw();
    this.buildCoconutHazard();
    this.buildFireworksCart();
    this.buildThugs();

    this.startTime = Date.now();
  }

  private initLights() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.6);
    this.scene.add(ambientLight);

    // Warm Sun Directional Light (Golden Hour Cinema)
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    sunLight.position.set(-15, 25, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Streetlamp Accent Light (Warm Yellow)
    const streetLight = new THREE.PointLight(0xfbbf24, 1.5, 18);
    streetLight.position.set(2, 6, 4);
    streetLight.castShadow = true;
    this.scene.add(streetLight);
  }

  private buildMarketEnvironment() {
    // Ground Street (Asphalt)
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Yellow Road Lanes
    const roadMarkGeo = new THREE.PlaneGeometry(0.3, 30);
    const roadMarkMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
    const roadMark = new THREE.Mesh(roadMarkGeo, roadMarkMat);
    roadMark.rotation.x = -Math.PI / 2;
    roadMark.position.set(0, 0.02, 0);
    this.scene.add(roadMark);

    // Sidewalk Platform (Raised Curb)
    const curbGeo = new THREE.BoxGeometry(10, 0.3, 40);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const sidewalk = new THREE.Mesh(curbGeo, curbMat);
    sidewalk.position.set(-10, 0.15, 0);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    // Market Stalls with Striped Canopies
    this.createMarketStall(-8, 0, -6, 0xef4444);
    this.createMarketStall(-8, 0, 2, 0x3b82f6);
    this.createMarketStall(-8, 0, 10, 0x10b981);

    // Street Lamp
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(2, 3, 4);
    pole.castShadow = true;
    this.scene.add(pole);

    const lampHeadGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
    lampHead.position.set(2, 6, 4);
    this.scene.add(lampHead);
  }

  private createMarketStall(x: number, y: number, z: number, canopyColor: number) {
    const stall = new THREE.Group();

    // Wooden table
    const tableGeo = new THREE.BoxGeometry(3, 1.2, 4);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.6;
    table.castShadow = true;
    table.receiveShadow = true;
    stall.add(table);

    // Four canopy poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const polePositions = [
      [-1.3, 1.5, -1.8],
      [1.3, 1.5, -1.8],
      [-1.3, 1.5, 1.8],
      [1.3, 1.5, 1.8]
    ];
    polePositions.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3), poleMat);
      p.position.set(px, py + 0.6, pz);
      stall.add(p);
    });

    // Striped Canopy
    const canopyGeo = new THREE.ConeGeometry(2.5, 0.8, 4);
    const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.5 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 3.2;
    canopy.rotation.y = Math.PI / 4;
    stall.add(canopy);

    stall.position.set(x, y, z);
    this.scene.add(stall);
  }

  // 3D Model: "Tiger" Muthuvel Pandian (Superstar Rajinikanth style)
  private buildTigerCharacter() {
    this.tigerGroup = new THREE.Group();

    // Torso (Crisp White Linen Shirt)
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.2, 0.5);
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    this.tigerGroup.add(torso);

    // Collar
    const collarGeo = new THREE.BoxGeometry(0.7, 0.2, 0.4);
    const collar = new THREE.Mesh(collarGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    collar.position.set(0, 2.2, 0.05);
    this.tigerGroup.add(collar);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.5;
    head.castShadow = true;
    this.tigerGroup.add(head);

    // Silver side-swept hair
    const hairGeo = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.6, -0.05);
    this.tigerGroup.add(hair);

    // Silver beard & mustache
    const beardGeo = new THREE.BoxGeometry(0.4, 0.25, 0.2);
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
    const beard = new THREE.Mesh(beardGeo, beardMat);
    beard.position.set(0, 2.35, 0.25);
    this.tigerGroup.add(beard);

    // Aviator Sunglasses (Dark tint with golden rims)
    const glassesGroup = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.9,
      roughness: 0.1
    });
    this.tigerGlasses = new THREE.Mesh(frameGeo, glassesMat);
    glassesGroup.add(this.tigerGlasses);
    glassesGroup.position.set(0, 2.52, 0.32);
    this.tigerGroup.add(glassesGroup);

    // Traditional Veshti with Golden Border
    const veshtiGeo = new THREE.CylinderGeometry(0.45, 0.55, 1.2, 16);
    const veshtiMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
    const veshti = new THREE.Mesh(veshtiGeo, veshtiMat);
    veshti.position.y = 0.6;
    veshti.castShadow = true;
    this.tigerGroup.add(veshti);

    // Gold Veshti Zari Border
    const borderGeo = new THREE.CylinderGeometry(0.53, 0.56, 0.1, 16);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = 0.15;
    this.tigerGroup.add(border);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
    this.tigerArmL = new THREE.Group();
    const meshArmL = new THREE.Mesh(armGeo, shirtMat);
    meshArmL.position.y = -0.35;
    this.tigerArmL.add(meshArmL);
    this.tigerArmL.position.set(-0.6, 2.0, 0);
    this.tigerGroup.add(this.tigerArmL);

    this.tigerArmR = new THREE.Group();
    const meshArmR = new THREE.Mesh(armGeo, shirtMat);
    meshArmR.position.y = -0.35;
    this.tigerArmR.add(meshArmR);
    this.tigerArmR.position.set(0.6, 2.0, 0);
    this.tigerGroup.add(this.tigerArmR);

    // Position Tiger in alley
    this.tigerGroup.position.set(-6, 0, -2);
    this.scene.add(this.tigerGroup);
  }

  // 3D Model: Viji with dynamic volumetric vision cone
  private buildVijiCharacter() {
    this.vijiGroup = new THREE.Group();

    // Saree Body (Traditional Maroon / Gold)
    const sareeGeo = new THREE.ConeGeometry(0.65, 2.0, 16);
    const sareeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
    const saree = new THREE.Mesh(sareeGeo, sareeMat);
    saree.position.y = 1.0;
    saree.castShadow = true;
    this.vijiGroup.add(saree);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0xd4a373 }));
    head.position.y = 2.2;
    head.castShadow = true;
    this.vijiGroup.add(head);

    // Hair bun with Jasmine flowers
    const bunGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const bun = new THREE.Mesh(bunGeo, new THREE.MeshStandardMaterial({ color: 0x18181b }));
    bun.position.set(0, 2.3, -0.25);
    this.vijiGroup.add(bun);

    const jasmineGeo = new THREE.TorusGeometry(0.22, 0.05, 8, 16);
    const jasmine = new THREE.Mesh(jasmineGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    jasmine.position.set(0, 2.3, -0.25);
    this.vijiGroup.add(jasmine);

    // Vision Cone (3D Projected Light Mesh)
    const coneGeo = new THREE.ConeGeometry(5, 10, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.vijiVisionMesh = new THREE.Mesh(coneGeo, coneMat);
    this.vijiVisionMesh.rotation.x = -Math.PI / 2;
    this.vijiVisionMesh.position.set(0, 0.1, 5);
    this.vijiGroup.add(this.vijiVisionMesh);

    this.vijiGroup.position.set(-6, 0, 6);
    this.scene.add(this.vijiGroup);
  }

  // 3D Model: Auto-Rickshaw
  private buildAutoRickshaw() {
    this.rickshawGroup = new THREE.Group();

    // Chassis (Green body)
    const chassisGeo = new THREE.BoxGeometry(2.2, 1.2, 3.4);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.6 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.0;
    chassis.castShadow = true;
    this.rickshawGroup.add(chassis);

    // Yellow Canopy Hood
    const hoodGeo = new THREE.BoxGeometry(2.1, 0.9, 2.6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 2.0, -0.2);
    hood.castShadow = true;
    this.rickshawGroup.add(hood);

    // Windshield
    const glassGeo = new THREE.PlaneGeometry(1.9, 0.8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 2.0, 1.15);
    this.rickshawGroup.add(glass);

    // Headlight
    const lightGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 1.0, 1.75);
    this.rickshawGroup.add(light);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    const wheelFront = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFront.rotation.z = Math.PI / 2;
    wheelFront.position.set(0, 0.4, 1.2);
    wheelFront.castShadow = true;
    this.rickshawGroup.add(wheelFront);

    const wheelBackL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelBackL.rotation.z = Math.PI / 2;
    wheelBackL.position.set(-1.1, 0.4, -0.8);
    wheelBackL.castShadow = true;
    this.rickshawGroup.add(wheelBackL);

    const wheelBackR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelBackR.rotation.z = Math.PI / 2;
    wheelBackR.position.set(1.1, 0.4, -0.8);
    wheelBackR.castShadow = true;
    this.rickshawGroup.add(wheelBackR);

    // Position on incline
    this.rickshawGroup.position.set(-1, 0, -3);
    this.rickshawGroup.rotation.y = 0.4;
    this.scene.add(this.rickshawGroup);
  }

  // 3D Model: Coconut Hazard
  private buildCoconutHazard() {
    const coconutGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coconutMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d,
      roughness: 0.8,
      metalness: 0.1
    });
    this.coconutMesh = new THREE.Mesh(coconutGeo, coconutMat);
    this.coconutMesh.position.set(-3.5, 0.35, -2);
    this.coconutMesh.castShadow = true;
    this.scene.add(this.coconutMesh);
  }

  // 3D Model: Diwali Fireworks Cart
  private buildFireworksCart() {
    this.fireworksGroup = new THREE.Group();

    // Wooden Cart Frame
    const cartGeo = new THREE.BoxGeometry(2.5, 0.8, 4);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.y = 0.8;
    cart.castShadow = true;
    this.fireworksGroup.add(cart);

    // Colorful Diwali Firework Rocket Tubes
    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7];
    for (let i = 0; i < 8; i++) {
      const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
      const tubeMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(-0.8 + (i % 4) * 0.5, 1.6, -1.2 + Math.floor(i / 4) * 1.5);
      tube.castShadow = true;
      this.fireworksGroup.add(tube);
    }

    this.fireworksGroup.position.set(7, 0, 10);
    this.scene.add(this.fireworksGroup);
  }

  // 3D Models: 4 Bike Thugs
  private buildThugs() {
    const thugPositions = [
      new THREE.Vector3(3.5, 0, 4),
      new THREE.Vector3(5.0, 0, 5),
      new THREE.Vector3(3.0, 0, 6.5),
      new THREE.Vector3(6.0, 0, 7.5)
    ];

    thugPositions.forEach((pos) => {
      const group = new THREE.Group();

      // Body (Black shirt & denim vest)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.1, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      body.position.y = 1.3;
      body.castShadow = true;
      group.add(body);

      // Head & Red Bandana
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xb45309 })
      );
      head.position.y = 2.0;
      group.add(head);

      const bandana = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.06, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      bandana.rotation.x = Math.PI / 2;
      bandana.position.y = 2.15;
      group.add(bandana);

      // Jeans
      const legs = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.8, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x0369a1 })
      );
      legs.position.y = 0.4;
      legs.castShadow = true;
      group.add(legs);

      group.position.copy(pos);
      this.scene.add(group);

      this.thugs.push({
        group,
        alive: true,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3()
      });
    });
  }

  // Kick Coconut Logic
  public kickCoconut() {
    if (this.state.coconutKicked) return;
    this.state.coconutKicked = true;

    soundManager.playCoconutKick();

    // Coconut rolls towards rickshaw
    const target = this.rickshawGroup.position.clone().add(new THREE.Vector3(0, 0.35, 0));
    const start = this.coconutMesh.position.clone();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.08;
      this.coconutMesh.position.lerpVectors(start, target, progress);
      this.coconutMesh.rotation.x += 0.4;

      if (progress >= 1) {
        clearInterval(interval);
        this.releaseRickshawHandbrake();
      }
    }, 16);

    if (this.onDialogue) this.onDialogue('lvl1_rickshaw_ready');
  }

  // Release Rickshaw Handbrake
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
    this.state.multiplier = 10; // HUKUM x10

    soundManager.playSpectacleFlipBassDrop();

    // 360° Glasses Flip Animation
    let flipAngle = 0;
    const flipInterval = setInterval(() => {
      flipAngle += 0.6;
      if (this.tigerGlasses) {
        this.tigerGlasses.rotation.y = flipAngle;
      }
      if (flipAngle >= Math.PI * 4) {
        clearInterval(flipInterval);
        if (this.tigerGlasses) this.tigerGlasses.rotation.y = 0;
      }
    }, 16);

    // Call 3D Red Sniper Beams
    this.thugs.forEach((thug) => {
      const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
      const pts = [
        new THREE.Vector3(thug.group.position.x - 10, 20, thug.group.position.z - 15),
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

    // Movement
    this.handleMovement(delta, keys);

    // Viji Patrol & Vision Detection
    this.updateVijiPatrol(delta);

    // Rickshaw Incline Rolling
    if (this.state.rickshawRolling && !this.state.fireworksExploded) {
      this.rickshawGroup.position.x += 0.18;
      this.rickshawGroup.position.z += 0.32;
      this.rickshawGroup.rotation.y = 0.65;

      // Check collision with thugs
      this.thugs.forEach((thug) => {
        if (thug.alive) {
          const dist = this.rickshawGroup.position.distanceTo(thug.group.position);
          if (dist < 2.5) {
            thug.alive = false;
            soundManager.playSniperShot();
            this.state.aura += 1250 * this.state.multiplier;

            // Launch thug into air (3D Ragdoll trajectory)
            thug.vel.set(
              (Math.random() - 0.5) * 8 + 4,
              12 + Math.random() * 5,
              (Math.random() - 0.5) * 8 + 6
            );
            thug.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
          }
        }
      });

      // Check collision with fireworks cart
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
        thug.vel.y -= 25 * delta; // Gravity

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
      p.vel.y -= 12 * delta; // Gravity
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fireworkParticles.splice(i, 1);
      }
    }

    // Smooth Camera Follow
    const targetCamX = this.tigerGroup.position.x - 12;
    const targetCamZ = this.tigerGroup.position.z + 18;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(
      this.tigerGroup.position.x + 3,
      1.5,
      this.tigerGroup.position.z + 2
    );
  }

  private handleMovement(delta: number, keys: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    const speed = this.state.hukumMode ? 3.5 : 5.5; // Swagger speed
    const move = new THREE.Vector3();

    if (keys.left) move.x -= 1;
    if (keys.right) move.x += 1;
    if (keys.up) move.z -= 1;
    if (keys.down) move.z += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      this.tigerGroup.position.addScaledVector(move, speed * delta);
      this.tigerGroup.rotation.y = Math.atan2(move.x, move.z);

      // Swagger walking animation
      this.walkTime += delta * 8;
      this.tigerArmL.rotation.x = Math.sin(this.walkTime) * 0.4;
      this.tigerArmR.rotation.x = -Math.sin(this.walkTime) * 0.4;
      this.tigerGroup.position.y = Math.abs(Math.sin(this.walkTime)) * 0.1;
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

    // Calculate distance and angle to Tiger
    const toTiger = this.tigerGroup.position.clone().sub(this.vijiGroup.position);
    const dist = toTiger.length();

    // Viji's forward vector
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vijiAngle);
    const dot = forward.dot(toTiger.normalize());

    // If Tiger is inside Viji's vision cone (within 9 units & within 45 degrees)
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

    // Update vision cone color
    const coneColor = this.state.vijiSuspicion > 50 ? 0xef4444 : 0xfacc15;
    (this.vijiVisionMesh.material as THREE.MeshBasicMaterial).color.setHex(coneColor);

    this.notifyState();
  }

  private triggerFireworksExplosion() {
    if (this.state.fireworksExploded) return;
    this.state.fireworksExploded = true;

    soundManager.playExplosion();

    // Remove sniper beams
    this.sniperBeams.forEach(b => this.scene.remove(b));
    this.sniperBeams = [];

    // Create 3D Exploding Fireworks Particle Fountains
    const colors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xffffff];
    for (let i = 0; i < 60; i++) {
      const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.copy(this.fireworksGroup.position).add(new THREE.Vector3(0, 1.5, 0));
      this.scene.add(p);

      this.fireworkParticles.push({
        mesh: p,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          8 + Math.random() * 12,
          (Math.random() - 0.5) * 16
        ),
        life: 1.2 + Math.random() * 0.8
      });
    }

    // Eliminate all thugs
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

    this.tigerGroup.position.set(-6, 0, -2);
    this.rickshawGroup.position.set(-1, 0, -3);
    this.coconutMesh.position.set(-3.5, 0.35, -2);

    this.thugs.forEach((thug, idx) => {
      thug.alive = true;
      thug.group.rotation.set(0, 0, 0);
      const positions = [
        new THREE.Vector3(3.5, 0, 4),
        new THREE.Vector3(5.0, 0, 5),
        new THREE.Vector3(3.0, 0, 6.5),
        new THREE.Vector3(6.0, 0, 7.5)
      ];
      thug.group.position.copy(positions[idx]);
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
