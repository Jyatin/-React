import * as THREE from 'three';

export function createDragonScaleBumpMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Fill dark background
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Draw overlapping reptilian scale pattern
  const rows = 32;
  const cols = 32;
  const tileW = 512 / cols;
  const tileH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2 === 0) ? 0 : tileW / 2;
    for (let c = -1; c < cols + 1; c++) {
      const x = c * tileW + offsetX;
      const y = r * tileH;

      // Draw scale shape with radial height gradient for bump mapping
      const grad = ctx.createRadialGradient(
        x + tileW / 2, y + tileH / 2, 0,
        x + tileW / 2, y + tileH / 2, tileW * 0.75
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#999999');
      grad.addColorStop(1, '#444444');

      ctx.beginPath();
      ctx.ellipse(x + tileW / 2, y + tileH / 2, tileW * 0.55, tileH * 0.75, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Scale rim outline accent
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createWingMembraneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark ruby leather background
  ctx.fillStyle = '#3a0812';
  ctx.fillRect(0, 0, 512, 512);

  // Draw organic wing vein network
  ctx.strokeStyle = '#5e1020';
  ctx.lineWidth = 3;

  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = 0;
    ctx.moveTo(x, y);

    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 80;
      y += 90 + Math.random() * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
