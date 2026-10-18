import * as THREE from 'three';
import { MarketScene3D, Game3DState } from './MarketScene3D';

export class ThreeGameManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private marketScene: MarketScene3D;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Keyboard input tracking
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  constructor(
    container: HTMLElement,
    onStateUpdate: (state: Game3DState) => void,
    onDialogue: (key: string) => void,
    onVictory: (summary: any) => void
  ) {
    this.container = container;
    this.clock = new THREE.Clock();

    // WebGL Renderer with High Quality Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

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

    // Raycast click for 3D interactions (e.g. clicking coconut)
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
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.keys.up = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.down = true;
        break;
      case 'Space':
        e.preventDefault();
        this.marketScene.triggerSpectacleFlip();
        break;
      case 'KeyE':
        this.marketScene.kickCoconut();
        break;
      case 'Digit1':
        this.marketScene.triggerSpectacleFlip();
        break;
      case 'Digit2':
        this.marketScene.kickCoconut();
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

  private onPointerDown = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.marketScene.camera);

    const intersects = raycaster.intersectObject(this.marketScene.coconutMesh);
    if (intersects.length > 0) {
      this.marketScene.kickCoconut();
    }
  };

  private startLoop = () => {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.marketScene.update(delta, this.keys);
      this.renderer.render(this.marketScene.scene, this.marketScene.camera);
    };

    animate();
  };

  public triggerSpectacleFlip() {
    this.marketScene.triggerSpectacleFlip();
  }

  public kickCoconut() {
    this.marketScene.kickCoconut();
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
