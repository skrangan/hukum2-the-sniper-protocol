import * as THREE from 'three';
import { MarketScene3D, Game3DState } from './MarketScene3D';
import { soundManager } from '../audio/SoundManager';

export class ThreeGameManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private marketScene: MarketScene3D;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Keyboard & virtual touch input tracking
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false
  };
  private touchVector = { x: 0, z: 0 };

  constructor(
    container: HTMLElement,
    onStateUpdate: (state: Game3DState) => void,
    onDialogue: (key: string) => void,
    onVictory: (summary: any) => void
  ) {
    this.container = container;
    this.clock = new THREE.Clock();

    // WebGL Renderer with High Quality Shadows & Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    container.appendChild(this.renderer.domElement);

    // Initialize 3D Market Scene
    this.marketScene = new MarketScene3D();
    this.marketScene.onStateUpdate = onStateUpdate;
    this.marketScene.onDialogue = onDialogue;
    this.marketScene.onVictory = onVictory;

    this.bindEvents();
    this.startLoop();
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Raycast click / tap for 3D hazard interactions & tap-to-walk on mobile/desktop
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.marketScene.camera.aspect = width / height;
    this.marketScene.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    soundManager.startCinematicBgm();
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        this.marketScene.clearTapTarget();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        this.marketScene.clearTapTarget();
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.keys.up = true;
        this.marketScene.clearTapTarget();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.down = true;
        this.marketScene.clearTapTarget();
        break;
      case 'Space':
        e.preventDefault();
        this.marketScene.triggerSpectacleFlip();
        break;
      case 'KeyE':
        this.marketScene.kickCoconut();
        break;
      case 'KeyQ':
        this.marketScene.triggerDistraction();
        break;
      case 'Digit1':
        this.marketScene.pingSniperTargets();
        break;
      case 'Digit2':
        this.marketScene.kickCoconut();
        break;
      case 'Digit3':
        this.marketScene.summonCameo();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.keys.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.down = false;
        break;
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    soundManager.startCinematicBgm();

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.marketScene.camera);

    // 1. Check if player tapped/clicked the coconut or an interactive hazard
    if (this.marketScene.coconutMesh && this.marketScene.coconutMesh.visible) {
      const intersects = raycaster.intersectObject(this.marketScene.coconutMesh, true);
      if (intersects.length > 0) {
        this.marketScene.kickCoconut();
        return;
      }
    }

    // 2. Otherwise raycast onto the street ground plane (y = 0) for tap-to-walk
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
      this.marketScene.setTapTarget(hitPoint);
    }
  };

  private startLoop = () => {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.marketScene.update(delta, this.keys, this.touchVector);
      this.renderer.render(this.marketScene.scene, this.marketScene.camera);
    };

    animate();
  };

  public setTouchMoveVector(dx: number, dz: number) {
    soundManager.startCinematicBgm();
    this.touchVector.x = dx;
    this.touchVector.z = dz;
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      this.marketScene.clearTapTarget();
    }
  }

  public triggerSpectacleFlip() {
    soundManager.startCinematicBgm();
    this.marketScene.triggerSpectacleFlip();
  }

  public pingSniperTargets() {
    soundManager.startCinematicBgm();
    this.marketScene.pingSniperTargets();
  }

  public kickCoconut() {
    soundManager.startCinematicBgm();
    this.marketScene.kickCoconut();
  }

  public triggerDistraction() {
    soundManager.startCinematicBgm();
    this.marketScene.triggerDistraction();
  }

  public summonCameo(cameoId?: string) {
    soundManager.startCinematicBgm();
    this.marketScene.summonCameo(cameoId);
  }

  public setChapterAtmosphere(levelId: number) {
    this.marketScene.setChapterAtmosphere(levelId);
  }

  public loadChapter(levelId: number) {
    this.marketScene.loadChapter(levelId);
  }

  public setTigerAttire(attireId: string) {
    this.marketScene.setTigerAttire(attireId);
  }

  public retry() {
    this.marketScene.retry();
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
