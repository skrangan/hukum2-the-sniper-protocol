// Procedural High-Resolution Texture Generator for Realistic 3D Environment & Characters
import * as THREE from 'three';

export class TextureGenerator {
  // 1. Realistic Asphalt Road with Aggregate Grain & Markings
  public static createAsphaltTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base dark weathered asphalt
    ctx.fillStyle = '#1c1f26';
    ctx.fillRect(0, 0, 1024, 1024);

    // Aggregate grain & noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Cracks & weathering
    ctx.strokeStyle = '#111317';
    ctx.lineWidth = 1.5;
    for (let c = 0; c < 12; c++) {
      ctx.beginPath();
      let cx = Math.random() * 1024;
      let cy = Math.random() * 1024;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (Math.random() - 0.5) * 80;
        cy += (Math.random() - 0.5) * 80;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Double Center Yellow Lines
    ctx.fillStyle = '#eab308';
    ctx.fillRect(504, 0, 8, 1024);
    ctx.fillRect(520, 0, 8, 1024);

    // White Pedestrian Zebra Crossing Lines at one end
    ctx.fillStyle = '#e2e8f0';
    for (let z = 0; z < 8; z++) {
      ctx.fillRect(150 + z * 100, 750, 60, 220);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 2. Concrete Sidewalk with Cobblestone Pavers
  public static createSidewalkTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base concrete
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 512, 512);

    // Stone paving slabs grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    const tileSize = 64;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Micro surface noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 25;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 6);
    return texture;
  }

  // 3. Authentic Tamil Shop Signboard (Tea Stall / Grocery)
  public static createShopSignboardTexture(titleTamil: string, subtitleEng: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    // Metallic frame & background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 160);
    ctx.fillStyle = color;
    ctx.fillRect(6, 6, 500, 148);

    // Inner gold border
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 488, 136);

    // Tamil Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(titleTamil, 256, 68);

    // English Subtitle
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(subtitleEng, 256, 114);

    return new THREE.CanvasTexture(canvas);
  }

  // 4. Colonial Madras Brickwork Facade
  public static createBrickBuildingTexture(baseHue: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = baseHue;
    ctx.fillRect(0, 0, 512, 512);

    // Weathered plaster layers
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 120, Math.random() * 60);
    }

    // Windows with ornate shutters
    const windowCols = [100, 260, 420];
    const windowRows = [120, 320];

    windowRows.forEach((wy) => {
      windowCols.forEach((wx) => {
        // Wooden Arch Frame
        ctx.fillStyle = '#3f2110';
        ctx.fillRect(wx - 40, wy - 55, 80, 110);
        // Glass panes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(wx - 32, wy - 47, 64, 94);
        // Window mullions
        ctx.fillStyle = '#d97706';
        ctx.fillRect(wx - 32, wy, 64, 4);
        ctx.fillRect(wx - 2, wy - 47, 4, 94);
      });
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 5. Authentic Auto-Rickshaw Number Plate & Decals
  public static createRickshawDecalTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Yellow background with black border
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 120);

    // Number plate typography
    ctx.fillStyle = '#000000';
    ctx.font = '900 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TN 01 AB 1975', 128, 76);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('• TAMIL NADU TOURIST •', 128, 108);

    return new THREE.CanvasTexture(canvas);
  }

  // 6. Diwali Fireworks Box Texture
  public static createFireworkBoxTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Red festive background
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 256, 256);

    // Golden sparkles
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 240, 240);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 32px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANIL CRACKERS', 128, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('1000 WALA', 128, 130);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('STANDARD DIWALI SPECIAL', 128, 180);

    return new THREE.CanvasTexture(canvas);
  }
}
